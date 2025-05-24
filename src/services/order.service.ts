

import { Request, Response, Router } from 'express';
import * as orderModel from '../models/order.model'; // Adjust the path if needed
import { Order, CartItem, PaymentMethods, PaymentStatus, OrderStatus } from '@prisma/client';
import * as cartModel from '../models/cart.model';

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
    vendorId: payload.vendorId,
    userId: payload.userId,
    deliveryAddress: payload.deliveryAddress,
    totalAmount: payload.totalAmount,
    paymentMethod: payload.paymentMethod,
    deliveryInstructions: payload.deliveryInstructions,
  });

  // Optionally, clear the cart after the order is created.
  //await cartModel.updateCart(cartId, { items: [] }); //  Consider if you want to clear the cart.

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

/**
  * Cancels an order.
  * @param id - The ID of the order to cancel
  * @returns The canceled order
  */
export const cancelOrderService = async (id: string): Promise<Order> => {
    return orderModel.updateOrder(id, { orderStatus: "cancelled" });
};
