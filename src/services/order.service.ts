

import { Request, Response, Router } from 'express';
import * as orderModel from '../models/order.model'; // Adjust the path if needed
import { PrismaClient, Order, OrderItem, Role, ShoppingMethod, OrderStatus, DeliveryMethod, VendorProduct, Product, DeliveryAddress, Prisma, PaymentMethods  } from '@prisma/client';
import dayjs from 'dayjs';
import { CreateDeliveryAddressPayload } from '../models/deliveryAddress.model';
import { createDeliveryAddressService } from './deliveryAddress.service';
import { calculateOrderFeesService } from './fee.service';
import * as orderItemModel from '../models/orderItem.model';
import { getVendorById } from './vendor.service';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const prisma = new PrismaClient();


// --- Order Service Functions ---

/**
 * Creates a new order.
 * @param userId - The ID of the user placing the order.
 * @param cartId - The ID of the cart to create the order from.
 * @param shippingAddress - The shipping address for the order.
 * @returns The newly created order.
 */

export const createOrderService = async (payload: orderModel.CreateOrderPayload): Promise<Order> => {
  const order = await orderModel.createOrder(payload);
  return order;
};

/**
 * Retrieves an order by its ID.
 * @param id - The ID of the order to retrieve.
 * @returns The order, or null if not found.
 */
export const getOrderByIdService = async (id: string): Promise<Order | null> => {
  return orderModel.getOrderById(id);
};


export class OrderCreationError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'OrderCreationError';
    this.statusCode = statusCode;
  }
}




/**
 * Retrieves all orders for a specific user.
 * @param userId - The ID of the user whose orders are to be retrieved.
 * @returns An array of orders for the user.
 */
export const getOrdersByUserIdService = async (userId: string): Promise<Order[]> => {
  return orderModel.getOrdersByUserId(userId);
};






const getDayEnumFromDayjs = (dayjsDayIndex: number): string => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayjsDayIndex];
};

interface CreateOrderFromClientPayload {
  vendorId: string;
  paymentMethod: PaymentMethods; // Consider using an enum if you have fixed payment methods
  shippingAddressId?: string;
  newShippingAddress?: CreateDeliveryAddressPayload;
  deliveryInstructions?: string;
  orderItems: { vendorProductId: string; quantity: number }[];
  shoppingMethod: ShoppingMethod;
  deliveryMethod: DeliveryMethod;
  scheduledShoppingStartTime?: Date;
}

