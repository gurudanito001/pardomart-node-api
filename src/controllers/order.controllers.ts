

import { Request, Response } from 'express';
import {
  getOrderByIdService,
  getOrdersByUserIdService,
  updateOrderStatusService,
  updateOrderService,
} from '../services/order.service'; // Adjust the path if needed
import { Order, PaymentMethods, PaymentStatus, OrderStatus, DeliveryAddress } from '@prisma/client';
import { AuthenticatedRequest } from './vendor.controller';
import { createManyCartItems, getCartItemsByCartId, updateCartItemsWithOrderId } from '../models/cartItem.model';
import { createOrder, getOrderById } from '../models/order.model';
import { getVendorProductById } from '../models/product.model';
import { getCurrentFees } from '../services/fee.service';
import { FeeType, ShoppingMethod, DeliveryMethod } from '@prisma/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { getVendorById } from '../services/vendor.service';
import { createDeliveryAddressService } from '../services/deliveryAddress.service';
import { CreateDeliveryAddressPayload } from '../models/deliveryAddress.model';


// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// --- Helper function to map Dayjs day index to Prisma's Days enum ---
// Assuming your Days enum is like: enum Days { SUNDAY, MONDAY, TUESDAY, ... }
const getDayEnumFromDayjs = (dayjsDayIndex: number): string => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[dayjsDayIndex];
};

// --- Order Controllers ---

/**
 * Controller for creating a new order.
 * POST /orders
 */
