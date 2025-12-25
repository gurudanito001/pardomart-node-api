

import { Request, Response, Router } from 'express';
import * as orderModel from '../models/order.model'; // Adjust the path if needed
import * as vendorModel from '../models/vendor.model'; // Add this import for vendorModel
import { PrismaClient, Order, OrderItem, Role, ShoppingMethod, OrderStatus, DeliveryMethod, VendorProduct, Product, DeliveryAddress, Prisma, PaymentMethods, OrderItemStatus, PaymentStatus, TransactionType, TransactionSource, TransactionStatus, NotificationCategory, NotificationType } from '@prisma/client';
import dayjs from 'dayjs';
import { calculateOrderFeesService } from './fee.service';
import { getVendorById } from './vendor.service';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { getIO } from '../socket';
import { getAggregateRatingService } from './rating.service';
import * as notificationService from './notification.service';
import * as transactionModel from '../models/transaction.model';
import Stripe from 'stripe';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const prisma = new PrismaClient();

/* const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
}); */

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};



// --- Order Service Functions ---

/**
 * Creates a new order.
 * @param userId - The ID of the user placing the order.
 * @param cartId - The ID of the cart to create the order from.
 * @param shippingAddress - The shipping address for the order.
 * @returns The newly created order.
 */

export const createOrderService = async (payload: orderModel.CreateOrderPayload): Promise<Order> => {
  const order = await orderModel.createOrder({
    ...payload,
    // Ensure an OTP is always generated, even when using this older service
    pickupOtp: payload.pickupOtp || generatePickupOtp(),
  });
  return order;
};

/**
 * Retrieves an order by its ID.
 * @param id - The ID of the order to retrieve.
 * @returns The order, or null if not found.
 */
export const getOrderByIdService = async (
  id: string,
  requestingUserId: string,
  requestingUserRole: Role,
  staffVendorId?: string
): Promise<any | null> => {
  const order = await orderModel.getOrderById(id);

  if (!order || !order.vendor) {
    return null;
  }

  // --- Authorization Check ---
  const isCustomer = requestingUserRole === Role.customer && order.userId === requestingUserId;
  const isVendorOwner = requestingUserRole === Role.vendor && order.vendor.userId === requestingUserId;
  const isStoreStaff =
    (requestingUserRole === Role.store_admin || requestingUserRole === Role.store_shopper) &&
    staffVendorId === order.vendorId;
  const isAdmin = requestingUserRole === Role.admin;

  if (!isCustomer && !isVendorOwner && !isStoreStaff && !isAdmin) {
    throw new OrderCreationError('You are not authorized to view this order.', 403);
  }

  // 1. Get aggregate rating for the vendor.
  const rating = await getAggregateRatingService({ ratedVendorId: order.vendorId });

  // 2. Calculate distance using the order's delivery address. 
  let distance: number | undefined;
  if (order.deliveryAddress && order.deliveryAddress.latitude && order.deliveryAddress.longitude && order.vendor.latitude && order.vendor.longitude) {
    if (!isNaN(order.deliveryAddress.latitude) && !isNaN(order.deliveryAddress.longitude)) {
      const calculatedDistance = calculateDistance(
        order.deliveryAddress.latitude,
        order.deliveryAddress.longitude,
        order.vendor.latitude,
        order.vendor.longitude
      );
      distance = parseFloat(calculatedDistance.toFixed(2));
    }
  }

  // 3. Combine the results.
  const orderWithExtras = {
    ...order,
    vendor: {
      ...order.vendor, 
      rating: rating || { average: 0, count: 0 },
      distance: distance,
    },
  };

  return orderWithExtras;
};


export class OrderCreationError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'OrderCreationError';
    this.statusCode = statusCode;
  }
}

