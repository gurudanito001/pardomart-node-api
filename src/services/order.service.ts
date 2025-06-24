

import { Request, Response, Router } from 'express';
import * as orderModel from '../models/order.model'; // Adjust the path if needed
import { PrismaClient, Order, CartItem, Role, ShoppingMethod, OrderStatus } from '@prisma/client';
import * as cartModel from '../models/cart.model';
import dayjs from 'dayjs';

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

/**
 * Retrieves all orders for a specific user.
 * @param userId - The ID of the user whose orders are to be retrieved.
 * @returns An array of orders for the user.
 */
export const getOrdersByUserIdService = async (userId: string): Promise<Order[]> => {
  return orderModel.getOrdersByUserId(userId);
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
type OrderWithRequiredRelations = Order & {
  user: { id: string; name: string | null; mobileNumber: string | null };
  orderItems: Array<any>; // Replace 'any' with actual CartItem & VendorProduct types if complex
  deliveryAddress: any | null;
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
          lte: dayjs().add(30, 'minutes').utc().toDate(), // Show orders scheduled up to 30 mins in future/past
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
    }) /* as Promise<OrderWithRequiredRelations[]> */; // Cast for type safety due to complex include

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