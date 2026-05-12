import { Request, Response, Router } from 'express';
import * as orderModel from '../models/order.model';
import * as orderHistoryModel from '../models/orderHistory.model';
import * as vendorModel from '../models/vendor.model'; // Add this import for vendorModel
import { PrismaClient, Order, OrderItem, Role, ShoppingMethod, OrderStatus, DeliveryMethod, VendorProduct, Product, DeliveryAddress, Prisma, PaymentMethods, OrderItemStatus, PaymentStatus, TransactionType, TransactionSource, TransactionStatus, NotificationCategory, NotificationType, ReferenceType, RefundType } from '@prisma/client';
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
import { processRefundService } from './transaction.service';
import Stripe from 'stripe';
import { Or } from '@prisma/client/runtime/library';
import { uploadMedia } from './media.service';
import { Readable } from 'stream';

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

export type OrderWithVendorExtras = orderModel.OrderWithRelations & {
  vendor: orderModel.OrderWithRelations['vendor'] & {
    rating: { average: number; count: number };
    distance?: number;
  };
};

/**
 * Retrieves an order by its ID.
 * @param id - The ID of the order to retrieve.
 * @returns The order, or null if not found.
 */
export const getOrderByIdService = async (
  id: string,
  requestingUserId: string,
  requestingUserRole: Role | undefined,
  staffVendorId?: string
): Promise<OrderWithVendorExtras | null> => {
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
  const isDeliveryPerson = requestingUserRole === Role.delivery_person && (
    order.deliveryPersonId === requestingUserId ||
    (order.deliveryPersonId === null && order.deliveryMethod === DeliveryMethod.delivery_person)
  );



  if (!isCustomer && !isVendorOwner && !isStoreStaff && !isAdmin && !isDeliveryPerson) {
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
      
      // Integrate Measurement Units: Convert to miles if user prefers imperial
      if (order.measurementUnit === 'imperial') {
        distance = parseFloat((calculatedDistance * 0.621371).toFixed(2));
      } else {
        distance = parseFloat(calculatedDistance.toFixed(2));
      }
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

  return orderWithExtras as OrderWithVendorExtras;
};

/**
 * Recalculates the order's subtotal, fees, and total amount based on the current
 * status of its order items (safely handling NOT_FOUND and REPLACED items).
 * @param orderId The ID of the order.
 * @param tx Optional Prisma transaction client.
 * @returns The updated Order object.
 */
export const recalculateOrderTotal = async (orderId: string, tx?: Prisma.TransactionClient): Promise<Order & { ebtEligibleSubtotal: number }> => {
  const db = tx || prisma;
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true }
  });

  if (!order) throw new OrderCreationError('Order not found for recalculation.', 404);

  const activeItems: { vendorProductId: string; quantity: number; price?: number; isEbtEligible?: boolean }[] = [];

  for (const item of order.orderItems) {
    if (item.status === OrderItemStatus.NOT_FOUND) {
      continue; // Skip items that weren't found
    } else if (item.status === OrderItemStatus.REPLACED) {
      if (item.isReplacementApproved && item.chosenReplacementId) {
        const repPrices = (item.replacementPrices as Record<string, number>) || {};
        const lockedRepPrice = item.chosenReplacementId ? repPrices[item.chosenReplacementId] : undefined;

        activeItems.push({
          vendorProductId: item.chosenReplacementId,
          quantity: item.quantityFound ?? item.quantity,
          price: lockedRepPrice, // Use the locked replacement price from the JSON map
          isEbtEligible: item.isEbtEligible
        });
      }
      // If REPLACED but rejected or pending approval, we omit it to prevent overcharging
    } else {
      // FOUND or PENDING. Use quantityFound if they updated it, otherwise fallback to initial requested quantity
      activeItems.push({
        vendorProductId: item.vendorProductId,
        quantity: item.quantityFound ?? item.quantity,
        price: item.purchasedPrice ?? undefined, // Pass the locked price back to the fee service
        isEbtEligible: item.isEbtEligible
      });
    }
  }

  // Recalculate all fees exactly as we do during order creation
  const feesResult = activeItems.length > 0 ? await calculateOrderFeesService({
    orderItems: activeItems,
    vendorId: order.vendorId,
    deliveryAddressId: order.deliveryAddressId || undefined,
    deliveryType: order.deliveryMethod || undefined,
    allowUnpublishedVendor: true, // Crucial: recalculations should work even if vendor is draft
    skipAvailabilityCheck: true, // Prevent mid-shopping catalog stock changes from crashing the recalculation
  }, db) : { subtotal: 0, shoppingFee: 0, deliveryFee: 0, serviceFee: 0, ebtEligibleSubtotal: 0 };

  const finalTotalAmount = feesResult.subtotal + feesResult.shoppingFee + feesResult.deliveryFee + feesResult.serviceFee + (order.shopperTip || 0) + (order.deliveryPersonTip || 0);

  const updatedOrder = await db.order.update({
    where: { id: orderId },
    data: {
      subtotal: feesResult.subtotal,
      shoppingFee: feesResult.shoppingFee,
      deliveryFee: feesResult.deliveryFee,
      serviceFee: feesResult.serviceFee,
      totalAmount: finalTotalAmount,
    }
  });

  return { ...updatedOrder, ebtEligibleSubtotal: feesResult.ebtEligibleSubtotal };
};

/**
 * Retrieves the history of an order.
 * @param orderId - The ID of the order.
 * @param requestingUserId - The ID of the user requesting the history.
 * @param requestingUserRole - The role of the user requesting the history.
 * @param staffVendorId - The vendor ID if the user is staff.
 */