const generateUniqueOrderCode = async (tx: Prisma.TransactionClient): Promise<string> => {
  let orderCode;
  let isUnique = false;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  while (!isUnique) {
    orderCode = '';
    for (let i = 0; i < 6; i++) {
      orderCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const existingOrder = await tx.order.findUnique({
      where: { orderCode },
    });

    if (!existingOrder) {
      isUnique = true;
    }
  }
  return orderCode as string;
};

const generatePickupOtp = (): string => {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};



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
  stripePaymentMethodId?: string; // Added for Stripe integration
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
    stripePaymentMethodId,
    deliveryInstructions,
    orderItems,
    shoppingMethod,
    deliveryMethod,
    scheduledDeliveryTime,
    shopperTip,
    deliveryPersonTip,
  } = payload;

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

    /* if (parsedScheduledDeliveryTime.isBefore(vendorOpenTimeUTC) || parsedScheduledDeliveryTime.isAfter(lastDeliveryTimeUTC)) {
      throw new OrderCreationError(`Scheduled delivery time must be between ${openingHoursToday.open} and ${lastDeliveryTimeUTC.tz(vendor.timezone || 'UTC').format('HH:mm')} vendor local time.`);
    }

    if (parsedScheduledDeliveryTime.isBefore(dayjs.utc())) {
      throw new OrderCreationError('Scheduled delivery time cannot be in the past.');
    }

    if (shoppingStartTime && dayjs.utc(shoppingStartTime).isBefore(vendorOpenTimeUTC)) {
      throw new OrderCreationError(`Calculated shopping start time is before the vendor opens. Please choose a later delivery time.`);
    } */
  }

  // --- 3. Calculate Fees (Moved outside transaction to support Stripe call) ---
  // We calculate fees before the transaction to get the total amount for the PaymentIntent.
  const fees = await calculateOrderFeesService({
    orderItems,
    vendorId,
    deliveryAddressId: shippingAddressId!,
    deliveryType: deliveryMethod,
  });

  const { subtotal, deliveryFee, serviceFee, shoppingFee } = fees;

  const finalTotalAmount =
    subtotal +
    (deliveryFee || 0) +
    (serviceFee || 0) +
    (shoppingFee || 0) +
    (shopperTip || 0) +
    (deliveryPersonTip || 0);

  // --- 4. Handle Stripe Payment Intent ---
  let clientSecret: string | undefined;
  let paymentIntentId: string | undefined;

  if (paymentMethod === PaymentMethods.credit_card) {
    /* // Prepare base PaymentIntent parameters
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(finalTotalAmount * 100), // Stripe expects amount in cents
      currency: 'usd', // Adjust currency as needed
      metadata: { vendorId, userId },
      automatic_payment_methods: {
        enabled: true,
      },
    };

    // If a specific payment method ID is provided (e.g. saved card), confirm immediately.
    // Otherwise, we just create the intent and let the client confirm it (e.g. using Payment Element).
    if (stripePaymentMethodId) {
      paymentIntentParams.payment_method = stripePaymentMethodId;
      paymentIntentParams.confirm = true;
      paymentIntentParams.automatic_payment_methods = { enabled: true, allow_redirects: 'never' };
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    clientSecret = paymentIntent.client_secret || undefined;
    paymentIntentId = paymentIntent.id; */
    clientSecret = 'mock_client_secret';
  }

  // --- Transactional Block ---
  return prisma.$transaction(async (tx) => {
    const orderCode = await generateUniqueOrderCode(tx);
    const pickupOtp = generatePickupOtp();

    // --- 5. Create the Order record ---
    const newOrder = await orderModel.createOrder({
      userId,
      vendorId,
      orderCode,
      pickupOtp,
      subtotal,
      totalAmount: finalTotalAmount,
      deliveryFee, serviceFee, shoppingFee,
      shopperTip, deliveryPersonTip,
      paymentMethod, shoppingMethod, deliveryMethod, scheduledDeliveryTime,
      shoppingStartTime, deliveryAddressId: shippingAddressId, deliveryInstructions,
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

    // --- 7. Create Transaction Record for Stripe ---
    if (paymentMethod === PaymentMethods.credit_card && paymentIntentId) {
      await tx.transaction.create({
        data: {
          userId,
          vendorId,
          orderId: newOrder.id,
          amount: finalTotalAmount,
          type: TransactionType.ORDER_PAYMENT,
          source: TransactionSource.STRIPE,
          status: TransactionStatus.PENDING, // Status is pending until webhook confirms or client finishes 3DS
          externalId: paymentIntentId,
          description: `Payment for Order #${orderCode}`,
        },
      });
    }

    // --- 7. Return the complete order with all relations ---
    const finalOrder = await orderModel.getOrderById(newOrder.id, tx);
    if (!finalOrder) {
        throw new OrderCreationError("Failed to retrieve the created order.", 500);
    }

    // --- Add Notification Logic Here ---
    // --- Add Notification Logic Here ---
    await notificationService.createNotification({
      userId: finalOrder.vendor.userId, // The vendor's user ID
      type: NotificationType.NEW_ORDER_PLACED,
      category: NotificationCategory.ORDER,
      title: 'New Order Received!',
      body: `You have a new order #${finalOrder.orderCode} from ${finalOrder.user.name}.`,
      meta: { orderId: finalOrder.id }
    });

    // I will remove it later
    await notificationService.createNotification({
      userId: finalOrder.userId, // The customer's user ID
      type: NotificationType.ORDER_PLACED_CUSTOMER,
      category: NotificationCategory.ORDER,
      title: 'Order Placed Successfully!',
      body: `Your order #${finalOrder.orderCode} has been placed.`,
      meta: { orderId: finalOrder.id },
    });
    // TODO: In a real application, you would send the `pickupOtp` to the customer
    // via SMS or a push notification that is only visible to them.
    // For now, it's available on the order object returned to the creating user.

    // --- End Notification Logic ---
    // --- End Notification Logic ---


    // Return the order along with the clientSecret so the frontend can complete the payment flow
    return { ...finalOrder, clientSecret };
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
  orderId: string,
  status: OrderStatus,
  requestingUserId: string,
  requestingUserRole: Role
): Promise<Order> => {
  const updates: orderModel.UpdateOrderPayload = { orderStatus: status };

  // --- Authorization Check ---
  const orderForAuth = await prisma.order.findUnique({ where: { id: orderId }, select: { userId: true, vendor: { select: { userId: true } } } });
  if (!orderForAuth) {
    throw new OrderCreationError('Order not found', 404);
  }

  const isCustomer = requestingUserRole === Role.customer && orderForAuth.userId === requestingUserId;
  const isVendorOwner = requestingUserRole === Role.vendor && orderForAuth.vendor.userId === requestingUserId;
  const isAdmin = requestingUserRole === Role.admin;

  // For now, only customer, vendor owner, or admin can change status.
  // More granular logic can be added here based on which status transitions are allowed by which role.
  if (!isCustomer && !isVendorOwner && !isAdmin) {
    throw new OrderCreationError('You are not authorized to update the status of this order.', 403);
  }

  // If order is delivered, handle payments to wallets
  if (status === OrderStatus.delivered) {
    updates.actualDeliveryTime = new Date();

    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { vendor: true }, // includes the nested user object for the vendor
      });
      if (!order) {
        throw new OrderCreationError('Order not found', 404);
      }

      // 1. Pay Vendor
      // The vendor gets paid the subtotal of the items. Platform fees are handled separately.
      const vendorAmount = order.subtotal;
      if (vendorAmount > 0 && order.vendor.userId) {
        // Credit the vendor's own wallet directly
        await tx.wallet.updateMany({
          where: { vendorId: order.vendorId },
          data: { balance: { increment: vendorAmount } }
        });
        await tx.transaction.create({
          data: {
            vendorId: order.vendorId, // Link transaction to vendor
            userId: order.vendor.userId, // Required: associate the transaction with the vendor's user record
            amount: vendorAmount,
            type: TransactionType.VENDOR_PAYOUT,
            source: TransactionSource.SYSTEM,
            status: 'COMPLETED',
            description: `Payment for order #${order.id.substring(0, 8)}`,
            orderId: order.id,
          },
        });
      }

      // 2. Pay Shopper Tip
      if (order.shopperId && order.shopperTip && order.shopperTip > 0) {
        await tx.wallet.update({
          where: { userId: order.shopperId },
          data: { balance: { increment: order.shopperTip } },
        });
        await tx.transaction.create({
          data: {
          userId: order.shopperId,
          amount: order.shopperTip,
          type: TransactionType.TIP_PAYOUT,
          source: TransactionSource.SYSTEM,
          status: 'COMPLETED',
          description: `Tip for order #${order.id.substring(0, 8)}`,
            orderId: order.id,
          },
        });
      }

      // 3. Pay Delivery Person Tip
      if (order.deliveryPersonId && order.deliveryPersonTip && order.deliveryPersonTip > 0) {
        await tx.wallet.update({
          where: { userId: order.deliveryPersonId },
          data: { balance: { increment: order.deliveryPersonTip } },
        });
        await tx.transaction.create({
          data: {
          userId: order.deliveryPersonId,
          amount: order.deliveryPersonTip,
          type: TransactionType.TIP_PAYOUT,
          source: TransactionSource.SYSTEM,
          status: 'COMPLETED',
          description: `Tip for order #${order.id.substring(0, 8)}`,
            orderId: order.id,
          },
        });
      }

      // 4. Update the order status
      return orderModel.updateOrder(orderId, updates, tx);
    });
  }


   // --- Add Notification Logic Here ---
  const orderDetails = await orderModel.getOrderById(orderId); // Fetch details for notification
  if (orderDetails) {
    switch (status) {
      case 'ready_for_pickup':
        await notificationService.createNotification({
          userId: orderDetails.userId,
          type: NotificationType.ORDER_READY_FOR_PICKUP,
          category: NotificationCategory.ORDER,
          title: 'Your order is ready for pickup!',
          body: `Order #${orderDetails.orderCode} is now ready for pickup at ${orderDetails.vendor.name}.`,
          meta: { orderId: orderId }
        });
        break;

      case 'en_route':
        await notificationService.createNotification({
          userId: orderDetails.userId,
          type: NotificationType.EN_ROUTE,
          category: NotificationCategory.ORDER,
          title: 'Your order is on the way!',
          body: `Your delivery person is en route with order #${orderDetails.orderCode}.`,
          meta: { orderId: orderId }
        });
        break;
      
      // Add other cases like DELIVERED, etc.
    }
  }
  // --- End Notification Logic ---

  return orderModel.updateOrder(orderId, updates, prisma);
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
        createdAt: 'desc', // As a fallback, show most recent orders first
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
 * @param shoppingHandlerUserId The ID of the user (store_shopper/admin) accepting the order.
 * @param vendorId The ID of the vendor to verify ownership.
 * @returns The updated Order object.
 * @throws Error if order not found, not pending, or does not belong to the vendor.
 */
