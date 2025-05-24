

import { Request, Response } from 'express';
import {
  getOrderByIdService,
  getOrdersByUserIdService,
  updateOrderStatusService,
  updateOrderService,
  cancelOrderService,
} from '../services/order.service'; // Adjust the path if needed
import { Order, PaymentMethods, PaymentStatus, OrderStatus } from '@prisma/client';
import { AuthenticatedRequest } from './vendor.controller';
import { getCartByIdService } from '../services/cart.service';
import { createManyCartItems, getCartItemsByCartId, updateCartItemsWithOrderId } from '../models/cartItem.model';
import { createOrder, getOrderById } from '../models/order.model';
import { getVendorProductById } from '../models/product.model';

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
    const {
      vendorId,
      paymentMethod,
      shippingAddress,
      deliveryInstructions,
      orderItems
    } = req.body as {vendorId: string, paymentMethod: PaymentMethods, shippingAddress: string, deliveryInstructions: string, orderItems: OrderItem[] };

    // calculate total amount and pass it to create order fields
    let totalAmount = 0;
    await Promise.all(orderItems.map(async (item) => {
      const vendorProduct = await getVendorProductById(item.vendorProductId);
      if (vendorProduct) {
        totalAmount += vendorProduct.price;
      }
    }));

    // create the order without cartItems
    const order = await createOrder({userId: userId, vendorId, paymentMethod, deliveryAddress: shippingAddress, deliveryInstructions, totalAmount})

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
 * Controller for cancelling an order.
 * PATCH /orders/:id/cancel
 */
export const cancelOrderController = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const cancelledOrder = await cancelOrderService(orderId);
    res.status(200).json(cancelledOrder);
  } catch (error: any) {
    if (error.message === 'Order not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to cancel order: ' + error.message });
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
