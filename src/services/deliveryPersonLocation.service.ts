// src/services/deliveryPersonLocation.service.ts
import * as deliveryPersonLocationModel from '../models/deliveryPersonLocation.model';
import * as orderModel from '../models/order.model';
import { OrderCreationError } from './order.service';
import { Role, OrderStatus } from '@prisma/client';

export const addDeliveryPersonLocation = async (
  orderId: string,
  deliveryPersonId: string,
  latitude: number,
  longitude: number
) => {
  const order = await orderModel.getOrderById(orderId);
  if (!order) {
    throw new OrderCreationError('Order not found.', 404);
  }

  // Enhancement: Ensure the order is in a state where location can be tracked.
  const deliverableStatuses: OrderStatus[] = [
    OrderStatus.accepted_for_delivery,
    OrderStatus.ready_for_delivery,
    OrderStatus.en_route_to_pickup,
    OrderStatus.arrived_at_store,
    OrderStatus.en_route_to_delivery,
    OrderStatus.arrived_at_customer_location,
    OrderStatus.en_route_to_return_pickup,
    OrderStatus.en_route_to_return_to_store
  ];
  if (!deliverableStatuses.includes(order.orderStatus)) {
    throw new OrderCreationError(
      `Cannot log location for an order with status '${order.orderStatus}'. Order must be in an active delivery state.`,
      409 // 409 Conflict is a good status code for a state mismatch
    );
  }


  if (order.deliveryPersonId !== deliveryPersonId) {
    throw new OrderCreationError('You are not authorized to update the location for this order.', 403);
  }

  return deliveryPersonLocationModel.createLocation(orderId, latitude, longitude);
};

export const getDeliveryPath = async (orderId: string, userId: string, userRole: Role) => {
  const order = await orderModel.getOrderById(orderId);
  if (!order) {
    throw new OrderCreationError('Order not found.', 404);
  }

  // Authorize: only the customer who placed the order, the assigned delivery person, or an admin can view the path.
  const isCustomer = order.userId === userId;
  const isAdmin = userRole === Role.admin;
  const isDeliveryPerson = order.deliveryPersonId === userId;

  if (!isCustomer && !isAdmin && !isDeliveryPerson) {
    throw new OrderCreationError('You are not authorized to view this delivery path.', 403);
  }

  const path = await deliveryPersonLocationModel.getPathByOrderId(orderId);
  if (path.length === 0) {
    // Return an empty array if no path exists yet, which is a valid state.
    return [];
  }
  return path;
};