export const acceptOrderService = async (
  orderId: string,
  shoppingHandlerUserId: string,
  vendorId?: string // This is now optional, only provided for staff roles
): Promise<Order> => {
  try {
    // 1. Fetch the order first to get its vendorId for authorization
    const orderToUpdate = await prisma.order.findUnique({
      where: { id: orderId },
      select: { vendorId: true, vendor: { select: { userId: true } } },
    });

    if (!orderToUpdate) {
      throw new OrderCreationError('Order not found.', 404);
    }

    // 2. Authorize the user
    const user = await prisma.user.findUnique({
      where: { id: shoppingHandlerUserId },
      select: { role: true, vendorId: true },
    });

    // Correctly check if the user's ID matches the userId on the order's vendor record.
    const isVendorOwner = user?.role === Role.vendor && orderToUpdate.vendor.userId === shoppingHandlerUserId;
    const isAssignedStaff = (user?.role === Role.store_admin || user?.role === Role.store_shopper) && user.vendorId === orderToUpdate.vendorId;
    const isAdmin = user?.role === Role.admin;

    if (!isVendorOwner && !isAssignedStaff && !isAdmin) {
      throw new OrderCreationError('You are not authorized to accept this order.', 403);
    }

    // Perform an atomic update with a where clause to enforce state and ownership
    const acceptedOrder = await prisma.order.update({
      where: {
        id: orderId,
        vendorId: orderToUpdate.vendorId, // Use the vendorId from the fetched order
        orderStatus: OrderStatus.pending, // Only accept orders that are currently pending
        shoppingMethod: ShoppingMethod.vendor, // Only accept if vendor is responsible for shopping
        shopperId: null, // Ensure it's not already assigned
      },
      data: {
        orderStatus: OrderStatus.accepted_for_shopping, // Change status to accepted
        shopperId: shoppingHandlerUserId, // Assign the handler (the accepting staff)
      },
    });

    // --- Add Notification Logic Here ---
    await notificationService.createNotification({
      userId: acceptedOrder.userId,
      type: NotificationType.ORDER_ACCEPTED,
      category: NotificationCategory.ORDER,
      title: 'Your order has been accepted!',
      body: `Your order with code #${acceptedOrder.orderCode} has been accepted  and will begin preparing it shortly.`,
      meta: { orderId: acceptedOrder.id }
    });
    // --- End Notification Logic ---


    return acceptedOrder;
  } catch (error: any) {
    if (error.code === 'P2025') { // Prisma error for record not found
      // This means the order was not found OR it didn't match the where conditions (e.g., already accepted)
      throw new OrderCreationError('Order not found or cannot be accepted in its current state.', 400);
    }
    console.error(`Error accepting order ${orderId}:`, error);
    throw new OrderCreationError('Failed to accept order: ' + error.message, 500);
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
  return prisma.$transaction(async (tx) => {
    // 1. Find the order to get customerId, totalAmount, and items for refund/restock
    const orderToDecline = await tx.order.findFirst({
      where: {
        id: orderId,
        vendorId: vendorId,
        orderStatus: OrderStatus.pending,
        shoppingMethod: ShoppingMethod.vendor,
      },
      include: {
        orderItems: true, // Need order items to restock
      },
    });

    if (!orderToDecline) {
      throw new OrderCreationError('Order not found or cannot be declined in its current state/by this vendor.', 404);
    }

    // 2. Refund the customer by crediting their wallet and creating a REFUND transaction.
    if (orderToDecline.totalAmount > 0) {
      await tx.wallet.update({
        where: { userId: orderToDecline.userId },
        data: { balance: { increment: orderToDecline.totalAmount } },
      });

      await tx.transaction.create({
        data: {
          userId: orderToDecline.userId,
          amount: orderToDecline.totalAmount, // Positive amount for a credit
          type: TransactionType.REFUND,
          source: TransactionSource.SYSTEM,
          description: `Refund for declined order #${orderId.substring(0, 8)}`,
          orderId: orderId,
        },
      });
    }

    // 4. Update the order status to declined
    const declinedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        orderStatus: OrderStatus.declined_by_vendor,
        paymentStatus: PaymentStatus.refunded,
        reasonForDecline: reason,
      },
    });

     // --- Replace TODO with Notification Logic Here ---
    await notificationService.createNotification({
      userId: orderToDecline.userId,
      type: NotificationType.ORDER_DECLINED,
      category: NotificationCategory.ORDER,
      title: 'Your order has been declined',
      body: `Unfortunately, your order #${orderToDecline.orderCode} was declined. You have been refunded ${orderToDecline.totalAmount} in your wallet.`,
      meta: { orderId: orderToDecline.id }
    });
    // --- End Notification Logic ---

    return declinedOrder;
  });
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
  // 1. Fetch the order first to get its details for authorization
  const orderToUpdate = await prisma.order.findUnique({
    where: { id: orderId },
    select: { vendorId: true, orderStatus: true, shoppingMethod: true, shopperId: true },
  });

  if (!orderToUpdate) {
    throw new OrderCreationError('Order not found.', 404);
  }

  try {
    // 2. Authorize the user
    const user = await prisma.user.findUnique({
      where: { id: shoppingHandlerUserId },
      include: { vendors: { select: { id: true } } }, // Include vendors owned by the user
    });

    if (!user) {
      throw new OrderCreationError('Requesting user not found.', 404);
    }

    const isVendorOwner = user.role === Role.vendor && user.vendors.some(v => v.id === orderToUpdate.vendorId);
    const isAssignedStaff = (user.role === Role.store_admin || user.role === Role.store_shopper) && user.vendorId === orderToUpdate.vendorId;

    if (!isVendorOwner && !isAssignedStaff) {
      throw new OrderCreationError('Unauthorized to start shopping for this vendor/order.', 403);
    }

    // 3. Perform the update with state checks
    const order = await prisma.order.update({
      where: {
        id: orderId,
        orderStatus: OrderStatus.accepted_for_shopping, // Corrected: Can only start shopping for an accepted order.
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
      throw new OrderCreationError('Order cannot start shopping in its current state.', 400);
    }
    console.error(`Error starting shopping for order ${orderId}:`, error);
    throw new OrderCreationError('Failed to start shopping: ' + error.message, 500);
  }
};


export interface UpdateOrderItemShoppingStatusPayload {
  status?: OrderItemStatus;
  quantityFound?: number;
  chosenReplacementId?: string;
}

/**
 * Updates the shopping status of an order item.
 * Performed by the shopper/vendor.
 * @param orderId The ID of the order.
 * @param itemId The ID of the order item to update.
 * @param shopperId The ID of the user performing the action.
 * @param payload The update payload.
 * @returns The updated order item.
 */
export const updateOrderItemShoppingStatusService = async (
  orderId: string,
  itemId: string,
  shopperId: string,
  payload: UpdateOrderItemShoppingStatusPayload
): Promise<OrderItem> => {
  const { status, quantityFound, chosenReplacementId } = payload;  
  // 1. Fetch order and user details for authorization
  const [order, requestingUser] = await Promise.all([
    prisma.order.findUnique({
      where: { id: orderId },
      select: { shopperId: true, deliveryPersonId: true, userId: true, vendorId: true, shoppingMethod: true },
    }),
    prisma.user.findUnique({
      where: { id: shopperId },
      select: { role: true, vendorId: true },
    }),
  ]);

  if (!order) { throw new OrderCreationError('Order not found.', 404); }
  if (!requestingUser) { throw new OrderCreationError('Requesting user not found.', 404); }

  // 2. Authorize the request
  const isAssignedShopperByVendor = order.shoppingMethod === 'vendor' && order.shopperId === shopperId;
  const isAssignedShopperAsDeliveryPerson = order.shoppingMethod === 'delivery_person' && order.shopperId === shopperId;
  const isStoreAdmin = requestingUser.role === Role.store_admin && requestingUser.vendorId === order.vendorId;
  
  // For a vendor, we need to check if they own the store associated with the order.
  let isVendorOwner = false;
  if (requestingUser.role === Role.vendor) {
    const vendor = await prisma.vendor.findFirst({ where: { id: order.vendorId, userId: shopperId } });
    isVendorOwner = !!vendor;
  }

  if (!isAssignedShopperByVendor && !isAssignedShopperAsDeliveryPerson && !isStoreAdmin && !isVendorOwner) {
    throw new OrderCreationError('You are not authorized to update this order item.', 403);
  }

  // Validate payload logic
  if (status === 'FOUND' && quantityFound === undefined) {
    throw new OrderCreationError('quantityFound is required when status is FOUND.');
  }

  const updatedItem = await prisma.orderItem.update({
    where: { id: itemId, orderId: orderId }, // Ensure item belongs to the order
    data: {
      status,
      quantityFound,
      chosenReplacementId,
      isReplacementApproved: chosenReplacementId ? null : undefined, // Reset approval status if a new replacement is suggested
    },
    include: {
      vendorProduct: { include: { product: true } },
      chosenReplacement: { include: { product: true } },
    },
  });

  // Emit real-time update to the customer
  try {
    const io = getIO();
    // The room is the orderId. The customer and shopper should be in this room.
    io.to(orderId).emit('order_item_updated', updatedItem);
  } catch (error) {
    console.error('Socket.IO error in updateOrderItemShoppingStatusService:', error);
  }

  return updatedItem;
};

export interface RespondToReplacementPayload {
  approved: boolean;
}

/**
 * Allows a customer to approve or reject a suggested replacement for an order item.
 * @param orderId The ID of the order.
 * @param itemId The ID of the order item.
 * @param customerId The ID of the customer.
 * @param payload The response payload.
 * @returns The updated order item.
 */
export const respondToReplacementService = async (
  orderId: string,
  itemId: string,
  customerId: string,
  payload: RespondToReplacementPayload
): Promise<OrderItem> => {
  const { approved } = payload;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { userId: true },
  });

  if (!order) {
    throw new OrderCreationError('Order not found.', 404);
  }

  // Authorize: only the customer who placed the order can respond
  if (order.userId !== customerId) {
    throw new OrderCreationError('You are not authorized to respond to this item.', 403);
  }

  const itemToUpdate = await prisma.orderItem.findFirst({
    where: { id: itemId, orderId: orderId },
  });

  if (!itemToUpdate) {
    throw new OrderCreationError('Order item not found.', 404);
  }

  if (!itemToUpdate.chosenReplacementId) {
    throw new OrderCreationError('No replacement has been suggested for this item.', 400);
  }

  const updatedItem = await prisma.orderItem.update({
    where: { id: itemId },
    data: {
      isReplacementApproved: approved,
      status: approved ? OrderItemStatus.REPLACED : itemToUpdate.status, // If approved, status becomes REPLACED. If not, it stays as it was (e.g., NOT_FOUND).
    },
    include: {
      vendorProduct: { include: { product: true } },
      chosenReplacement: { include: { product: true } },
    },
  });

  // Emit real-time update to the shopper/vendor
  try {
    const io = getIO();
    io.to(orderId).emit('replacement_responded', updatedItem);
  } catch (error) {
    console.error('Socket.IO error in respondToReplacementService:', error);
  }

  return updatedItem;
};




