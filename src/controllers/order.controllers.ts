

import { Request, Response } from 'express';
import {
  getOrderByIdService,
  getOrdersByUserIdService,
  updateOrderStatusService,
  updateOrderService,
  getOrdersForVendorDashboard,
  acceptOrderService,
  declineOrderService,
  startShoppingService,
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
import { calculateOrderFeesService } from '../services/fee.service';


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
    const userId = req.userId as string; // Get userId from authenticated request
    let {
      vendorId,
      paymentMethod,
      shippingAddressId,
      newShippingAddress,
      deliveryInstructions,
      orderItems, // These are the initial items from the client's perspective
      shoppingMethod,
      deliveryMethod,
      scheduledShoppingStartTime,
    } = req.body as {
      vendorId: string;
      paymentMethod: PaymentMethods;
      shippingAddressId?: string;
      newShippingAddress?: CreateDeliveryAddressPayload;
      deliveryInstructions?: string; // Made optional as per your example payload
      orderItems: Array<{ vendorProductId: string; quantity: number }>; // Refined type for clarity
      shoppingMethod: ShoppingMethod;
      deliveryMethod: DeliveryMethod;
      scheduledShoppingStartTime?: Date; // Made optional
    };

    // --- 1. Validate scheduledShoppingStartTime and Vendor Hours ---
    if (scheduledShoppingStartTime) {
      const parsedScheduledTime = dayjs.utc(scheduledShoppingStartTime);

      if (!parsedScheduledTime.isValid()) {
        return res.status(400).json({ error: 'Invalid scheduled shopping start time format.' });
      }

      const vendor = await getVendorById(vendorId);

      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found.' });
      }

      if (!vendor.timezone) {
        console.warn(`Vendor ${vendorId} does not have a timezone set. Skipping time validation.`);
      }

      const vendorLocalDayjs = parsedScheduledTime.tz(vendor.timezone || 'UTC');
      const dayOfWeek = getDayEnumFromDayjs(vendorLocalDayjs.day());

      const openingHoursToday = vendor.openingHours.find((h) => h.day === dayOfWeek);

      if (!openingHoursToday || !openingHoursToday.open || !openingHoursToday.close) {
        return res.status(400).json({
          error: `Vendor is closed or has no defined hours for ${dayOfWeek}.`
        });
      }

      const [openHours, openMinutes] = openingHoursToday.open.split(':').map(Number);
      const [closeHours, closeMinutes] = openingHoursToday.close.split(':').map(Number);

      let vendorOpenTimeUTC = vendorLocalDayjs.hour(openHours).minute(openMinutes).second(0).millisecond(0).utc();
      let vendorCloseTimeUTC = vendorLocalDayjs.hour(closeHours).minute(closeMinutes).second(0).millisecond(0).utc();

      if (vendorCloseTimeUTC.isBefore(vendorOpenTimeUTC)) {
        vendorCloseTimeUTC = vendorCloseTimeUTC.add(1, 'day');
      }

      const twoHoursBeforeCloseUTC = vendorCloseTimeUTC.subtract(2, 'hour');

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

    // --- Address Handling Logic ---
    let finalShippingAddressId: string | undefined = shippingAddressId;

    if (!shippingAddressId && newShippingAddress) {
      if (!newShippingAddress.addressLine1 || !newShippingAddress.city) {
        return res.status(400).json({ error: 'New shipping address requires addressLine1 and city.' });
      }

      const payloadForNewAddress: CreateDeliveryAddressPayload = {
        ...newShippingAddress,
        userId: userId,
      };

      const createdAddress = await createDeliveryAddressService(payloadForNewAddress);
      finalShippingAddressId = createdAddress.id;
    } else if (!shippingAddressId && deliveryMethod === DeliveryMethod.delivery_person) {
      // If deliveryMethod is DELIVERY_PERSON, shippingAddressId is mandatory
      return res.status(400).json({ error: 'Delivery address is required for delivery orders.' });
    }
    // Note: If deliveryMethod is CUSTOMER_PICKUP and no address is given, it's fine.
    // --- End Address Handling Logic ---

    // --- Prepare Order Items for Fee Calculation ---
    // The calculateOrderFeesService expects { vendorProductId, quantity }
    const orderItemsForFeeCalculation = orderItems.map(item => ({
      vendorProductId: item.vendorProductId,
      quantity: item.quantity,
    }));

    // --- Calculate Fees ---
    if (!finalShippingAddressId && deliveryMethod === DeliveryMethod.delivery_person) {
      // This should ideally be caught by the earlier address validation, but good to double check
      return res.status(400).json({ error: 'Cannot calculate delivery fee without a valid delivery address.' });
    }

    // Call the fee calculation service
    const fees = await calculateOrderFeesService({
      orderItems: orderItemsForFeeCalculation,
      vendorId: vendorId,
      deliveryAddressId: finalShippingAddressId!, // Assert non-null if delivery_person
    });

    // Extract calculated fees and total
    const { subtotal, shoppingFee, deliveryFee, serviceFee, totalEstimatedCost } = fees;

    // --- Create the Order ---
    const order = await createOrder({
      userId: userId,
      vendorId: vendorId,
      totalAmount: totalEstimatedCost, // Use the total calculated by fees service
      deliveryFee: deliveryFee,       // Include calculated delivery fee
      serviceFee: serviceFee,         // Include calculated service fee
      shoppingFee: shoppingFee,       // Include calculated service fee
      paymentMethod: paymentMethod,
      shoppingMethod: shoppingMethod,
      deliveryMethod: deliveryMethod,
      scheduledShoppingStartTime: scheduledShoppingStartTime ,
      deliveryAddressId: finalShippingAddressId, // Store the ID of the chosen/created address
      deliveryInstructions: deliveryInstructions,
    });

    // --- Link Order Items to the newly created Order ---
    const orderItemsToCreate = orderItems.map((item) => ({
      vendorProductId: item.vendorProductId,
      quantity: item.quantity,
      orderId: order.id, // Link to the new order
    }));

    await createManyCartItems(orderItemsToCreate); // This function will create CartItems linked to the Order

    // Retrieve the final order with its linked items for the response
    const finalOrder = await getOrderById(order.id);

    res.status(201).json(finalOrder);
  } catch (error: any) {
    console.error('Error creating order:', error);
    // Provide a more generic error message if the specific error is not for the client
    res.status(500).json({ error: error.message || 'Internal server error during order creation.' });
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


interface OrderAuthenticatedRequest extends Request {
  userId?: string;
  userRoles?: string[];
  vendorId?: string; // This will be set by auth for Vendor_Admin/Shopper_Staff
}


/**
 * Controller to get a list of orders for a specific vendor's dashboard.
 * Requires vendor staff/admin authentication and authorization.
 * GET /vendor/orders
 * Query params: statuses=pending,accepted,shopping&includeFutureScheduled=true
 */
export const getVendorOrdersController = async (req: OrderAuthenticatedRequest, res: Response) => {
  try {
    const vendorId = req.vendorId as string; // Populated by authorizeVendorAccess middleware
    const { status } = req.query as {status: OrderStatus};

    const orders = await getOrdersForVendorDashboard(vendorId, { status: status });
    res.status(200).json(orders);
  } catch (error: any) {
    console.error('Error in getVendorOrdersController:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};



/**
 * Controller to accept a pending order.
 * PATCH /vendor/orders/:orderId/accept
 */
export const acceptOrderController = async (req: OrderAuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const shoppingHandlerUserId = req.userId as string; // ID of the accepting staff
    const vendorId = req.vendorId as string; // Vendor ID of the staff

    if (!orderId || !shoppingHandlerUserId || !vendorId) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    const acceptedOrder = await acceptOrderService(orderId, shoppingHandlerUserId, vendorId);
    res.status(200).json(acceptedOrder);
  } catch (error: any) {
    console.error('Error in acceptOrderController:', error);
    if (error.message.includes('not found') || error.message.includes('cannot be accepted')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};


/**
 * Controller to decline a pending order.
 * PATCH /vendor/orders/:orderId/decline
 */
export const declineOrderController = async (req: OrderAuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body; // Optional reason for decline
    const vendorId = req.vendorId as string; // Vendor ID of the staff

    if (!orderId || !vendorId) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    const declinedOrder = await declineOrderService(orderId, vendorId, reason);
    res.status(200).json(declinedOrder);
  } catch (error: any) {
    console.error('Error in declineOrderController:', error);
    if (error.message.includes('not found') || error.message.includes('cannot be declined')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};


/**
 * Controller to mark an accepted order as 'shopping'.
 * PATCH /vendor/orders/:orderId/start-shopping
 */
export const startShoppingController = async (req: OrderAuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const shoppingHandlerUserId = req.userId as string; // ID of the staff starting shopping
    const vendorId = req.vendorId as string; // Vendor ID of the staff

    if (!orderId || !shoppingHandlerUserId || !vendorId) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    const updatedOrder = await startShoppingService(orderId, shoppingHandlerUserId, vendorId);
    res.status(200).json(updatedOrder);
  } catch (error: any) {
    console.error('Error in startShoppingController:', error);
    if (error.message.includes('not found') || error.message.includes('cannot start shopping')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};