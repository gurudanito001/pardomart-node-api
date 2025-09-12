

import { Request, Response, Router } from 'express';
import * as orderModel from '../models/order.model'; // Adjust the path if needed
import { PrismaClient, Order, OrderItem, Role, ShoppingMethod, OrderStatus, DeliveryMethod, VendorProduct, Product, DeliveryAddress, Prisma, PaymentMethods } from '@prisma/client';
import dayjs from 'dayjs';
import { calculateOrderFeesService } from './fee.service';
import { getVendorById } from './vendor.service';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

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
  shippingAddressId?: string | null;
  deliveryInstructions?: string;
  orderItems: {
    vendorProductId: string;
    quantity: number;
    instructions?: string;
    replacementIds?: string[];
  }[];
  shoppingMethod: ShoppingMethod;
  deliveryMethod: DeliveryMethod;
  scheduledDeliveryTime?: Date;
  shopperTip?: number;
  deliveryPersonTip?: number;
}

export const createOrderFromClient = async (userId: string, payload: CreateOrderFromClientPayload) => {
  // Destructure payload
  const {
    vendorId,
    paymentMethod,
    shippingAddressId,
    deliveryInstructions,
    orderItems,
    shoppingMethod,
    deliveryMethod,
    scheduledDeliveryTime,
    shopperTip,
    deliveryPersonTip,
  } = payload;

  // --- 1. Validate payload basics ---
  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    throw new OrderCreationError('Order must contain at least one item.');
  }

  let shoppingStartTime: Date | undefined;

  // --- 2. Validate scheduled time against vendor hours ---
  if (scheduledDeliveryTime) {
    const parsedScheduledDeliveryTime = dayjs.utc(scheduledDeliveryTime);
    if (!parsedScheduledDeliveryTime.isValid()) {
      throw new OrderCreationError('Invalid scheduled delivery time format.');
    }

    // Calculate scheduledShoppingStartTime based on delivery time and method
    if (deliveryMethod === DeliveryMethod.delivery_person) {
      shoppingStartTime = parsedScheduledDeliveryTime.subtract(2, 'hour').toDate();
    } else if (deliveryMethod === DeliveryMethod.customer_pickup) {
      shoppingStartTime = parsedScheduledDeliveryTime.subtract(1, 'hour').toDate();
    }

    const vendor = await getVendorById(vendorId);
    if (!vendor) throw new OrderCreationError('Vendor not found.', 404);
    if (!vendor.timezone) console.warn(`Vendor ${vendorId} does not have a timezone set. Skipping time validation.`);

    const deliveryLocalDayjs = parsedScheduledDeliveryTime.tz(vendor.timezone || 'UTC');
    const dayOfWeek = getDayEnumFromDayjs(deliveryLocalDayjs.day());
    const openingHoursToday = vendor.openingHours.find((h) => h.day === dayOfWeek);

    if (!openingHoursToday || !openingHoursToday.open || !openingHoursToday.close) {
      throw new OrderCreationError(`Vendor is closed or has no defined hours for ${dayOfWeek}.`);
    }
    const [openHours, openMinutes] = openingHoursToday.open.split(':').map(Number);
    const [closeHours, closeMinutes] = openingHoursToday.close.split(':').map(Number);

    let vendorOpenTimeUTC = deliveryLocalDayjs.hour(openHours).minute(openMinutes).second(0).millisecond(0).utc();
    let vendorCloseTimeUTC = deliveryLocalDayjs.hour(closeHours).minute(closeMinutes).second(0).millisecond(0).utc();

    if (vendorCloseTimeUTC.isBefore(vendorOpenTimeUTC)) {
      vendorCloseTimeUTC = vendorCloseTimeUTC.add(1, 'day');
    }

    // Allow delivery up to 30 minutes before the store closes.
    const lastDeliveryTimeUTC = vendorCloseTimeUTC.subtract(30, 'minutes');

    if (parsedScheduledDeliveryTime.isBefore(vendorOpenTimeUTC) || parsedScheduledDeliveryTime.isAfter(lastDeliveryTimeUTC)) {
      throw new OrderCreationError(`Scheduled delivery time must be between ${openingHoursToday.open} and ${lastDeliveryTimeUTC.tz(vendor.timezone || 'UTC').format('HH:mm')} vendor local time.`);
    }

    if (parsedScheduledDeliveryTime.isBefore(dayjs.utc())) {
      throw new OrderCreationError('Scheduled delivery time cannot be in the past.');
    }

    if (shoppingStartTime && dayjs.utc(shoppingStartTime).isBefore(vendorOpenTimeUTC)) {
      throw new OrderCreationError(`Calculated shopping start time is before the vendor opens. Please choose a later delivery time.`);
    }
  }

  // --- Transactional Block ---
  return prisma.$transaction(async (tx) => {
    // --- 3. Handle Delivery Address ---
    const finalShippingAddressId = shippingAddressId;
    if (!shippingAddressId && deliveryMethod === DeliveryMethod.delivery_person) {
      throw new OrderCreationError('Delivery address is required for delivery orders.');
    }

    // --- 4. Calculate Fees & Validate Items ---
    const fees = await calculateOrderFeesService({
      orderItems,
      vendorId,
      deliveryAddressId: finalShippingAddressId!,
    }, tx);

    const { subtotal, deliveryFee, serviceFee, shoppingFee } = fees;

    // The total amount is the subtotal + all fees + any tips.
    const finalTotalAmount =
      subtotal +
      (deliveryFee || 0) +
      (serviceFee || 0) +
      (shoppingFee || 0) +
      (shopperTip || 0) +
      (deliveryPersonTip || 0);

    // --- 5. Create the Order record ---
    const newOrder = await orderModel.createOrder({
      userId,
      vendorId,
      totalAmount: finalTotalAmount,
      deliveryFee, serviceFee, shoppingFee,
      shopperTip, deliveryPersonTip,
      paymentMethod, shoppingMethod, deliveryMethod,
      scheduledDeliveryTime, shoppingStartTime, deliveryAddressId: finalShippingAddressId, deliveryInstructions,
    }, tx);

    // --- 6. Create the OrderItem records ---
    for (const item of orderItems) {
      if (item.quantity <= 0) {
        throw new OrderCreationError(`Quantity for product ${item.vendorProductId} must be positive.`);
      }
      await tx.orderItem.create({
        data: {
          orderId: newOrder.id,
          vendorProductId: item.vendorProductId,
          quantity: item.quantity,
          instructions: item.instructions,
          replacements: item.replacementIds
            ? {
                connect: item.replacementIds.map((id) => ({ id })),
              }
            : undefined,
        },
      });
    }

    // --- NEW: Decrement stock for each product in the order ---
    for (const item of orderItems) {
      try {
        await tx.vendorProduct.update({
          where: {
            id: item.vendorProductId,
            stock: {
              gte: item.quantity, // Ensure stock is sufficient at the time of update
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
          // This error ("Record to update not found") is thrown when the where clause fails, including our stock check.
          throw new OrderCreationError(`Product with ID ${item.vendorProductId} is out of stock or does not have enough quantity.`, 409); // 409 Conflict
        }
        throw e; // Re-throw any other unexpected errors
      }
    }

    // --- 7. Return the complete order with all relations ---
    const finalOrder = await orderModel.getOrderById(newOrder.id, tx);
    if (!finalOrder) {
        throw new OrderCreationError("Failed to retrieve the created order.", 500);
    }
    return finalOrder;
  });
};

export interface UpdateTipPayload {
  shopperTip?: number;
  deliveryPersonTip?: number;
}

/**
 * Allows a customer to add or update a tip for an order.
 * Recalculates the order's total amount.
 *
 * @param orderId The ID of the order to update.
 * @param userId The ID of the customer making the request (for authorization).
 * @param payload An object containing `shopperTip` and/or `deliveryPersonTip`.
 * @returns The updated order object.
 * @throws OrderCreationError if the order is not found, user is not authorized, or tips are invalid.
 */
export const updateOrderTipService = async (
  orderId: string,
  userId: string,
  payload: UpdateTipPayload
): Promise<Order> => {
  return prisma.$transaction(async (tx) => {
    // 1. Fetch the existing order
    const existingOrder = await tx.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      throw new OrderCreationError('Order not found.', 404);
    }

    // 2. Authorize: Ensure the user owns the order
    if (existingOrder.userId !== userId) {
      throw new OrderCreationError('You are not authorized to update this order.', 403);
    }

    // 3. Validate tip amounts
    if (payload.shopperTip !== undefined && payload.shopperTip < 0) {
      throw new OrderCreationError('Shopper tip cannot be negative.');
    }
    if (payload.deliveryPersonTip !== undefined && payload.deliveryPersonTip < 0) {
      throw new OrderCreationError('Delivery person tip cannot be negative.');
    }

    // 4. Calculate the difference in tips to adjust the total amount
    const oldShopperTip = existingOrder.shopperTip || 0;
    const oldDeliveryPersonTip = existingOrder.deliveryPersonTip || 0;
    const newShopperTip = payload.shopperTip ?? oldShopperTip;
    const newDeliveryPersonTip = payload.deliveryPersonTip ?? oldDeliveryPersonTip;
    const tipDifference = newShopperTip - oldShopperTip + (newDeliveryPersonTip - oldDeliveryPersonTip);

    // 5. Update the order with new tips and recalculated total amount
    // NOTE: A full implementation would also handle payment adjustments here (e.g., capture more funds).
    return tx.order.update({
      where: { id: orderId },
      data: {
        shopperTip: newShopperTip,
        deliveryPersonTip: newDeliveryPersonTip,
        totalAmount: {
          increment: tipDifference,
        },
      },
    });
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
  const updates: orderModel.UpdateOrderPayload = { orderStatus: status };
  if (status === OrderStatus.delivered) { // When order is delivered
    updates.actualDeliveryTime = new Date(); // Set the actual delivery time
  }
  return orderModel.updateOrder(id, updates);
};

interface TimeSlot {
  date: string;
  timeSlots: string[];
}

/**
 * Generates available delivery time slots for a vendor for the next 7 days.
 *
 * This considers the vendor's opening hours, a preparation buffer, and different
 * cut-off times based on the delivery method.
 *
 * @param vendorId The ID of the vendor.
 * @param deliveryMethod The method of delivery ('delivery_person' or 'customer_pickup').
 * @returns A promise that resolves to an array of available dates, each with a list of time slots.
 */
export const getAvailableDeliverySlots = async (
  vendorId: string,
  deliveryMethod: DeliveryMethod
): Promise<TimeSlot[]> => {
  const vendor = await getVendorById(vendorId);
  if (!vendor || !vendor.openingHours || vendor.openingHours.length === 0) {
    throw new OrderCreationError('Vendor not found or has no opening hours defined.', 404);
  }

  const vendorTimezone = vendor.timezone || 'UTC';
  const availableSlotsByDay: TimeSlot[] = [];
  const nowInVendorTimezone = dayjs().tz(vendorTimezone);

  // Generate slots for today and the next 3 days
  for (let i = 0; i <= 3; i++) {
    const currentDay = nowInVendorTimezone.add(i, 'day');
    const dayOfWeek = getDayEnumFromDayjs(currentDay.day());
    const openingHoursToday = vendor.openingHours.find((h) => h.day === dayOfWeek);

    // Skip day if store is closed
    if (!openingHoursToday || !openingHoursToday.open || !openingHoursToday.close) {
      continue;
    }

    const [openHour, openMinute] = openingHoursToday.open.split(':').map(Number);
    const [closeHour, closeMinute] = openingHoursToday.close.split(':').map(Number);

    const openTime = currentDay.hour(openHour).minute(openMinute).second(0);
    const closeTime = currentDay.hour(closeHour).minute(closeMinute).second(0);

    let earliestSlotStartTime: dayjs.Dayjs;
    let latestSlotEndTime: dayjs.Dayjs;

    if (deliveryMethod === DeliveryMethod.customer_pickup) {
      // For pickup, the earliest time is 1 hour from now.
      earliestSlotStartTime = nowInVendorTimezone.add(1, 'hour');
      // The latest time a customer can choose is 1 hour before the store closes.
      latestSlotEndTime = closeTime.subtract(1, 'hour');
    } else { // delivery_person
      // For delivery, the earliest time is 1.5 hours from now.
      earliestSlotStartTime = nowInVendorTimezone.add(90, 'minutes');
      // The latest time is the store's closing time.
      latestSlotEndTime = closeTime;
      // TODO: The latest delivery time should be adjusted based on the distance
      // between the store and the customer's address to ensure the delivery
      // person can complete the delivery before the store closes.
    }

    // For future days, the earliest slot can start right when the store opens.
    // For today, it must be after the calculated `earliestSlotStartTime`.
    let firstAvailableTime = openTime;
    if (i === 0 && earliestSlotStartTime.isAfter(openTime)) {
      firstAvailableTime = earliestSlotStartTime;
    }

    // Align to the start of the next hour for clean slots.
    let firstSlotStart = firstAvailableTime;
    if (firstSlotStart.minute() > 0 || firstSlotStart.second() > 0 || firstSlotStart.millisecond() > 0) {
      firstSlotStart = firstSlotStart.add(1, 'hour').startOf('hour');
    }

    const timeSlots: string[] = [];
    let currentSlotStart = firstSlotStart;

    // Generate 1-hour slots until the start of the next slot is past the latest end time.
    while (currentSlotStart.isBefore(latestSlotEndTime)) {
      const slotEnd = currentSlotStart.add(1, 'hour');
      // Ensure the entire slot is within the allowed time.
      if (slotEnd.isAfter(latestSlotEndTime)) {
        break;
      }
      timeSlots.push(
        `${currentSlotStart.format('h:mma')} - ${slotEnd.format('h:mma')}`.toLowerCase()
      );
      currentSlotStart = currentSlotStart.add(1, 'hour');
    }

    if (timeSlots.length > 0) {
      availableSlotsByDay.push({
        date: currentDay.format('DD-MM-YYYY'),
        timeSlots,
      });
    }
  }

  return availableSlotsByDay;
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
  deliveryPerson: { id: string; name: string | null; } | null;
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
          { orderStatus: options.status } :
          { orderStatus: { in: defaultStatuses}}
        ),
        // Filter by scheduledShoppingStartTime:
        // Only show orders where shopping is due now or in the past, plus those due in the next 30 minutes.
        shoppingStartTime: {
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
        deliveryPerson: { select: { id: true, name: true } }, // The assigned delivery handler
      },
      orderBy: {
        shoppingStartTime: 'asc', // Sort upcoming orders by when they need to be prepared
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
        shopperId: null, // Ensure it's not already assigned
      },
      data: {
        orderStatus: OrderStatus.accepted_for_shopping, // Change status to accepted
        shopperId: shoppingHandlerUserId, // Assign the handler (the accepting staff)
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
        shopperId: null, // Clear any potential assignment if it was somehow set
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
        shopperId: shoppingHandlerUserId, // Re-confirm handler, or assign if not already done by accept
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