export interface GetOrdersForVendorOptions {
  vendorId?: string;
  status?: OrderStatus;
  staffVendorId?: string; // The vendorId from the staff member's token
}

/**
 * Retrieves all orders for a vendor user across all their stores.
 * It can be filtered by a specific vendorId (store) or order status.
 *
 * @param requestingUserId The ID of the authenticated user.
 * @param requestingUserRole The role of the authenticated user.
 * @param options Filtering options including vendorId and status.
 * @returns A promise that resolves to an array of orders.
 * @throws OrderCreationError if the user has no vendors or if the specified vendorId does not belong to the user.
 */
export const getOrdersForVendorUserService = async (
  requestingUserId: string,
  requestingUserRole: Role,
  options: GetOrdersForVendorOptions
): Promise<orderModel.OrderWithRelations[]> => {
  const { vendorId, status, staffVendorId } = options;
  const modelFilters: orderModel.GetOrdersForVendorFilters = {};

  switch (requestingUserRole) {
    case Role.vendor:
      // 1. Get all vendors owned by the user.
      const userVendors = await vendorModel.getVendorsByUserId(requestingUserId);
      if (userVendors.length === 0) return [];

      const userVendorIds = userVendors.map((v) => v.id);
      modelFilters.vendorIds = userVendorIds;

      // 2. If a specific vendorId is provided, validate it and narrow the query.
      if (vendorId) {
        if (!userVendorIds.includes(vendorId)) {
          throw new OrderCreationError('You are not authorized to access orders for this vendor.', 403);
        }
        modelFilters.vendorIds = [vendorId];
      }
      break;

    case Role.store_admin:
      if (!staffVendorId) throw new OrderCreationError('You are not assigned to a store.', 403);
      if (vendorId && vendorId !== staffVendorId) {
        throw new OrderCreationError('You are not authorized to access orders for this vendor.', 403);
      }
      modelFilters.vendorIds = [staffVendorId];
      break;

    case Role.store_shopper:
      if (!staffVendorId) throw new OrderCreationError('You are not assigned to a store.', 403);
      if (vendorId && vendorId !== staffVendorId) {
        throw new OrderCreationError('You are not authorized to access orders for this vendor.', 403);
      }
      modelFilters.vendorIds = [staffVendorId];
      break;

    default:
      throw new OrderCreationError('You are not authorized to perform this action.', 403);
  }

  // 3. Fetch the orders using the determined vendor IDs and optional status.
  modelFilters.status = status;
  return orderModel.findOrdersForVendors(modelFilters);
};