export const createOrderFromClient = async (userId: string, payload: CreateOrderFromClientPayload) => {
  // Destructure payload
  const {
    vendorId,
    paymentMethod,
    shippingAddressId,
    newShippingAddress,
    deliveryInstructions,
    orderItems,
    shoppingMethod,
    deliveryMethod,
    scheduledShoppingStartTime,
  } = payload;

  // --- 1. Validate payload basics ---
  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    throw new OrderCreationError('Order must contain at least one item.');
  }

  // --- 2. Validate scheduled time against vendor hours ---
  if (scheduledShoppingStartTime) {
    const parsedScheduledTime = dayjs.utc(scheduledShoppingStartTime);
    if (!parsedScheduledTime.isValid()) {
      throw new OrderCreationError('Invalid scheduled shopping start time format.');
    }
    const vendor = await getVendorById(vendorId);
    if (!vendor) throw new OrderCreationError('Vendor not found.', 404);
    if (!vendor.timezone) console.warn(`Vendor ${vendorId} does not have a timezone set. Skipping time validation.`);

    const vendorLocalDayjs = parsedScheduledTime.tz(vendor.timezone || 'UTC');
    const dayOfWeek = getDayEnumFromDayjs(vendorLocalDayjs.day());
    const openingHoursToday = vendor.openingHours.find((h) => h.day === dayOfWeek);

    if (!openingHoursToday || !openingHoursToday.open || !openingHoursToday.close) {
      throw new OrderCreationError(`Vendor is closed or has no defined hours for ${dayOfWeek}.`);
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
      throw new OrderCreationError(`Scheduled shopping time must be between ${openingHoursToday.open} and ${twoHoursBeforeCloseUTC.tz(vendor.timezone || 'UTC').format('HH:mm')} vendor local time.`);
    }

    if (parsedScheduledTime.isBefore(dayjs.utc())) {
      throw new OrderCreationError('Scheduled shopping time cannot be in the past.');
    }
  }

  // --- Transactional Block ---
  return prisma.$transaction(async (tx) => {
    // --- 3. Handle Delivery Address ---
    let finalShippingAddressId = shippingAddressId;
    if (!shippingAddressId && newShippingAddress) {
      const createdAddress = await createDeliveryAddressService({ ...newShippingAddress, userId }, tx);
      finalShippingAddressId = createdAddress.id;
    } else if (!shippingAddressId && deliveryMethod === DeliveryMethod.delivery_person) {
      throw new OrderCreationError('Delivery address is required for delivery orders.');
    }

    // --- 4. Calculate Fees & Validate Items ---
    const fees = await calculateOrderFeesService({
      orderItems,
      vendorId,
      deliveryAddressId: finalShippingAddressId!,
    }, tx);

    const { totalEstimatedCost, deliveryFee, serviceFee, shoppingFee } = fees;

    // --- 5. Create the Order record ---
    const newOrder = await orderModel.createOrder({
      userId, vendorId, totalAmount: totalEstimatedCost, deliveryFee, serviceFee, shoppingFee, paymentMethod, shoppingMethod, deliveryMethod, scheduledShoppingStartTime, deliveryAddressId: finalShippingAddressId, deliveryInstructions,
    }, tx);

    // --- 6. Create the OrderItem records ---
    const orderItemsToCreate = orderItems.map((item: any) => ({
      vendorProductId: item.vendorProductId,
      quantity: item.quantity,
      orderId: newOrder.id,
    }));

    await orderItemModel.createManyOrderItems(orderItemsToCreate, tx);

    // --- 7. Return the complete order with all relations ---
    const finalOrder = await orderModel.getOrderById(newOrder.id, tx);
    if (!finalOrder) {
        throw new OrderCreationError("Failed to retrieve the created order.", 500);
    }
    return finalOrder;
  });
};






/**
 * Service function to update an existing order.
 *
 * @param orderId The ID of the order to update.
 * @param updates An object containing the fields to update and their new values.
 * The keys of this object should match the Order model fields.
 * @returns The updated order object.
 * @throws Error if the order is not found or if the update fails.
 */
export const updateOrderService = async (
  orderId: string,
  updates: orderModel.UpdateOrderPayload
): Promise<Order> => {
  try {
    // 1. Check if the order exists
    const existingOrder = await orderModel.getOrderById(orderId);

    if (!existingOrder) {
      throw new Error('Order not found');
    }

    // 2. Perform the update
    const updatedOrder = await orderModel.updateOrder(orderId, updates);

    return updatedOrder;
  } catch (error: any) {
    // 3. Handle errors
    console.error('Error updating order:', error);
    throw new Error(`Failed to update order: ${error.message}`);
  }
};


/**
 * Updates the status of an order.  Added this as a common use case.
 * @param id - The ID of the order to update.
 * @param status - The new status of the order.
 * @returns The updated order.
 */
export const updateOrderStatusService = async (
  id: string,
  status: OrderStatus
): Promise<Order> => {
  return orderModel.updateOrder(id, { orderStatus: status });
};


// Define a type that includes relations needed for the vendor dashboard
// This ensures type safety when Prisma returns data with included relations
type OrderItemWithProductDetails = OrderItem & {
  vendorProduct: VendorProduct & {
    product: Product;
  };
};