export const getOrderHistoryService = async (
  orderId: string,
  requestingUserId: string,
  requestingUserRole: Role,
  staffVendorId?: string
) => {
  // Reuse getOrderByIdService for authorization check
  const order = await getOrderByIdService(orderId, requestingUserId, requestingUserRole, staffVendorId);
  
  if (!order) {
    // If getOrderByIdService returns null, it means either not found or unauthorized (it throws for unauthorized usually, but let's be safe)
    // Actually getOrderByIdService throws 403 if unauthorized, so if we get here, we are good or it's 404.
    // However, getOrderByIdService returns null if not found.
    // We should probably check if the order exists first to distinguish 404 from 403 if we weren't reusing logic.
    // Since we reuse it, if it throws, this function throws. If it returns null, we return null.
    // But wait, getOrderByIdService throws 403.
    // Let's just try to fetch it.
    throw new OrderCreationError('Order not found or access denied.', 404);
  }

  return orderHistoryModel.getOrderHistoryByOrderId(orderId);
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

/**
 * Internal helper to resolve UTC operating boundaries for a vendor on a specific date.
 */
const getVendorBusinessHoursForDate = (
  vendor: { openingHours: any[]; timezone?: string | null },
  dateInVendorTZ: dayjs.Dayjs
) => {
  const dayOfWeek = getDayEnumFromDayjs(dateInVendorTZ.day());
  const openingHours = vendor.openingHours.find((h) => h.day === dayOfWeek);

  if (!openingHours || !openingHours.open || !openingHours.close) {
    return null;
  }

  const [openHour, openMinute] = openingHours.open.split(':').map(Number);
  const [closeHour, closeMinute] = openingHours.close.split(':').map(Number);

  // Construct times relative to the vendor's local day then convert back to UTC
  const vendorLocalDate = dateInVendorTZ.startOf('day');
  const openTimeUTC = vendorLocalDate.hour(openHour).minute(openMinute).second(0).millisecond(0).utc();
  let closeTimeUTC = vendorLocalDate.hour(closeHour).minute(closeMinute).second(0).millisecond(0).utc();

  // Handle operating hours that cross over midnight
  if (closeTimeUTC.isBefore(openTimeUTC)) {
    closeTimeUTC = closeTimeUTC.add(1, 'day');
  }

  return { openTimeUTC, closeTimeUTC, rawHours: openingHours };
};

/**
 * Internal helper to resolve delivery method specific constraints.
 */
const getDeliveryRequirements = (deliveryMethod: DeliveryMethod, closeTimeUTC: dayjs.Dayjs) => {
  if (deliveryMethod === DeliveryMethod.customer_pickup) {
    return {
      bufferMinutes: 60, // 1 hour prep
      latestPossibleEndUTC: closeTimeUTC.subtract(1, 'hour'),
    };
  }
  return {
    bufferMinutes: 90, // 1.5 hour prep
    latestPossibleEndUTC: closeTimeUTC,
  };
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
  useMaxPricesForBudget?: boolean; // Added for opt-in budget calculation
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
    useMaxPricesForBudget,
  } = payload;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new OrderCreationError('User not found.', 404);

  let shoppingStartTime: Date | undefined;

  // --- 2. Validate scheduled time against vendor hours ---
  if (scheduledDeliveryTime) {
    const nowUTC = dayjs.utc();
    const parsedScheduledDeliveryTime = dayjs.utc(scheduledDeliveryTime);
    if (!parsedScheduledDeliveryTime.isValid()) {
      throw new OrderCreationError('Invalid scheduled delivery time format.');
    }

    if (parsedScheduledDeliveryTime.isBefore(nowUTC)) {
      throw new OrderCreationError('Scheduled delivery time cannot be in the past.');
    }

    const vendor = await getVendorById(vendorId, undefined, undefined, true);
    if (!vendor) throw new OrderCreationError('Vendor not found.', 404);

    const vendorTimezone = vendor.timezone || 'UTC';
    // Identify which local business day the requested time falls into
    const deliveryInVendorTZ = parsedScheduledDeliveryTime.tz(vendorTimezone);

    const boundaries = getVendorBusinessHoursForDate(vendor, deliveryInVendorTZ);

    if (!boundaries) {
      throw new OrderCreationError(`Vendor is closed or has no defined hours for the selected day.`);
    }

    const { bufferMinutes, latestPossibleEndUTC } = getDeliveryRequirements(deliveryMethod, boundaries.closeTimeUTC);

    const earliestPossibleStartUTC = nowUTC.add(bufferMinutes, 'minutes');
    const requestedSlotEndUTC = parsedScheduledDeliveryTime.add(1, 'hour');

    // Perform strict boundary validation
    if (parsedScheduledDeliveryTime.isBefore(boundaries.openTimeUTC) || requestedSlotEndUTC.isAfter(boundaries.closeTimeUTC)) {
      throw new OrderCreationError(`Scheduled time must be within vendor business hours (${boundaries.rawHours.open} - ${boundaries.rawHours.close} local time).`);
    }

    if (parsedScheduledDeliveryTime.isBefore(earliestPossibleStartUTC)) {
      throw new OrderCreationError(`Scheduled time is too soon. Please allow at least ${bufferMinutes} minutes for preparation.`);
    }

    if (requestedSlotEndUTC.isAfter(latestPossibleEndUTC)) {
      throw new OrderCreationError(`Selected time is too close to closing for ${deliveryMethod === DeliveryMethod.customer_pickup ? 'pickup' : 'delivery'}.`);
    }

    // Calculate target shoppingStartTime for internal tracking
    if (deliveryMethod === DeliveryMethod.delivery_person) {
      shoppingStartTime = parsedScheduledDeliveryTime.subtract(2, 'hour').toDate();
    } else if (deliveryMethod === DeliveryMethod.customer_pickup) {
      shoppingStartTime = parsedScheduledDeliveryTime.subtract(1, 'hour').toDate();
    }
  }

  // --- Pre-fetch prices for all customer-suggested replacements ---
  const allReplacementIds = new Set<string>();
  orderItems.forEach(item => {
    if (item.replacementIds) {
      item.replacementIds.forEach(id => allReplacementIds.add(id));
    }
  });
  const replacementPriceMap = new Map<string, number>();
  if (allReplacementIds.size > 0) {
    const replacementProducts = await prisma.vendorProduct.findMany({
      where: { id: { in: Array.from(allReplacementIds) }, published: true }, // Ensure only published replacements are considered
      select: { id: true, price: true, discountedPrice: true }
    });
    replacementProducts.forEach(p => replacementPriceMap.set(p.id, p.discountedPrice ?? p.price));
  }

  // --- 3. Calculate Fees (Moved outside transaction to support Stripe call) ---
  // We calculate fees before the transaction to get the total amount for the PaymentIntent.
  const fees = await calculateOrderFeesService({
    orderItems,
    vendorId: vendorId,
    deliveryAddressId: shippingAddressId || undefined,
    deliveryType: deliveryMethod,
    allowUnpublishedVendor: false, // Initial orders MUST be from published vendors
    useMaxPricesForBudget,
    // IMPORTANT: The calculateOrderFeesService (in fee.service.ts) must also be updated
    // to ensure that it only considers 'published: true' products when validating
    // the initial orderItems and fetching their prices.
  });

  const { subtotal, deliveryFee, serviceFee, shoppingFee } = fees;

  const finalTotalAmount =
    subtotal +
    (deliveryFee || 0) +
    (serviceFee || 0) +
    (shoppingFee || 0) +
    (shopperTip || 0) +
    (deliveryPersonTip || 0);

  // Note: Stripe Payment Intent is now handled entirely by the /transactions/create-payment-intent endpoint
  // to enforce strict budget maximums after order creation.
  
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
      budgetAmount: finalTotalAmount,
      deliveryFee, serviceFee, shoppingFee,
      // Snapshot user preferences
      replacementPreference: user.replacementPreference,
      measurementUnit: user.measurementUnit,
      shopperTip, deliveryPersonTip,
      paymentMethod, shoppingMethod, deliveryMethod, scheduledDeliveryTime,
      shoppingStartTime, deliveryAddressId: shippingAddressId, deliveryInstructions,
    }, tx);

    // --- 5b. Create Initial History Entry ---
    await orderHistoryModel.createOrderHistory({
      orderId: newOrder.id,
      status: OrderStatus.pending,
      changedBy: userId,
      notes: 'Order placed'
    }, tx);

    // --- Extract the prices returned from the fee service to lock them in ---
    const itemDetailsMap = new Map(
      fees.itemPrices.map((ip) => [ip.vendorProductId, { price: ip.price, isEbtEligible: ip.isEbtEligible }])
    );

    // --- 6. Create the OrderItem records ---
    for (const item of orderItems) {
      if (item.quantity <= 0) {
        throw new OrderCreationError(`Quantity for product ${item.vendorProductId} must be positive.`);
      }

      let replacementPrices: Record<string, number> = {};
      if (item.replacementIds) {
        item.replacementIds.forEach(id => {
          const price = replacementPriceMap.get(id);
          if (price !== undefined) replacementPrices[id] = price;
        });
      }

      const details = itemDetailsMap.get(item.vendorProductId);

      await tx.orderItem.create({
        data: {
          orderId: newOrder.id,
          vendorProductId: item.vendorProductId,
          purchasedPrice: details?.price, // Lock in the historical price
          isEbtEligible: details?.isEbtEligible ?? false, // Lock in EBT eligibility
          replacementPrices: Object.keys(replacementPrices).length > 0 ? replacementPrices : undefined,
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


    // Return the final order (the frontend will use order.id to generate the Stripe PaymentIntent separately)
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

    // 4. Update the order with new tips
    const newShopperTip = payload.shopperTip ?? existingOrder.shopperTip;
    const newDeliveryPersonTip = payload.deliveryPersonTip ?? existingOrder.deliveryPersonTip;

    await tx.order.update({
      where: { id: orderId },
      data: {
        shopperTip: newShopperTip,
        deliveryPersonTip: newDeliveryPersonTip,
      },
    });

    // 5. Trigger a full recalculation to guarantee totals are mathematically perfect
    const recalculatedOrder = await recalculateOrderTotal(orderId, tx);

    if (recalculatedOrder.budgetAmount !== null && recalculatedOrder.totalAmount > recalculatedOrder.budgetAmount) {
      throw new OrderCreationError("The new tip causes the order to exceed your pre-paid budget. Please lower the tip amount.");
    }

    return recalculatedOrder;
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
  requestingUserRole: Role,
  staffVendorId?: string
): Promise<Order> => {
  const updates: orderModel.UpdateOrderPayload = { orderStatus: status };

  const order = await orderModel.getOrderById(orderId);
  if (!order) {
    throw new OrderCreationError('Order not found', 404);
  }

  // --- State Machine and Authorization Logic ---
  const assertHasRole = (allowedRoles: Role[]) => {
    if (!allowedRoles.includes(requestingUserRole)) {
      throw new OrderCreationError(`Role '${requestingUserRole}' is not authorized to set status to '${status}'.`, 403);
    }
  };

  const assertPreviousStatus = (allowedStatuses: OrderStatus[]) => {
    if (!allowedStatuses.includes(order.orderStatus)) {
      throw new OrderCreationError(`Cannot transition from '${order.orderStatus}' to '${status}'.`, 409);
    }
  };

  const assertIsShopper = () => {
    if (
      order.shopperId !== requestingUserId && 
      requestingUserRole !== Role.vendor && 
      requestingUserRole !== Role.store_admin &&
      requestingUserRole !== Role.admin
    ) {
      throw new OrderCreationError('You are not the assigned shopper for this order.', 403);
    }
  };

  const assertIsDeliveryPerson = () => {
    if (order.deliveryPersonId !== requestingUserId) {
      throw new OrderCreationError('You are not the assigned delivery person for this order.', 403);
    }
  };

  switch (status) {
    // --- Phase 1: Pickup & Shop ---
    case OrderStatus.en_route_to_pickup:
      assertHasRole([Role.delivery_person]);
      if (order.shoppingMethod === ShoppingMethod.delivery_person && order.deliveryMethod === DeliveryMethod.delivery_person) {
        assertPreviousStatus([OrderStatus.accepted_for_shopping]);
      } else {
        assertPreviousStatus([OrderStatus.accepted_for_delivery]);
      }
      assertIsDeliveryPerson();
      break;

    case OrderStatus.arrived_at_store:
      assertHasRole([Role.delivery_person]);
      assertPreviousStatus([OrderStatus.en_route_to_pickup]);
      assertIsDeliveryPerson();
      break;

    case OrderStatus.currently_shopping:
      assertHasRole([Role.store_shopper, Role.store_admin, Role.delivery_person, Role.vendor]);
      assertPreviousStatus([OrderStatus.accepted_for_shopping, OrderStatus.arrived_at_store]);
      assertIsShopper();
      break;

    case OrderStatus.completed_bagging:
      assertHasRole([Role.store_shopper, Role.store_admin, Role.delivery_person, Role.vendor]);
      assertPreviousStatus([OrderStatus.currently_shopping]);
      assertIsShopper();

      // Validation: Ensure no items are left PENDING
      const items = await prisma.orderItem.findMany({ where: { orderId } });
      if (items.some(i => i.status === OrderItemStatus.PENDING)) {
        throw new OrderCreationError("Cannot complete shopping while some items are still PENDING. Please mark all items as Found, Not Found, or Replaced.");
      }

      // Case: All items were marked NOT_FOUND
      if (items.every(i => i.status === OrderItemStatus.NOT_FOUND)) {
        const terminalOrder = await prisma.$transaction(async (tx) => {
          return await handleNoItemsFoundOrder(orderId, requestingUserId, tx);
        });
        return terminalOrder;
      }
      break;

    case OrderStatus.ready_for_pickup:
      assertHasRole([Role.store_shopper, Role.store_admin, Role.delivery_person, Role.vendor]);
      assertPreviousStatus([OrderStatus.completed_bagging]);
      assertIsShopper();
      break;

    case OrderStatus.ready_for_delivery:
      assertHasRole([Role.store_shopper, Role.store_admin, Role.delivery_person, Role.vendor]);
      assertPreviousStatus([OrderStatus.completed_bagging]);
      assertIsShopper();
      break;

    // --- Phase 2: Delivery to Customer ---
    case OrderStatus.en_route_to_delivery:
      assertHasRole([Role.delivery_person]);
      assertPreviousStatus([OrderStatus.ready_for_delivery]); // This assumes OTP was handled or is not required for this flow
      assertIsDeliveryPerson();
      break;

    case OrderStatus.arrived_at_customer_location:
      assertHasRole([Role.delivery_person]);
      assertPreviousStatus([OrderStatus.en_route_to_delivery]);
      assertIsDeliveryPerson();
      break;

    // --- Phase 3: Return Flow ---
    case OrderStatus.en_route_to_return_pickup:
    case OrderStatus.arrived_at_return_pickup_location:
    case OrderStatus.en_route_to_return_to_store:
    case OrderStatus.returned_to_store:
      assertHasRole([Role.delivery_person]);
      assertIsDeliveryPerson();
      // Add more specific previous status checks for return flow if needed
      break;

    default:
      // For other statuses like 'cancelled_by_customer', we might need different logic.
      // For now, we block any unhandled transitions.
      throw new OrderCreationError(`Status transition to '${status}' is not handled by this service.`, 400);
  }

  // --- Create History Entry (Before Transaction to ensure it's ready) ---
  // Actually, better inside transaction if we had one wrapping everything, but here we are.
  // We'll do it after successful update or inside the delivered transaction.
  const historyPayload = {
    orderId,
    status,
    changedBy: requestingUserId,
  };

  // --- Add Notification Logic Here ---
  try {
    const orderDetails = order; // Use the already fetched order
    if (orderDetails) {
      switch (status as OrderStatus) {
        case OrderStatus.ready_for_pickup:
          await notificationService.createNotification({
            userId: orderDetails.userId,
            type: NotificationType.ORDER_READY_FOR_PICKUP,
            category: NotificationCategory.ORDER,
            title: 'Your order is ready for pickup!',
            body: `Order #${orderDetails.orderCode} is now ready for pickup at ${orderDetails.vendor.name}.`,
            meta: { orderId: orderId }
          });
          break;

        case OrderStatus.en_route_to_delivery:
          await notificationService.createNotification({
            userId: orderDetails.userId,
            type: NotificationType.EN_ROUTE,
            category: NotificationCategory.ORDER,
            title: 'Your order is on the way!',
            body: `Your delivery person is en route with order #${orderDetails.orderCode}.`,
            meta: { orderId: orderId }
          });
          break;

        case OrderStatus.arrived_at_store:
          await notificationService.createNotification({
            userId: orderDetails.vendor.userId,
            type: NotificationType.EN_ROUTE,
            category: NotificationCategory.ORDER,
            title: 'Delivery Person Arrived',
            body: `The delivery person has arrived at the store for order #${orderDetails.orderCode}.`,
            meta: { orderId: orderId }
          });
          break;

        case OrderStatus.arrived_at_customer_location:
          await notificationService.createNotification({
            userId: orderDetails.userId,
            type: NotificationType.EN_ROUTE,
            category: NotificationCategory.ORDER,
            title: 'Delivery Person Arrived',
            body: `Your delivery person has arrived at your location for order #${orderDetails.orderCode}.`,
            meta: { orderId: orderId }
          });
          break;

        // Return Flow Notifications
        case OrderStatus.en_route_to_return_to_store:
          await notificationService.createNotification({
            userId: orderDetails.vendor.userId,
            type: NotificationType.ACCOUNT_UPDATE, // Or a more specific type
            category: NotificationCategory.ORDER,
            title: 'Order Return Initiated',
            body: `The delivery person is returning order #${orderDetails.orderCode} to your store.`,
            meta: { orderId: orderId }
          });
          break;

        case OrderStatus.returned_to_store:
          await notificationService.createNotification({
            userId: orderDetails.vendor.userId,
            type: NotificationType.ACCOUNT_UPDATE, // Or a more specific type
            category: NotificationCategory.ORDER,
            title: 'Order Returned',
            body: `Order #${orderDetails.orderCode} has been successfully returned to your store.`,
            meta: { orderId: orderId }
          });
          break;
      }
    }
  } catch (error) {
    console.error('Error sending notification during order status update:', error);
  }
  // --- End Notification Logic ---

  // Log history for non-delivered updates
  await orderHistoryModel.createOrderHistory(historyPayload);

  return orderModel.updateOrder(orderId, updates, prisma);
};

interface TimeSlot {
  date: string;
  timeSlots: {
    start: string; // ISO 8601 UTC string
    end: string;   // ISO 8601 UTC string
    display: string; // User-friendly local time string
  }[];
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
  const vendor = await getVendorById(vendorId, undefined, undefined, true);
  if (!vendor) {
    throw new OrderCreationError('Vendor not found.', 404);
  }
  if (!vendor.openingHours || vendor.openingHours.length === 0) {
    throw new OrderCreationError('Vendor has no opening hours defined.', 400);
  }

  const vendorTimezone = vendor.timezone || 'UTC';
  const availableSlotsByDay: TimeSlot[] = [];

  // 1. Anchor 'now' to UTC for absolute comparisons
  const nowUTC = dayjs.utc();
  // 2. Identify 'now' in vendor timezone to determine which business day we are in
  const nowInVendorTZ = nowUTC.tz(vendorTimezone);

  // Generate slots for the next 7 days
  for (let i = 0; i < 7; i++) {
    // Get the vendor's local date for this iteration
    const vendorLocalDate = nowInVendorTZ.add(i, 'day');
    const boundaries = getVendorBusinessHoursForDate(vendor, vendorLocalDate);

    if (!boundaries) continue;

    const { bufferMinutes, latestPossibleEndUTC } = getDeliveryRequirements(deliveryMethod, boundaries.closeTimeUTC);
    const earliestPossibleStartUTC = nowUTC.add(bufferMinutes, 'minutes');
    
    // Determine the first moment we can start showing slots for this specific day
    let firstAvailableTimeUTC = boundaries.openTimeUTC;
    if (i === 0 && earliestPossibleStartUTC.isAfter(boundaries.openTimeUTC)) {
      firstAvailableTimeUTC = earliestPossibleStartUTC;
    }

    // Align to the start of the next hour for clean slots (e.g., 10:00, 11:00)
    let currentSlotStartUTC = firstAvailableTimeUTC;
    if (currentSlotStartUTC.minute() > 0 || currentSlotStartUTC.second() > 0 || currentSlotStartUTC.millisecond() > 0) {
      currentSlotStartUTC = currentSlotStartUTC.add(1, 'hour').startOf('hour');
    }

    const timeSlots: TimeSlot['timeSlots'] = [];

    // Generate 1-hour slots until the end of the next slot is past the latest end time.
    while (currentSlotStartUTC.isBefore(latestPossibleEndUTC)) {
      const slotEndUTC = currentSlotStartUTC.add(1, 'hour');

      // Ensure the entire slot is within the allowed business window
      if (slotEndUTC.isAfter(latestPossibleEndUTC)) {
        break;
      }

      // Calculate local strings for user display using vendor's timezone
      const localStart = currentSlotStartUTC.tz(vendorTimezone);
      const localEnd = slotEndUTC.tz(vendorTimezone);


      timeSlots.push({
        start: currentSlotStartUTC.toISOString(),
        end: slotEndUTC.toISOString(),
        display: `${localStart.format('h:mma')} - ${localEnd.format('h:mma')}`.toLowerCase(),
      });
      currentSlotStartUTC = slotEndUTC;
    }

    if (timeSlots.length > 0) {
      availableSlotsByDay.push({
        date: vendorLocalDate.format('DD-MM-YYYY'),
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
    OrderStatus.declined_by_vendor,
    OrderStatus.cancelled_by_customer,
    OrderStatus.no_items_found,
  ];

  try {
    const orders = await prisma.order.findMany({
      where: {
        vendorId: vendorId,
        
        ...(
          options?.status ? 
          { orderStatus: options.status } :
          { orderStatus: { in: defaultStatuses}}
        ),
        // Payment Check: Ensure order is fully paid (unless it is a cash order)
        AND: [
          {
            OR: [
              { paymentStatus: PaymentStatus.paid },
              { paymentMethod: PaymentMethods.cash },
              // Terminal orders should stay visible even if paymentStatus is 'refunded'
              { orderStatus: { in: [OrderStatus.declined_by_vendor, OrderStatus.cancelled_by_customer, OrderStatus.no_items_found] } }
            ]
          },
          {
            // logic: if it's a terminal status, show it regardless of time. 
            // If it's active, apply the 30-minute look-ahead window.
            OR: [
              { orderStatus: { in: [OrderStatus.declined_by_vendor, OrderStatus.cancelled_by_customer, OrderStatus.no_items_found] } },
              {
                AND: [
                  { orderStatus: { notIn: [OrderStatus.declined_by_vendor, OrderStatus.cancelled_by_customer, OrderStatus.no_items_found] } },
                  {
                    OR: [
                      { shoppingStartTime: null },
                      { shoppingStartTime: { lte: dayjs().add(30, 'minutes').utc().toDate() } },
                    ]
                  }
                ]
              }
            ]
          }
        ]
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

    // --- Create History Entry ---
    await orderHistoryModel.createOrderHistory({
      orderId: acceptedOrder.id,
      status: OrderStatus.accepted_for_shopping,
      changedBy: shoppingHandlerUserId,
      notes: 'Order accepted for shopping'
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

    // 2. Refund the customer via original payment method
    if (orderToDecline.paymentStatus === PaymentStatus.paid) {
      const successfulTxs = await tx.transaction.findMany({
        where: { orderId: orderToDecline.id, status: TransactionStatus.COMPLETED, type: TransactionType.ORDER_PAYMENT }
      });
      for (const t of successfulTxs) {
        const tPaymentType = (t.meta as any)?.paymentType || 'card';
        await processRefundService(tx, orderToDecline, Math.abs(t.amount), `Refund for declined order #${orderToDecline.orderCode}`, RefundType.FULL_REVERSAL, tPaymentType);
      }
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

    // --- Create History Entry ---
    await orderHistoryModel.createOrderHistory({
      orderId: declinedOrder.id,
      status: OrderStatus.declined_by_vendor,
      changedBy: vendorId, // Or the specific user if we had it passed down, but vendorId is close enough for context
      notes: reason ? `Declined: ${reason}` : 'Order declined by vendor'
    }, tx);

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
        shopperId: shoppingHandlerUserId, // Ensure the person starting is the one who accepted
      },
      data: {
        orderStatus: OrderStatus.currently_shopping, // Transition to shopping
        shopperId: shoppingHandlerUserId, // Re-confirm handler, or assign if not already done by accept
      },
    });

    // --- Create History Entry ---
    await orderHistoryModel.createOrderHistory({
      orderId: order.id,
      status: OrderStatus.currently_shopping,
      changedBy: shoppingHandlerUserId,
      notes: 'Shopping started'
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
  replacementBarcode?: string;
}

/**
 * Internal helper to check if every item in the order has been marked as NOT_FOUND.
 */
const areAllOrderItemsNotFound = async (orderId: string, tx: Prisma.TransactionClient): Promise<boolean> => {
  const items = await tx.orderItem.findMany({
    where: { orderId },
    select: { status: true }
  });

  if (items.length === 0) return false;

  return items.every(item => item.status === OrderItemStatus.NOT_FOUND);
};

/**
 * Terminal failure flow when shopping yields zero items.
 * Resets fees, handles refunds, and updates order to a closed failure state.
 */
const handleNoItemsFoundOrder = async (orderId: string, shopperId: string, tx: Prisma.TransactionClient): Promise<Order & { ebtEligibleSubtotal: number }> => {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { vendor: true }
  });

  if (!order) throw new OrderCreationError('Order not found for terminal failure handling.', 404);

  // 1. Process Refund/Cancellation if payment was already paid
  if (order.paymentStatus === PaymentStatus.paid) {
    // Find all successful payment transactions for this order to perform a full reversal on each
    const successfulTxs = await tx.transaction.findMany({
      where: { orderId: order.id, status: TransactionStatus.COMPLETED, type: TransactionType.ORDER_PAYMENT }
    });

    for (const t of successfulTxs) {
      const tPaymentType = (t.meta as any)?.paymentType || 'card';
      // Refund each transaction individually to its original source (EBT or Card)
      await processRefundService(tx, order, Math.abs(t.amount), `Full reversal for order #${order.orderCode} (No items found during shopping)`, RefundType.FULL_REVERSAL, tPaymentType);
    }
  }

  // 2. Update Order to terminal failure state with zeroed fees and tips
  const updatedOrder = await tx.order.update({
    where: { id: orderId },
    data: {
      orderStatus: OrderStatus.no_items_found,
      // If it was paid, processRefundService handles the transaction record; we update status here for consistency.
      paymentStatus: order.paymentStatus === PaymentStatus.paid ? PaymentStatus.refunded : order.paymentStatus,
      subtotal: 0,
      totalAmount: 0,
      deliveryFee: 0,
      serviceFee: 0,
      shoppingFee: 0,
      shopperTip: 0,
      deliveryPersonTip: 0,
      // Keep shopperId assigned so they can "unmark" items if found later
      deliveryPersonId: null,
    }
  });

  // 3. Create Terminal History Entry
  await orderHistoryModel.createOrderHistory({
    orderId,
    status: OrderStatus.no_items_found,
    changedBy: shopperId,
    notes: 'Shopping completed: No items were available in the store.'
  }, tx);

  // 4. Send Notifications
  const meta = { orderId };

  // Notify Customer
  await notificationService.createNotification({
    userId: order.userId,
    type: NotificationType.ORDER_SHOPPING_FAILED,
    category: NotificationCategory.ORDER,
    title: 'Order Unfulfilled',
    body: `We're sorry, but none of the items in your order #${order.orderCode} were available. Any pending charges have been reversed.`,
    meta
  });

  // Notify Vendor Owner/Admin
  if (order.vendor.userId) {
    await notificationService.createNotification({
      userId: order.vendor.userId,
      type: NotificationType.ORDER_SHOPPING_FAILED,
      category: NotificationCategory.ORDER,
      title: 'Shopping Failed (No Items)',
      body: `Shopping for order #${order.orderCode} was completed with no items found. The order has been closed.`,
      meta
    });
  }

  // If a delivery person was assigned, notify them of cancellation
  if (order.deliveryPersonId) {
    await notificationService.createNotification({
      userId: order.deliveryPersonId,
      type: NotificationType.ORDER_CANCELLED,
      category: NotificationCategory.ORDER,
      title: 'Delivery Cancelled',
      body: `The delivery for order #${order.orderCode} was cancelled because no items were found.`,
      meta
    });
  }

  return { ...updatedOrder, ebtEligibleSubtotal: 0 };
};



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
  let { status, quantityFound, chosenReplacementId, replacementBarcode } = payload;
  // 1. Fetch order and user details for authorization
  const [order, requestingUser] = await Promise.all([
    prisma.order.findUnique({
      where: { id: orderId },
      select: { shopperId: true, deliveryPersonId: true, userId: true, vendorId: true, shoppingMethod: true, orderStatus: true, replacementPreference: true },
    }),
    prisma.user.findUnique({
      where: { id: shopperId },
      select: { role: true, vendorId: true },
    }),
  ]);

  if (!order) { throw new OrderCreationError('Order not found.', 404); }
  if (!requestingUser) { throw new OrderCreationError('Requesting user not found.', 404); }

  // Check for terminal status - cannot update items once shopping is finalized or order is closed.
  const terminalStatuses = [
    OrderStatus.ready_for_pickup,
    OrderStatus.ready_for_delivery,
    OrderStatus.delivered,
    OrderStatus.picked_up_by_customer,
    OrderStatus.declined_by_vendor,
    OrderStatus.cancelled_by_customer
  ] as OrderStatus[];
  
  if (terminalStatuses.includes(order.orderStatus)) {
    throw new OrderCreationError(`Cannot update items for an order with status '${order.orderStatus}'.`, 403);
  }

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

  const { updatedItem, updatedOrder, shouldNotifyOriginalFound } = await prisma.$transaction(async (tx) => {
    // Automatically update order status to currently_shopping if it isn't already
    if (order.orderStatus !== OrderStatus.currently_shopping) {
      await tx.order.update({
        where: { id: orderId },
        data: { orderStatus: OrderStatus.currently_shopping },
      });
      await orderHistoryModel.createOrderHistory({
        orderId,
        status: OrderStatus.currently_shopping,
        changedBy: shopperId,
        notes: 'Shopping started automatically via item update',
      }, tx);
    }

    // Handle ad-hoc replacement via barcode or explicit ID
    let newReplacementPrice: number | undefined;
    let newReplacementEbtEligible: boolean | undefined;
    let actualChosenReplacementId = chosenReplacementId;

    if (actualChosenReplacementId || replacementBarcode) {
      if (!actualChosenReplacementId && replacementBarcode) {
        const vendorProduct = await tx.vendorProduct.findFirst({
          where: { vendorId: order.vendorId, product: { barcode: replacementBarcode }, published: true }, // Only allow published products as replacements
          select: { id: true, price: true, discountedPrice: true, isEbtEligible: true }
        });
    
        if (!vendorProduct) {
          throw new OrderCreationError(`No product found with barcode ${replacementBarcode} in this store.`);
        }
        actualChosenReplacementId = vendorProduct.id;
        newReplacementPrice = vendorProduct.discountedPrice ?? vendorProduct.price;
        newReplacementEbtEligible = vendorProduct.isEbtEligible;
      } else if (actualChosenReplacementId) {
        // The shopper selected the ID directly (or the frontend sent a pre-selected fallback)
        const vendorProduct = await tx.vendorProduct.findFirst({ // Changed to findFirst to allow adding 'published' to where clause
          where: { id: actualChosenReplacementId, published: true }, // Only allow published products as replacements
          select: { price: true, discountedPrice: true, isEbtEligible: true }
        });
        if (!vendorProduct) throw new OrderCreationError(`Replacement product not found.`);
        newReplacementPrice = vendorProduct.discountedPrice ?? vendorProduct.price;
        newReplacementEbtEligible = vendorProduct.isEbtEligible;
      }
    }

    // Retrieve existing replacement prices to merge in any new ad-hoc suggestions
    const currentItem = await tx.orderItem.findUnique({ 
      where: { id: itemId },
      include: { 
        replacements: { select: { id: true } },
        vendorProduct: { select: { isEbtEligible: true } }
      } 
    });
    let updatedReplacementPrices = (currentItem?.replacementPrices && typeof currentItem.replacementPrices === 'object') ? (currentItem.replacementPrices as Record<string, number>) : {};

    const wasPreviouslyMissing = currentItem?.status === OrderItemStatus.NOT_FOUND || currentItem?.status === OrderItemStatus.REPLACED;
    
    let isPreApproved = false;
    if (actualChosenReplacementId && currentItem?.replacements) {
      const preSelectedIds = currentItem.replacements.map(r => r.id);
      if (preSelectedIds.includes(actualChosenReplacementId)) {
        isPreApproved = true;
      }
    }

    // Integrate Replacement Preference logic
    if (order.replacementPreference === 'dont_replace' && actualChosenReplacementId) {
      const isPreApproved = currentItem?.replacements.some(r => r.id === actualChosenReplacementId);
      // If the user said "don't replace", we only allow items they pre-selected during checkout
      if (!isPreApproved) {
        throw new OrderCreationError("This customer has selected 'Do not replace'. You cannot suggest new replacements.");
      }
    }

    if (actualChosenReplacementId && !isPreApproved && newReplacementPrice !== undefined) {
      updatedReplacementPrices = { ...updatedReplacementPrices, [actualChosenReplacementId]: newReplacementPrice };
    }

    // Enforce strict State Machine for replacements
    let finalStatus = status;
    if (actualChosenReplacementId) {
      finalStatus = isPreApproved ? OrderItemStatus.REPLACED : OrderItemStatus.NOT_FOUND;
    } else if (status === OrderItemStatus.REPLACED && !actualChosenReplacementId) {
      finalStatus = OrderItemStatus.NOT_FOUND; // Failsafe
    }
  
    // If finding the original item, we must clear any previous replacement data and restore original EBT status
    const isFindingOriginal = finalStatus === OrderItemStatus.FOUND || finalStatus === OrderItemStatus.PENDING;

    const item = await tx.orderItem.update({
      where: { id: itemId }, 
      data: {
        status: finalStatus,
        quantityFound,
        chosenReplacementId: actualChosenReplacementId ?? (isFindingOriginal ? null : undefined),
        isReplacementApproved: actualChosenReplacementId ? (isPreApproved ? true : null) : (isFindingOriginal ? null : undefined),
        isEbtEligible: (actualChosenReplacementId && isPreApproved && newReplacementEbtEligible !== undefined) 
          ? newReplacementEbtEligible 
          : (isFindingOriginal ? (currentItem?.vendorProduct?.isEbtEligible ?? false) : undefined),
        replacementPrices: Object.keys(updatedReplacementPrices).length > 0 ? updatedReplacementPrices : undefined,
      },
      include: {
        vendorProduct: { include: { product: true } },
        chosenReplacement: { include: { product: true } },
      },
    });

    // Recalculate totals since an item state changed
    let recalculatedOrder = await recalculateOrderTotal(orderId, tx);

    // Enforce the Strict Budget Barrier
    if (recalculatedOrder.budgetAmount !== null && recalculatedOrder.totalAmount > recalculatedOrder.budgetAmount) {
      throw new OrderCreationError("This replacement exceeds the customer's pre-paid budget.");
    }

    // Check if everything is now "NOT_FOUND" to trigger terminal failure flow
    const allNotFound = await areAllOrderItemsNotFound(orderId, tx);
    if (allNotFound) {
      recalculatedOrder = await handleNoItemsFoundOrder(orderId, shopperId, tx);
    }

    return { 
      updatedItem: item, 
      updatedOrder: recalculatedOrder, 
      shouldNotifyOriginalFound: wasPreviouslyMissing && isFindingOriginal 
    };
  });

  // Emit real-time update to the customer
  try {
    const io = getIO();
    // The room is the orderId. The customer and shopper should be in this room.
    io.to(orderId).emit('order_item_updated', updatedItem);
    io.to(orderId).emit('order_total_updated', updatedOrder);

    if (shouldNotifyOriginalFound) {
      await notificationService.createNotification({
        userId: order.userId,
        type: NotificationType.ACCOUNT_UPDATE,
        category: NotificationCategory.ORDER,
        title: 'Original Item Found!',
        body: `Good news! Your shopper found the original item: ${updatedItem.vendorProduct.name}.`,
        meta: { orderId, itemId }
      });
    }
  } catch (error: any) {
    if (error.message === 'Socket.IO not initialized!') {
      console.warn('Socket.IO warning: Real-time update not sent. Socket.IO is not initialized.');
    } else {
      console.error('Socket.IO error in updateOrderItemShoppingStatusService:', error);
    }
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

  const { updatedItem, updatedOrder } = await prisma.$transaction(async (tx) => {
    const item = await tx.orderItem.update({
      where: { id: itemId },
      data: {
        isReplacementApproved: approved,
        status: approved ? OrderItemStatus.REPLACED : OrderItemStatus.NOT_FOUND,
      },
      include: {
        vendorProduct: { include: { product: true } },
        chosenReplacement: { include: { product: true } },
      },
    });

    const recalculatedOrder = await recalculateOrderTotal(orderId, tx);

    // Enforce the Strict Budget Barrier
    if (recalculatedOrder.budgetAmount !== null && recalculatedOrder.totalAmount > recalculatedOrder.budgetAmount) {
      throw new OrderCreationError("This replacement exceeds the customer's pre-paid budget.");
    }

    return { updatedItem: item, updatedOrder: recalculatedOrder };
  });

  // Emit real-time update to the shopper/vendor
  try {
    const io = getIO();
    io.to(orderId).emit('replacement_responded', updatedItem);
    io.to(orderId).emit('order_total_updated', updatedOrder);
  } catch (error: any) {
    if (error.message === 'Socket.IO not initialized!') {
      console.warn('Socket.IO warning: Real-time update not sent. Socket.IO is not initialized.');
    } else {
      console.error('Socket.IO error in respondToReplacementService:', error);
    }
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

    if (order.deliveryMethod === DeliveryMethod.customer_pickup) {
      if (order.orderStatus === OrderStatus.ready_for_pickup) {
        nextStatus = OrderStatus.picked_up_by_customer;
      } else {
        throw new OrderCreationError(`Order is not ready for pickup. Current status: ${order.orderStatus}`, 400);
      }
    } else if (order.deliveryMethod === DeliveryMethod.delivery_person) {
      if (order.orderStatus === OrderStatus.ready_for_delivery || order.orderStatus === OrderStatus.arrived_at_store) {
        nextStatus = OrderStatus.en_route_to_delivery;
      } else {
        throw new OrderCreationError(`Order is not ready for pickup. Current status: ${order.orderStatus}`, 400);
      }
    } else {
      throw new OrderCreationError(`Invalid delivery method or status for OTP verification.`, 400);
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

    // Handle payouts if picked up by customer (Terminal State)
    if (nextStatus === OrderStatus.picked_up_by_customer) {
      // Recalculate one final time to guarantee absolute accuracy based on the delivered cart reality
      const finalOrder = await recalculateOrderTotal(orderId, tx);

      // --- CALCULATE PAYMENT SPLIT ---
      const successfulTxs = await tx.transaction.findMany({
        where: { orderId: order.id, status: TransactionStatus.COMPLETED, type: TransactionType.ORDER_PAYMENT }
      });

      const ebtPaid = successfulTxs.filter(t => (t.meta as any)?.paymentType === 'ebt').reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const cardPaid = successfulTxs.filter(t => (t.meta as any)?.paymentType !== 'ebt').reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const ebtRequired = finalOrder.ebtEligibleSubtotal;
      const ebtAmountUsed = Math.min(ebtPaid, ebtRequired);
      
      const vendorAmount = finalOrder.subtotal;
      const vendorEbtPortion = ebtAmountUsed;
      const vendorCardPortion = parseFloat((vendorAmount - vendorEbtPortion).toFixed(2));

      if (vendorAmount > 0 && order.vendor.userId) {
        await tx.wallet.upsert({
          where: { vendorId: order.vendorId },
          create: { vendorId: order.vendorId, balance: vendorAmount },
          update: { balance: { increment: vendorAmount } }
        });
        await tx.transaction.create({
          data: {
            vendorId: order.vendorId,
            userId: order.vendor.userId,
            amount: vendorAmount,
            type: TransactionType.VENDOR_PAYOUT,
            source: TransactionSource.SYSTEM,
            status: TransactionStatus.COMPLETED,
            description: `Payment for order #${order.orderCode}`,
            orderId: order.id,
            meta: {
              ebtPortion: vendorEbtPortion,
              cardPortion: vendorCardPortion,
              paymentType: vendorEbtPortion > 0 ? (vendorCardPortion > 0 ? 'split' : 'ebt') : 'card'
            }
          },
        });
      }

      // Pay Shopper Tip (if applicable)
      if (finalOrder.shopperId && finalOrder.shopperTip && finalOrder.shopperTip > 0) {
        await tx.wallet.upsert({
          where: { userId: finalOrder.shopperId },
          create: { userId: finalOrder.shopperId, balance: finalOrder.shopperTip },
          update: { balance: { increment: finalOrder.shopperTip } },
        });
        await tx.transaction.create({
          data: {
            userId: finalOrder.shopperId,
            amount: finalOrder.shopperTip,
            type: TransactionType.TIP_PAYOUT,
            source: TransactionSource.SYSTEM,
            status: TransactionStatus.COMPLETED,
            description: `Tip for order #${order.orderCode}`,
            orderId: order.id,
          },
        });
      }

      // Record Platform Fees (Customer Pickup = No Delivery Fee)
      const platformRevenue = (finalOrder.serviceFee || 0) + (finalOrder.shoppingFee || 0);
      if (platformRevenue > 0) {
        await tx.transaction.create({
          data: {
            userId: order.userId, // Tagging the customer who paid the fee
            amount: platformRevenue,
            type: TransactionType.PLATFORM_FEE_COLLECTED,
            source: TransactionSource.SYSTEM,
            status: TransactionStatus.COMPLETED,
            description: `Platform fees collected for order #${order.orderCode}`,
            orderId: order.id,
          },
        });
      }

      // --- SPLIT OVERPAYMENT RECONCILIATION ---
      if (order.paymentStatus === PaymentStatus.paid && order.paymentMethod !== PaymentMethods.cash) {
        const cardRequired = parseFloat((finalOrder.totalAmount - ebtAmountUsed).toFixed(2));

        const ebtOverpayment = parseFloat((ebtPaid - ebtAmountUsed).toFixed(2));
        const cardOverpayment = parseFloat((cardPaid - cardRequired).toFixed(2));

        if (ebtOverpayment > 0.01) {
          await processRefundService(tx, order, ebtOverpayment, `Overpayment Refund (EBT) for order #${order.orderCode}`, RefundType.PARTIAL_REFUND, 'ebt');
        }
        if (cardOverpayment > 0.01) {
          await processRefundService(tx, order, cardOverpayment, `Overpayment Refund (Card) for order #${order.orderCode}`, RefundType.PARTIAL_REFUND, 'card');
        }
      }
    }

    // Notifications
    if (nextStatus === OrderStatus.picked_up_by_customer) {
      await notificationService.createNotification({
        userId: order.userId,
        type: NotificationType.COMPLETED,
        category: NotificationCategory.ORDER,
        title: 'Order Picked Up',
        body: `Your order #${order.orderCode} has been picked up. Thank you for shopping with us!`,
        meta: { orderId: order.id }
      });
    } else if (nextStatus === OrderStatus.en_route_to_delivery) {
      await notificationService.createNotification({
        userId: order.userId,
        type: NotificationType.EN_ROUTE,
        category: NotificationCategory.ORDER,
        title: 'Order En Route',
        body: `Your order #${order.orderCode} has been picked up by the delivery person and is on its way.`,
        meta: { orderId: order.id }
      });
    }

    // --- Create History Entry ---
    await orderHistoryModel.createOrderHistory({
      orderId: updatedOrder.id,
      status: nextStatus,
      changedBy: requestingUserId,
      notes: 'Pickup OTP verified'
    }, tx);

    return updatedOrder;
  });
};


/**
 * (Admin) Retrieves overview data for all orders on the platform.
 * @returns An object containing total counts for orders, total products, in-stock products, and cancelled orders.
 */
export const getOrderOverviewDataService = async (): Promise<{
  totalOrders: number;
  totalProducts: number;
  inStockProducts: number;
  totalCancelledOrders: number;
}> => {
  const [totalOrders, totalProducts, inStockProducts, totalCancelledOrders] = await prisma.$transaction([
    prisma.order.count(),
    prisma.vendorProduct.count(),
    prisma.vendorProduct.count({ where: { isAvailable: true } }),
    prisma.order.count({
      where: { orderStatus: { in: [OrderStatus.cancelled_by_customer, OrderStatus.declined_by_vendor] } },
    }),
  ]);

  return { totalOrders, totalProducts, inStockProducts, totalCancelledOrders };
};

/**
 * (Admin) Retrieves a paginated list of all orders with filtering.
 * @param filters - The filtering criteria.
 * @param pagination - The pagination options.
 * @returns A paginated list of orders.
 */
export const adminGetAllOrdersService = async (
  filters: any,
  pagination: { page: number; take: number }
) => {
  const { orderCode, status, customerName, createdAtStart, createdAtEnd } = filters;
  const skip = (pagination.page - 1) * pagination.take;

  const where: Prisma.OrderWhereInput = {};

  if (orderCode) {
    where.orderCode = { contains: orderCode, mode: 'insensitive' };
  }

  if (status) {
    if (Array.isArray(status)) {
      where.orderStatus = { in: status };
    } else {
      where.orderStatus = status;
    }
  }

  if (customerName) {
    where.user = {
      name: { contains: customerName, mode: 'insensitive' },
    };
  }

  if (createdAtStart || createdAtEnd) {
    where.createdAt = {};
    if (createdAtStart) where.createdAt.gte = new Date(createdAtStart);
    if (createdAtEnd) where.createdAt.lte = new Date(createdAtEnd);
  }

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, mobileNumber: true } },
        vendor: { select: { id: true, name: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data: orders,
    pagination: {
      total,
      page: pagination.page,
      limit: pagination.take,
      totalPages: Math.ceil(total / pagination.take),
    },
  };
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
      // Recalculate one final time to guarantee payout accuracy
      const finalOrder = await recalculateOrderTotal(orderId, tx);
      
      // --- CALCULATE PAYMENT SPLIT ---
      const successfulTxs = await tx.transaction.findMany({
        where: { orderId: order.id, status: TransactionStatus.COMPLETED, type: TransactionType.ORDER_PAYMENT }
      });

      const ebtPaid = successfulTxs.filter(t => (t.meta as any)?.paymentType === 'ebt').reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const cardPaid = successfulTxs.filter(t => (t.meta as any)?.paymentType !== 'ebt').reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const ebtRequired = finalOrder.ebtEligibleSubtotal;
      const ebtAmountUsed = Math.min(ebtPaid, ebtRequired);

      const vendorAmount = finalOrder.subtotal;
      const vendorEbtPortion = ebtAmountUsed;
      const vendorCardPortion = parseFloat((vendorAmount - vendorEbtPortion).toFixed(2));

      // 1. Pay Vendor
      if (vendorAmount > 0 && order.vendor.userId) {
        await tx.wallet.upsert({
          where: { vendorId: order.vendorId },
          create: { vendorId: order.vendorId, balance: vendorAmount },
          update: { balance: { increment: vendorAmount } },
        });
        await tx.transaction.create({
          data: {
            vendorId: order.vendorId,
            userId: order.vendor.userId,
            amount: vendorAmount,
            type: TransactionType.VENDOR_PAYOUT,
            source: TransactionSource.SYSTEM,
            status: TransactionStatus.COMPLETED,
            description: `Payout for order #${order.orderCode}`,
            orderId: order.id,
            meta: {
              ebtPortion: vendorEbtPortion,
              cardPortion: vendorCardPortion,
              paymentType: vendorEbtPortion > 0 ? (vendorCardPortion > 0 ? 'split' : 'ebt') : 'card'
            }
          }
        });
      }

      // 2. Pay Shopper Tip
      if (finalOrder.shopperId && finalOrder.shopperTip && finalOrder.shopperTip > 0) {
        await tx.wallet.upsert({
          where: { userId: finalOrder.shopperId },
          create: { userId: finalOrder.shopperId, balance: finalOrder.shopperTip },
          update: { balance: { increment: finalOrder.shopperTip } }
        });
        await tx.transaction.create({
          data: {
            userId: finalOrder.shopperId,
            amount: finalOrder.shopperTip,
            type: TransactionType.TIP_PAYOUT,
            source: TransactionSource.SYSTEM,
            status: TransactionStatus.COMPLETED,
            description: `Tip for order #${order.orderCode}`,
            orderId: order.id,
            meta: { paymentType: 'card' } // Tips are always from Card/Cash
          },
        });
      }

      // 3. Pay Delivery Person Tip & Delivery Fee Share
      const driverShare = Number(((finalOrder.deliveryFee || 0) * 0.8).toFixed(2));
      const platformDeliveryShare = Number(((finalOrder.deliveryFee || 0) - driverShare).toFixed(2));
      const driverTotalPayout = (finalOrder.deliveryPersonTip || 0) + driverShare;

      if (finalOrder.deliveryPersonId && driverTotalPayout > 0) {
        await tx.wallet.upsert({
          where: { userId: finalOrder.deliveryPersonId },
          create: { userId: finalOrder.deliveryPersonId, balance: driverTotalPayout },
          update: { balance: { increment: driverTotalPayout } }
        });
        
        if (finalOrder.deliveryPersonTip && finalOrder.deliveryPersonTip > 0) {
          await tx.transaction.create({
            data: {
              userId: finalOrder.deliveryPersonId,
              amount: finalOrder.deliveryPersonTip,
              type: TransactionType.TIP_PAYOUT,
              source: TransactionSource.SYSTEM,
              status: TransactionStatus.COMPLETED,
              description: `Tip for order #${order.orderCode}`,
              orderId: order.id,
              meta: { paymentType: 'card' }
            },
          });
        }

        if (driverShare > 0) {
          await tx.transaction.create({
            data: {
              userId: finalOrder.deliveryPersonId,
              amount: driverShare,
              type: TransactionType.DELIVERY_PAYOUT,
              source: TransactionSource.SYSTEM,
              status: TransactionStatus.COMPLETED,
              description: `Delivery fee for order #${order.orderCode}`,
              orderId: order.id,
              meta: { paymentType: 'card' }
            },
          });
        }
      }

      // 4. Record Platform Fees
      const platformRevenue = (finalOrder.serviceFee || 0) + (finalOrder.shoppingFee || 0) + platformDeliveryShare;
      if (platformRevenue > 0) {
        await tx.transaction.create({
          data: {
            userId: order.userId,
            amount: platformRevenue,
            type: TransactionType.PLATFORM_FEE_COLLECTED,
            source: TransactionSource.SYSTEM,
            status: TransactionStatus.COMPLETED,
            description: `Platform fees collected for order #${order.orderCode}`,
            orderId: order.id,
            meta: { paymentType: 'card' }
          },
        });
      }

      // --- SPLIT OVERPAYMENT RECONCILIATION ---
      if (order.paymentStatus === PaymentStatus.paid && order.paymentMethod !== PaymentMethods.cash) {
        const cardRequired = parseFloat((finalOrder.totalAmount - ebtAmountUsed).toFixed(2));

        const ebtOverpayment = parseFloat((ebtPaid - ebtAmountUsed).toFixed(2));
        const cardOverpayment = parseFloat((cardPaid - cardRequired).toFixed(2));

        if (ebtOverpayment > 0.01) {
          await processRefundService(tx, order, ebtOverpayment, `Overpayment Refund (EBT) for order #${order.orderCode}`, RefundType.PARTIAL_REFUND, 'ebt');
        }
        if (cardOverpayment > 0.01) {
          await processRefundService(tx, order, cardOverpayment, `Overpayment Refund (Card) for order #${order.orderCode}`, RefundType.PARTIAL_REFUND, 'card');
        }
      }
      
      // 2. Update the order with all the admin's changes
      // If status changed, log it
      if (updates.orderStatus) {
        await orderHistoryModel.createOrderHistory({
          orderId,
          status: updates.orderStatus,
          notes: 'Admin update',
          // changedBy: ??? We don't have admin ID here easily without passing it down. 
          // For now, we can leave changedBy null or update signature to accept adminId.
        }, tx);
      }
      return orderModel.updateOrder(orderId, updates, tx);
    });
  }

  // For any other status change or field update, perform a direct update.
  if (
    (updates.orderStatus === OrderStatus.cancelled_by_customer || updates.orderStatus === OrderStatus.declined_by_vendor) &&
    order.paymentStatus === PaymentStatus.paid
  ) { // This is a full reversal
    const successfulTxs = await prisma.transaction.findMany({
      where: { orderId: order.id, status: TransactionStatus.COMPLETED, type: TransactionType.ORDER_PAYMENT }
    });
    for (const t of successfulTxs) {
      const tPaymentType = (t.meta as any)?.paymentType || 'card';
      await processRefundService(prisma, order, Math.abs(t.amount), `Refund for order #${order.orderCode} (Admin/Customer Action)`, RefundType.FULL_REVERSAL, tPaymentType);
    }
    updates.paymentStatus = PaymentStatus.refunded;
  }

  // Log history if status is changing
  if (updates.orderStatus && updates.orderStatus !== order.orderStatus) {
     await orderHistoryModel.createOrderHistory({
          orderId,
          status: updates.orderStatus,
          notes: 'Admin update',
     });
  }

  return orderModel.updateOrder(orderId, updates);
};

/**
 * Retrieves all orders assigned to a specific delivery person.
 * @param deliveryPersonId - The ID of the delivery person.
 * @returns An array of orders.
 */
export const getOrdersForDeliveryPersonService = async (deliveryPersonId: string) => {
  return prisma.order.findMany({
    where: {
      deliveryPersonId: deliveryPersonId,
    },
    include: {
      user: { select: { id: true, name: true, mobileNumber: true, image: true } },
      vendor: { select: { id: true, name: true, address: true, mobileNumber: true, latitude: true, longitude: true, image: true } },
      deliveryAddress: true,
      orderItems: {
        include: {
          vendorProduct: {
            include: { product: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Retrieves all orders available for delivery persons to pick up.
 * Filters based on shopping method, status, and timing.
 */
export const getAvailableOrdersForDeliveryService = async (pagination: { page: number; take: number }) => {
  const thirtyMinsFromNow = dayjs().add(30, 'minute').toDate();
  const { page, take } = pagination;
  const skip = (page - 1) * take;

  const where: Prisma.OrderWhereInput = {
    deliveryMethod: DeliveryMethod.delivery_person,
    // Allow Paid orders OR Cash orders (which are pending payment)
    AND: [
      {
        OR: [
          { paymentStatus: PaymentStatus.paid },
          { paymentMethod: PaymentMethods.cash },
        ],
      },
    ],
    deliveryPersonId: null, // Only unassigned orders
    OR: [
      // Scenario A: Vendor shopped, ready for delivery
      {
        shoppingMethod: ShoppingMethod.vendor,
        orderStatus: OrderStatus.ready_for_delivery,
      },
      // Scenario B: Delivery person shops
      {
        shoppingMethod: ShoppingMethod.delivery_person,
        // Exclude terminal states to be safe
        orderStatus: {
          notIn: [OrderStatus.cancelled_by_customer, OrderStatus.declined_by_vendor, OrderStatus.delivered, OrderStatus.picked_up_by_customer]
        },
        /* OR: [
          { scheduledDeliveryTime: null },
          { scheduledDeliveryTime: { lte: thirtyMinsFromNow } }, // Show if scheduled time is within 30 mins or in the past
        ], */
      },
    ],
  };

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      select: {
        id: true,
        shoppingMethod: true,
        deliveryMethod: true,
        totalAmount: true,
        scheduledDeliveryTime: true,
        user: { select: { name: true } },
        _count: { select: { orderItems: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / take);

  const formattedOrders = orders.map(order => ({
    id: order.id,
    shoppingMethod: order.shoppingMethod,
    deliveryMethod: order.deliveryMethod,
    totalAmount: order.totalAmount,
    customerName: order.user?.name || 'Unknown',
    scheduledDeliveryTime: order.scheduledDeliveryTime,
    numberOfOrderItems: order._count.orderItems,
  }));

  return {
    data: formattedOrders,
    pagination: {
      total,
      page,
      limit: take,
      totalPages,
    }
  };
};

/**
 * Allows a delivery person to accept an available order.
 * @param orderId The ID of the order.
 * @param deliveryPersonId The ID of the delivery person.
 */
export const acceptOrderForDeliveryService = async (orderId: string, deliveryPersonId: string) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new OrderCreationError('Order not found.', 404);
    }

    if (order.deliveryPersonId) {
      throw new OrderCreationError('This order has already been assigned to another delivery person.', 409);
    }

    if (order.deliveryMethod !== DeliveryMethod.delivery_person) {
      throw new OrderCreationError('This order is not for delivery.', 400);
    }

    let nextStatus: OrderStatus;
    let updateShopper = false;

    if (order.shoppingMethod === ShoppingMethod.vendor) {
      if (order.orderStatus !== OrderStatus.ready_for_delivery) {
        throw new OrderCreationError('Order is not ready for delivery.', 400);
      }
      nextStatus = OrderStatus.accepted_for_delivery;
    } else {
      // Shopping by delivery person: They become the shopper as well.
      updateShopper = true;
      nextStatus = OrderStatus.accepted_for_shopping;
    }

    // Atomic Update: Ensure deliveryPersonId is still null to prevent race conditions
    const result = await tx.order.updateMany({
      where: { id: orderId, deliveryPersonId: null },
      data: {
        deliveryPersonId: deliveryPersonId,
        orderStatus: nextStatus,
        shopperId: updateShopper ? deliveryPersonId : undefined,
      },
    });

    if (result.count === 0) {
      throw new OrderCreationError('This order has already been assigned to another delivery person.', 409);
    }

    const updatedOrder = await tx.order.findUniqueOrThrow({ where: { id: orderId } });

    // Notify Customer
    await notificationService.createNotification({
      userId: updatedOrder.userId,
      type: NotificationType.ASSIGNED_TO_ORDER,
      category: NotificationCategory.ORDER,
      title: 'Delivery Person Assigned',
      body: `A delivery person has accepted your order #${updatedOrder.orderCode}.`,
      meta: { orderId: updatedOrder.id },
    });

    // --- Create History Entry ---
    await orderHistoryModel.createOrderHistory({
      orderId: updatedOrder.id,
      status: updatedOrder.orderStatus,
      changedBy: deliveryPersonId,
      notes: 'Accepted for delivery'
    }, tx);

    return updatedOrder;
  });
};

/**
 * Completes the delivery process for an order.
 * This is called when the delivery person takes a picture of the package at the doorstep.
 * It updates the status to 'delivered', saves the proof of delivery image, and triggers payouts.
 *
 * @param orderId The ID of the order.
 * @param deliveryPersonId The ID of the delivery person performing the action.
 * @param proofOfDeliveryImage The base64 string or URL of the proof of delivery image.
 */
export const completeDeliveryService = async (
  orderId: string,
  deliveryPersonId: string,
  proofOfDeliveryImage: string
): Promise<Order> => {
  const order = await orderModel.getOrderById(orderId);

  if (!order) {
    throw new OrderCreationError('Order not found.', 404);
  }

  if (order.deliveryPersonId !== deliveryPersonId) {
    throw new OrderCreationError('You are not the assigned delivery person for this order.', 403);
  }

  if (order.orderStatus !== OrderStatus.arrived_at_customer_location) {
    throw new OrderCreationError('Order must be at the customer location before completing delivery.', 400);
  }

  let proofOfDeliveryImageUrl = proofOfDeliveryImage;

  // Handle Base64 Image Upload
  if (proofOfDeliveryImage && !proofOfDeliveryImage.startsWith('http')) {
    try {
      const imageBuffer = Buffer.from(proofOfDeliveryImage, 'base64');
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: `${orderId}-proof-of-delivery.jpg`,
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: imageBuffer,
        size: imageBuffer.length,
        stream: new Readable(),
        destination: '',
        filename: '',
        path: '',
      };

      const uploadResult = await uploadMedia(mockFile, orderId, ReferenceType.other);
      proofOfDeliveryImageUrl = uploadResult.cloudinaryResult.secure_url;
    } catch (error) {
      console.error('Error uploading proof of delivery image:', error);
      throw new OrderCreationError('Failed to upload proof of delivery image.');
    }
  }

  const updates: orderModel.UpdateOrderPayload = {
    orderStatus: OrderStatus.delivered,
    actualDeliveryTime: new Date(),
    proofOfDeliveryImageUrl,
  };

  const completedOrder = await prisma.$transaction(async (tx) => {
    // Recalculate one final time to ensure absolute payout accuracy based on the delivered cart reality
    const finalOrder = await recalculateOrderTotal(orderId, tx);
    
    // --- CALCULATE PAYMENT SPLIT ---
    const successfulTxs = await tx.transaction.findMany({
      where: { orderId: order.id, status: TransactionStatus.COMPLETED, type: TransactionType.ORDER_PAYMENT }
    });

    const ebtPaid = successfulTxs.filter(t => (t.meta as any)?.paymentType === 'ebt').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const cardPaid = successfulTxs.filter(t => (t.meta as any)?.paymentType !== 'ebt').reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const ebtRequired = finalOrder.ebtEligibleSubtotal;
    const ebtAmountUsed = Math.min(ebtPaid, ebtRequired);

    const vendorAmount = finalOrder.subtotal;
    const vendorEbtPortion = ebtAmountUsed;
    const vendorCardPortion = parseFloat((vendorAmount - vendorEbtPortion).toFixed(2));

    // 1. Pay Vendor
    if (vendorAmount > 0 && order.vendor.userId) {
      await tx.wallet.upsert({
        where: { vendorId: order.vendorId },
        create: { vendorId: order.vendorId, balance: vendorAmount },
        update: { balance: { increment: vendorAmount } }
      });
      await tx.transaction.create({
        data: {
          vendorId: order.vendorId,
          userId: order.vendor.userId,
          amount: vendorAmount,
          type: TransactionType.VENDOR_PAYOUT,
          source: TransactionSource.SYSTEM,
          status: TransactionStatus.COMPLETED,
          description: `Payment for order #${order.orderCode}`,
          orderId: order.id,
          meta: {
            ebtPortion: vendorEbtPortion,
            cardPortion: vendorCardPortion,
            paymentType: vendorEbtPortion > 0 ? (vendorCardPortion > 0 ? 'split' : 'ebt') : 'card'
          }
        },
      });
    }

    // 2. Pay Shopper Tip
    if (finalOrder.shopperId && finalOrder.shopperTip && finalOrder.shopperTip > 0) {
      await tx.wallet.upsert({
        where: { userId: finalOrder.shopperId },
        create: { userId: finalOrder.shopperId, balance: finalOrder.shopperTip },
        update: { balance: { increment: finalOrder.shopperTip } }
      });
      await tx.transaction.create({
        data: {
          userId: finalOrder.shopperId,
          amount: finalOrder.shopperTip,
          type: TransactionType.TIP_PAYOUT,
          source: TransactionSource.SYSTEM,
          status: TransactionStatus.COMPLETED,
          description: `Tip for order #${order.orderCode}`,
          orderId: order.id,
          meta: { paymentType: 'card' }
        },
      });
    }

    // 3. Pay Delivery Person Tip & Delivery Fee Share
    const driverShare = Number(((finalOrder.deliveryFee || 0) * 0.8).toFixed(2));
    const platformDeliveryShare = Number(((finalOrder.deliveryFee || 0) - driverShare).toFixed(2));
    const driverTotalPayout = (finalOrder.deliveryPersonTip || 0) + driverShare;

    if (finalOrder.deliveryPersonId && driverTotalPayout > 0) {
      await tx.wallet.upsert({
        where: { userId: finalOrder.deliveryPersonId },
        create: { userId: finalOrder.deliveryPersonId, balance: driverTotalPayout },
        update: { balance: { increment: driverTotalPayout } }
      });
      
      if (finalOrder.deliveryPersonTip && finalOrder.deliveryPersonTip > 0) {
        await tx.transaction.create({
          data: {
            userId: finalOrder.deliveryPersonId,
            amount: finalOrder.deliveryPersonTip,
            type: TransactionType.TIP_PAYOUT,
            source: TransactionSource.SYSTEM,
            status: TransactionStatus.COMPLETED,
            description: `Tip for order #${order.orderCode}`,
            orderId: order.id,
            meta: { paymentType: 'card' }
          },
        });
      }

      if (driverShare > 0) {
        await tx.transaction.create({
          data: {
            userId: finalOrder.deliveryPersonId,
            amount: driverShare,
            type: TransactionType.DELIVERY_PAYOUT,
            source: TransactionSource.SYSTEM,
            status: TransactionStatus.COMPLETED,
            description: `Delivery fee for order #${order.orderCode}`,
            orderId: order.id,
            meta: { paymentType: 'card' }
          },
        });
      }
    }

    // 4. Record Platform Fees
    const platformRevenue = (finalOrder.serviceFee || 0) + (finalOrder.shoppingFee || 0) + platformDeliveryShare;
    if (platformRevenue > 0) {
      await tx.transaction.create({
        data: {
          userId: order.userId, // Tagging the customer who paid the fee
          amount: platformRevenue, 
          type: TransactionType.PLATFORM_FEE_COLLECTED,
          source: TransactionSource.SYSTEM,
          status: TransactionStatus.COMPLETED,
          description: `Platform fees collected for order #${order.orderCode}`,
          orderId: order.id,
          meta: { paymentType: 'card' }
        },
      });
    }

    // --- SPLIT OVERPAYMENT RECONCILIATION ---
    if (order.paymentStatus === PaymentStatus.paid && order.paymentMethod !== PaymentMethods.cash) {
      const cardRequired = parseFloat((finalOrder.totalAmount - ebtAmountUsed).toFixed(2));

      const ebtOverpayment = parseFloat((ebtPaid - ebtAmountUsed).toFixed(2));
      const cardOverpayment = parseFloat((cardPaid - cardRequired).toFixed(2));

      if (ebtOverpayment > 0.01) {
        await processRefundService(tx, order, ebtOverpayment, `Overpayment Refund (EBT) for order #${order.orderCode}`, RefundType.PARTIAL_REFUND, 'ebt');
      }
      if (cardOverpayment > 0.01) {
        await processRefundService(tx, order, cardOverpayment, `Overpayment Refund (Card) for order #${order.orderCode}`, RefundType.PARTIAL_REFUND, 'card');
      }
    }

    // 6. Update Order and History
    await orderHistoryModel.createOrderHistory({
      orderId: order.id,
      status: OrderStatus.delivered,
      changedBy: deliveryPersonId,
      notes: 'Delivered with proof of delivery',
    }, tx);

    return orderModel.updateOrder(orderId, updates, tx);
  });

  // Notifications
  await notificationService.createNotification({
    userId: order.userId,
    type: NotificationType.DELIVERED,
    category: NotificationCategory.ORDER,
    title: 'Order Delivered',
    body: `Your order #${order.orderCode} has been delivered. View the proof of delivery in the app.`,
    meta: { orderId: order.id },
  });

  return completedOrder;
};

/**
 * Retrieves the active order for a user (vendor staff or delivery person).
 * Used to restore state if the user closes the app or logs in from another device.
 * @param userId The ID of the user.
 */
export const getActiveOrderForUserService = async (userId: string): Promise<OrderWithVendorExtras | null> => {
  return getOrderByIdService(userId, userId, undefined); // Re-using getOrderByIdService logic isn't quite right here because we need to FIND the ID first.
};

/**
 * Actually finds and returns the active order with extras.
 */
export const getActiveOrderService = async (userId: string, userRole: Role, staffVendorId?: string): Promise<OrderWithVendorExtras | null> => {
  const order = await orderModel.findActiveOrderForUser(userId);
  
  if (!order) return null;

  return getOrderByIdService(order.id, userId, userRole, staffVendorId);
};