/**
 * Verifies the pickup OTP for an order and transitions its status.
 * This is performed by a vendor or their staff when a customer/delivery person picks up an order.
 *
 * @param orderId The ID of the order.
 * @param otp The 6-digit OTP provided for verification.
 * @param requestingUserId The ID of the user (vendor/staff) performing the verification.
 * @param requestingUserRole The role of the user.
 * @param staffVendorId The vendor ID associated with the staff member, if applicable.
 * @returns The updated order object.
 * @throws OrderCreationError if OTP is invalid, order is in the wrong state, or user is unauthorized.
 */
export const verifyPickupOtpService = async (
  orderId: string,
  otp: string,
  requestingUserId: string,
  requestingUserRole: Role,
  staffVendorId?: string
): Promise<Order> => {
  return prisma.$transaction(async (tx) => {
    // 1. Fetch the order to verify against
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { vendor: { select: { userId: true } } },
    });

    if (!order) {
      throw new OrderCreationError('Order not found.', 404);
    }

    // 2. Authorization Check
    const isVendorOwner = requestingUserRole === Role.vendor && order.vendor.userId === requestingUserId;
    const isStoreStaff = (requestingUserRole === Role.store_admin || requestingUserRole === Role.store_shopper) && staffVendorId === order.vendorId;

    if (!isVendorOwner && !isStoreStaff) {
      throw new OrderCreationError('You are not authorized to verify this order.', 403);
    }

    // 3. OTP and Status Validation
    if (order.pickupOtp !== otp) {
      throw new OrderCreationError('Invalid OTP provided.', 400);
    }

    let nextStatus: OrderStatus;
    if (order.deliveryMethod === DeliveryMethod.customer_pickup && order.orderStatus === OrderStatus.ready_for_pickup) {
      nextStatus = OrderStatus.picked_up_by_customer;
    } else if (order.deliveryMethod === DeliveryMethod.delivery_person && order.orderStatus === OrderStatus.ready_for_delivery) {
      nextStatus = OrderStatus.en_route;
    } else {
      throw new OrderCreationError(`Order is not ready for pickup. Current status: ${order.orderStatus}`, 400);
    }

    // 4. Update the order: set new status, clear OTP, and timestamp verification
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        orderStatus: nextStatus,
        pickupOtpVerifiedAt: new Date(),
        // Set actual delivery time if it's a customer pickup
        actualDeliveryTime: nextStatus === OrderStatus.picked_up_by_customer ? new Date() : undefined,
      },
    });

    // TODO: Add notification logic here to inform the customer that their order is on its way or has been picked up.

    return updatedOrder;
  });
};