type OrderWithRequiredRelations = Order & {
  user: { id: string; name: string | null; mobileNumber: string | null };
  orderItems: OrderItemWithProductDetails[];
  deliveryAddress: DeliveryAddress | null;
  shopper: { id: string; name: string | null; } | null;
  deliverer: { id: string; name: string | null; } | null;
  // Add other relations needed for the dashboard (e.g., deliverer)
};


/**
 * Retrieves orders relevant for a vendor dashboard.
 * Filters by vendor ID, shopping method, and specified statuses.
 * Includes optional filtering by scheduled shopping start time.
 *
 * @param vendorId The ID of the vendor.
 * @param options Filtering options (e.g., statuses, includeFutureScheduled).
 * @returns An array of Order objects with necessary relations.
 */
export const getOrdersForVendorDashboard = async (
  vendorId: string,
  options?: {
    status?: OrderStatus;
    // Add pagination options if needed here { page?: number, limit?: number }
  }
): Promise<OrderWithRequiredRelations[]> => {
  // Default statuses to show if not explicitly provided
  const defaultStatuses: OrderStatus[] = [
    OrderStatus.pending,
    OrderStatus.accepted_for_shopping,
    OrderStatus.currently_shopping,
    OrderStatus.ready_for_delivery, // Vendor might want to see these to prepare for hand-off
    OrderStatus.ready_for_pickup,   // If applicable for their orders
  ];

  try {
    const orders = await prisma.order.findMany({
      where: {
        vendorId: vendorId,
        
        shoppingMethod: ShoppingMethod.vendor, // Only show orders where this vendor is responsible for shopping
        ...(
          options?.status ? 
          { OrderStatus: options?.status} :
          { orderStatus: { in: defaultStatuses}}
        ),
        // Filter by scheduledShoppingStartTime:
        // If includeFutureScheduled is false/undefined, only show orders where shopping is due now or in the past
        scheduledShoppingStartTime:  {
          lte: dayjs().add(30, 'minutes').utc().toDate(), // Show overdue orders and scheduled orders up to 30 mins in future
        },
      },
      include: {
        user: { select: { id: true, name: true, mobileNumber: true } }, // Customer details
        orderItems: {
          include: {
            vendorProduct: {
              include: { product: true }, // Product details associated with the vendor product
            },
          },
        },
        deliveryAddress: true, // The specific address used for this order
        shopper: { select: { id: true, name: true, } }, // The assigned shopping handler (staff user)
        deliverer: { select: { id: true, name: true } }, // The assigned delivery handler
      },
      orderBy: {
        scheduledShoppingStartTime: 'asc', // Sort upcoming orders
        createdAt: 'asc', // Fallback sort
      },
    });

    return orders;
  } catch (error) {
    console.error('Error fetching vendor dashboard orders:', error);
    throw new Error('Failed to retrieve vendor orders.');
  }
};





/**
 * Accepts a pending order, setting its status to 'accepted' and assigning a shopping handler.
 *
 * @param orderId The ID of the order to accept.
 * @param shoppingHandlerUserId The ID of the user (vendor_staff/admin) accepting the order.
 * @param vendorId The ID of the vendor to verify ownership.
 * @returns The updated Order object.
 * @throws Error if order not found, not pending, or does not belong to the vendor.
 */
export const acceptOrderService = async (
  orderId: string,
  shoppingHandlerUserId: string,
  vendorId: string // Pass vendorId for stricter security check at service layer
): Promise<Order> => {
  try {
    // Perform an atomic update with a where clause to enforce state and ownership
    const acceptedOrder = await prisma.order.update({
      where: {
        id: orderId,
        vendorId: vendorId, // Crucial: ensure order belongs to this vendor
        orderStatus: OrderStatus.pending, // Only accept orders that are currently pending
        shoppingMethod: ShoppingMethod.vendor, // Only accept if vendor is responsible for shopping
        shoppingHandlerId: null, // Ensure it's not already assigned
      },
      data: {
        orderStatus: OrderStatus.accepted_for_shopping, // Change status to accepted
        shoppingHandlerId: shoppingHandlerUserId, // Assign the handler (the accepting staff)
      },
    });
    return acceptedOrder;
  } catch (error: any) {
    if (error.code === 'P2025') { // Prisma error for record not found
      // This means the order was not found OR it didn't match the where conditions (e.g., not pending, wrong vendor)
      throw new Error('Order not found or cannot be accepted in its current state/by this vendor.');
    }
    console.error(`Error accepting order ${orderId}:`, error);
    throw new Error('Failed to accept order: ' + error.message);
  }
};