interface OrderItem {
  vendorProductId: string
  quantity: number
}
export const createOrderController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    let {
      vendorId,
      paymentMethod,
      shippingAddressId,
      newShippingAddress,
      deliveryInstructions,
      orderItems,
      shoppingMethod,
      deliveryMethod,
      scheduledShoppingStartTime
    } = req.body as {vendorId: string, paymentMethod: PaymentMethods, shippingAddressId?: string, newShippingAddress?: CreateDeliveryAddressPayload, deliveryInstructions: string, orderItems: OrderItem[], shoppingMethod: ShoppingMethod, deliveryMethod: DeliveryMethod, scheduledShoppingStartTime: Date };


    // --- 1. Validate scheduledShoppingStartTime and Vendor Hours ---
    if (scheduledShoppingStartTime) {
      const parsedScheduledTime = dayjs.utc(scheduledShoppingStartTime); // It's already UTC

      if (!parsedScheduledTime.isValid()) {
        return res.status(400).json({ error: 'Invalid scheduled shopping start time format.' });
      }

      // Fetch vendor and their opening hours
      const vendor = await getVendorById(vendorId);

      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found.' });
      }

      if (!vendor.timezone) {
        // This is a critical point: if vendor doesn't have a timezone, validation is impossible.
        // You might default to a specific timezone or throw an error.
        // For robust validation, make timezone mandatory for vendors.
        console.warn(`Vendor ${vendorId} does not have a timezone set. Skipping time validation.`);
        // return res.status(500).json({ error: 'Vendor timezone not configured. Cannot validate shopping time.' });
      }

      // Determine the day of the week for the scheduled time in the vendor's local timezone
      const vendorLocalDayjs = parsedScheduledTime.tz(vendor.timezone || 'UTC'); // Use vendor's timezone, or default to UTC
      const dayOfWeek = getDayEnumFromDayjs(vendorLocalDayjs.day()); // 0 (Sunday) to 6 (Saturday)

      const openingHoursToday = vendor.openingHours.find(
        (h) => h.day === dayOfWeek
      );

      if (!openingHoursToday || !openingHoursToday.open || !openingHoursToday.close) {
        console.log(dayOfWeek, vendor.openingHours)
        return res.status(400).json({
          error: `Vendor is closed or has no defined hours for ${dayOfWeek}.`
        });
      }

      // Construct full Date objects for open and close times in the vendor's local timezone,
      // then convert them to UTC for comparison with scheduledShoppingStartTime (which is UTC).
      // We assume open/close are "HH:mm" strings.
      const [openHours, openMinutes] = openingHoursToday.open.split(':').map(Number);
      const [closeHours, closeMinutes] = openingHoursToday.close.split(':').map(Number);

      // Create dayjs objects for vendor's local open and close times on the scheduled date
      // These are first created in the vendor's local timezone, then converted to UTC
      let vendorOpenTimeUTC = vendorLocalDayjs.hour(openHours).minute(openMinutes).second(0).millisecond(0).utc();
      let vendorCloseTimeUTC = vendorLocalDayjs.hour(closeHours).minute(closeMinutes).second(0).millisecond(0).utc();

      // Handle cases where closing time is on the next day (e.g., 22:00 - 02:00)
      // This assumes the `open` and `close` times are relative to the same day.
      // If close is numerically smaller than open, it means it rolls over to the next day.
      if (vendorCloseTimeUTC.isBefore(vendorOpenTimeUTC)) {
        vendorCloseTimeUTC = vendorCloseTimeUTC.add(1, 'day');
      }

      // Calculate 2 hours before closing time
      const twoHoursBeforeCloseUTC = vendorCloseTimeUTC.subtract(2, 'hour');

      // Perform the validation check
      if (parsedScheduledTime.isBefore(vendorOpenTimeUTC) || parsedScheduledTime.isAfter(twoHoursBeforeCloseUTC)) {
        return res.status(400).json({
          error: `Scheduled shopping time must be between ${openingHoursToday.open} and ${twoHoursBeforeCloseUTC.tz(vendor.timezone || 'UTC').format('HH:mm')} vendor local time.`
        });
      }

      if (parsedScheduledTime.isBefore(dayjs.utc())) {
        return res.status(400).json({ error: 'Scheduled shopping time cannot be in the past.' });
      }
    }
    // --- End Validation ---


    // calculate total amount and pass it to create order fields
    let totalAmount = 0;
    await Promise.all(orderItems.map(async (item) => {
      const vendorProduct = await getVendorProductById(item.vendorProductId);
      if (vendorProduct) {
        totalAmount += vendorProduct.price;
      }
    }));

    
    // Fetch only the service fee
    const serviceFeeObject = await getCurrentFees(FeeType.SERVICE);
    let serviceFee = 0; // Default to 0 if no active service fee is found

    if (serviceFeeObject && !Array.isArray(serviceFeeObject)) {
      // Ensure it's a single Fee object and not an array
      serviceFee = serviceFeeObject.amount;
    }

    // --- Address Handling Logic ---
    if (!shippingAddressId && newShippingAddress) {
      // If no existing address ID is provided, but new address details are, create it
      // Ensure newShippingAddress has userId, and other required fields
      if (!newShippingAddress.addressLine1 || !newShippingAddress.city) {
        return res.status(400).json({ error: 'New shipping address requires addressLine1 and city.' });
      }
      
      const payloadForNewAddress: CreateDeliveryAddressPayload = {
        ...newShippingAddress,
        userId: userId, // CRITICAL: Link the new address to the authenticated user
      };

      const createdAddress = await createDeliveryAddressService(payloadForNewAddress);
      shippingAddressId = createdAddress.id; // Use the ID of the newly created address
    } else if (!shippingAddressId) {
      // If no shippingAddressId and no newShippingAddress, and deliveryMethod requires it
      // (e.g., DELIVERY_PERSON), then it's an error.
      // If deliveryMethod is CUSTOMER_PICKUP, then shippingAddressId might be null.
      if (deliveryMethod === 'DELIVERY_PERSON') { // Adjust based on your DeliveryMethod enum
         return res.status(400).json({ error: 'Delivery address is required for delivery orders.' });
      }
    }
    // --- End Address Handling Logic ---

    // create the order without cartItems
    const order = await createOrder({userId: userId, vendorId, paymentMethod, deliveryAddressId: shippingAddressId, deliveryInstructions, totalAmount, serviceFee, shoppingMethod, deliveryMethod, scheduledShoppingStartTime})

    // pass the orderId into each cartItem and bulk create cartItems
    const updatedOrderItems = orderItems.map(item => {
      return {
        ...item,
        orderId: order.id
      };
    });
    await createManyCartItems(updatedOrderItems)

    const finalOrder = await getOrderById(order.id);

    res.status(201).json(finalOrder);
  } catch (error: any) {
    // Handle specific errors (e.g., from the service layer)
    if (error.message === 'Cart not found') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create order: ' + error.message });
  }
};

/**
 * Controller for getting an order by ID.
 * GET /orders/:id
 */
export const getOrderByIdController = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const order = await getOrderByIdService(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve order: ' + error.message });
  }
};

/**
 * Controller for getting all orders for a user.
 * GET /orders/user/:userId
 */
export const getOrdersByUserController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }
    const orders = await getOrdersByUserIdService(userId);
    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve orders: ' + error.message });
  }
};

/**
 * Controller for updating the status of an order.
 * PATCH /orders/:id/status
 */
export const updateOrderStatusController = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const updatedOrder = await updateOrderStatusService(orderId, status);
    res.status(200).json(updatedOrder);
  } catch (error: any) {
    if (error.message === 'Order not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update order status: ' + error.message });
  }
};



/**
 * Controller for updating an order.
 * PATCH /orders/:id
 */
export const updateOrderController = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const updates = req.body;

    const updatedOrder = await updateOrderService(orderId, updates);
    res.status(200).json(updatedOrder);
  } catch (error: any) {
    if (error.message === 'Order not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update order: ' + error.message });
  }
};