/**
 * (Admin) Retrieves overview data for all orders on the platform.
 * @returns An object containing total counts for orders, products ordered, and cancelled orders.
 */
export const getOrderOverviewDataService = async (): Promise<{
  totalOrders: number;
  totalProductsOrdered: number;
  totalCancelledOrders: number;
}> => {
  const [totalOrders, productsOrderedAggregation, totalCancelledOrders] = await prisma.$transaction([
    prisma.order.count(),
    prisma.orderItem.aggregate({
      _sum: {
        quantity: true,
      },
    }),
    prisma.order.count({
      where: { orderStatus: { in: [OrderStatus.cancelled_by_customer, OrderStatus.declined_by_vendor] } },
    }),
  ]);

  const totalProductsOrdered = productsOrderedAggregation._sum.quantity || 0;

  return { totalOrders, totalProductsOrdered, totalCancelledOrders };
};

/**
 * (Admin) Retrieves a paginated list of all orders with filtering.
 * @param filters - The filtering criteria.
 * @param pagination - The pagination options.
 * @returns A paginated list of orders.
 */
export const adminGetAllOrdersService = async (
  filters: orderModel.AdminGetOrdersFilters,
  pagination: orderModel.Pagination
) => {
  return orderModel.adminGetAllOrders(filters, pagination);
};