/**
 * Declines a pending order.
 *
 * @param orderId The ID of the order to decline.
 * @param vendorId The ID of the vendor to verify ownership.
 * @param reason Optional reason for declining.
 * @returns The updated Order object.
 * @throws Error if order not found, not pending, or does not belong to the vendor.
 */
export const declineOrderService = async (
  orderId: string,
  vendorId: string, // Pass vendorId for stricter security check at service layer
  reason?: string
): Promise<Order> => {
  try {
    const declinedOrder = await prisma.order.update({
      where: {
        id: orderId,
        vendorId: vendorId, // Crucial: ensure order belongs to this vendor
        orderStatus: OrderStatus.pending, // Only decline orders that are currently pending
        shoppingMethod: ShoppingMethod.vendor, // Only decline if vendor is responsible for shopping
      },
      data: {
        orderStatus: OrderStatus.declined_by_vendor, // Change status to declined
        reasonForDecline: reason, // Store the reason
        shoppingHandlerId: null, // Clear any potential assignment if it was somehow set
      },
    });
    return declinedOrder;
  } catch (error: any) {
    if (error.code === 'P2025') { // Prisma error for record not found
      throw new Error('Order not found or cannot be declined in its current state/by this vendor.');
    }
    console.error(`Error declining order ${orderId}:`, error);
    throw new Error('Failed to decline order: ' + error.message);
  }
};




/**
 * Marks an accepted order as 'shopping', indicating active item picking.
 * Only the assigned shopping handler or vendor admin can start shopping.
 *
 * @param orderId The ID of the order.
 * @param shoppingHandlerUserId The ID of the user starting shopping.
 * @param vendorId The ID of the vendor to verify ownership.
 * @returns The updated Order object.
 * @throws Error if order not found, not accepted, or handler/vendor mismatch.
 */
export const startShoppingService = async (
  orderId: string,
  shoppingHandlerUserId: string,
  vendorId: string // Pass vendorId for stricter security check at service layer
): Promise<Order> => {
  try {
    // Check if the user is a VENDOR_ADMIN for this vendor, or the assigned SHOPPER_STAFF
    const user = await prisma.user.findUnique({
      where: { id: shoppingHandlerUserId },
      select: { role: true, vendorId: true }
    });

    if (!user || user.vendorId !== vendorId || (user.role !== "vendor"  && user.role !== "vendor_staff")) {
      throw new Error('Unauthorized to start shopping for this vendor/order.');
    }

    const order = await prisma.order.update({
      where: {
        id: orderId,
        vendorId: vendorId, // Ensure order belongs to this vendor
        orderStatus: OrderStatus.accepted_for_shopping, // Must be accepted to start shopping
        shoppingMethod: ShoppingMethod.vendor, // Only if vendor is responsible
        // Optional stricter check: only assigned shopper can start shopping (if roles allow VENDOR_ADMIN too, this needs adjustment)
        // OR: shoppingHandlerId: shoppingHandlerUserId,
      },
      data: {
        orderStatus: OrderStatus.currently_shopping, // Transition to shopping
        shoppingHandlerId: shoppingHandlerUserId, // Re-confirm handler, or assign if not already done by accept
      },
    });
    return order;
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw new Error('Order not found or cannot start shopping in its current state/by this vendor.');
    }
    console.error(`Error starting shopping for order ${orderId}:`, error);
    throw new Error('Failed to start shopping: ' + error.message);
  }
};