/**
 * (Admin) Updates specific fields of an order. This provides a powerful way for an admin
 * to "un-stuck" an order by changing its status, re-assigning staff, etc.
 *
 * @param orderId The ID of the order to update.
 * @param updates The payload containing fields to update.
 * @returns The updated order.
 */
export const adminUpdateOrderService = async (
  orderId: string,
  updates: orderModel.UpdateOrderPayload
): Promise<Order> => {
  // If the only update is the status, we can reuse the existing service to ensure all side effects are handled.
  // However, for more complex admin edits, we need a dedicated transaction.
  
  const order = await orderModel.getOrderById(orderId);
  if (!order) {
    throw new OrderCreationError('Order not found.', 404);
  }

  // Special handling for 'delivered' status to trigger payouts
  if (updates.orderStatus === OrderStatus.delivered && order.orderStatus !== OrderStatus.delivered) {
    updates.actualDeliveryTime = new Date(); // Set delivery time

    return prisma.$transaction(async (tx) => {
      // 1. Pay Vendor
      const vendorAmount = order.subtotal;
      if (vendorAmount > 0 && order.vendor.userId) {
        await tx.wallet.updateMany({
          where: { vendorId: order.vendorId },
          data: { balance: { increment: vendorAmount } },
        });
        await transactionModel.createTransaction({
          vendorId: order.vendorId,
          userId: order.vendor.userId,
          amount: vendorAmount,
          type: TransactionType.VENDOR_PAYOUT,
          source: TransactionSource.SYSTEM,
          status: 'COMPLETED',
          description: `Payout for order #${order.orderCode}`,
          orderId: order.id,
        }, tx);
      }

      // TODO: Add logic for Shopper and Delivery Person tip payouts if applicable, similar to updateOrderStatusService

      // 2. Update the order with all the admin's changes
      return orderModel.updateOrder(orderId, updates, tx);
    });
  }

  // For any other status change or field update, perform a direct update.
  // Note: If cancelling, you might need to add refund logic here as well.
  if (
    (updates.orderStatus === OrderStatus.cancelled_by_customer || updates.orderStatus === OrderStatus.declined_by_vendor) &&
    order.paymentStatus === PaymentStatus.paid
  ) {
    // TODO: Implement refund logic here. For now, we just update the status.
    // This would involve crediting the user's wallet or initiating a Stripe refund.
    updates.paymentStatus = PaymentStatus.refunded;
  }


  return orderModel.updateOrder(orderId, updates);
};