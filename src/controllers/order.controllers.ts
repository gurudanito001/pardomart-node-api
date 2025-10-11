import { Request, Response } from 'express';
import {
  getOrderByIdService,
  createOrderFromClient,
  getOrdersByUserIdService,
  updateOrderStatusService,
  updateOrderService,
  getOrdersForVendorDashboard,
  getAvailableDeliverySlots,
  acceptOrderService,
  updateOrderTipService,
  UpdateTipPayload,
  declineOrderService,
  startShoppingService,
  OrderCreationError,
  updateOrderItemShoppingStatusService,
  respondToReplacementService,
  UpdateOrderItemShoppingStatusPayload,
  RespondToReplacementPayload,
  getOrdersForVendorUserService
} from '../services/order.service'; // Adjust the path if needed
import { Order, PaymentMethods, PaymentStatus, OrderStatus, DeliveryMethod, OrderItemStatus } from '@prisma/client';
import { AuthenticatedRequest } from './vendor.controller';

// --- Order Controllers ---

/**
 * Controller for creating a new order.
 * @swagger
 * /order:
 *   post:
 *     summary: Create an order from a client payload
 *     tags: [Order]
 *     description: Creates a new order based on a payload sent from the client, which includes all order items and delivery details. This endpoint is used when the cart state is managed on the client-side.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderClientPayload'
 *     responses:
 *       201:
 *         description: The created order.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorOrder'
 *       400:
 *         description: Bad request due to invalid input (e.g., missing fields, invalid time, item out of stock).
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 * components:
 *   schemas:
 *     PaymentMethods:
 *       type: string
 *       enum: [credit_card, wallet, cash]
 *     PaymentStatus:
 *       type: string
 *       enum: [pending, paid, failed, refunded]
 *     OrderStatus:
 *       type: string
 *       enum: [pending, accepted_for_shopping, currently_shopping, ready_for_pickup, ready_for_delivery, accepted_for_delivery, en_route, delivered, picked_up_by_customer, declined_by_vendor, cancelled_by_customer]
 *     ShoppingMethod:
 *       type: string
 *       enum: [vendor, delivery_person]
 *     DeliveryMethod:
 *       type: string
 *       enum: [delivery_person, customer_pickup]
 *     OrderItemStatus:
 *       type: string
 *       enum: [PENDING, FOUND, NOT_FOUND, REPLACED]
 *     UpdateOrderItemShoppingStatusPayload:
 *       type: object
 *       required: [status]
 *       properties:
 *         status:
 *           $ref: '#/components/schemas/OrderItemStatus'
 *         quantityFound:
 *           type: integer
 *           description: Required if status is FOUND.
 *         chosenReplacementId:
 *           type: string
 *           format: uuid
 *           description: The vendorProductId of the suggested replacement if status is NOT_FOUND.
 *     RespondToReplacementPayload:
 *       type: object
 *       required: [approved]
 *       properties:
 *         approved:
 *           type: boolean
 *     OrderItem:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         orderId: { type: string, format: uuid }
 *         vendorProductId: { type: string, format: uuid }
 *         quantity: { type: integer }
 *         instructions: { type: string, nullable: true }
 *         status: { $ref: '#/components/schemas/OrderItemStatus' }
 *         quantityFound: { type: integer, nullable: true }
 *         chosenReplacementId: { type: string, format: uuid, nullable: true }
 *         isReplacementApproved: { type: boolean, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     OrderItemWithRelations:
 *       allOf:
 *         - $ref: '#/components/schemas/OrderItem'
 *         - type: object
 *           properties:
 *             vendorProduct:
 *               $ref: '#/components/schemas/VendorProduct'
 *             chosenReplacement:
 *               $ref: '#/components/schemas/VendorProduct'
 *             replacements:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VendorProduct'
 *     UserSummary:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         name: { type: string, nullable: true }
 *         mobileNumber: { type: string, nullable: true }
 *     VendorOrder:
 *       allOf:
 *         - $ref: '#/components/schemas/Order'
 *         - type: object
 *           properties:
 *             orderCode:
 *               type: string
 *               description: A unique, human-readable code for the order.
 *               example: "AB12CD"
 *             user: { $ref: '#/components/schemas/UserSummary' }
 *             shopper: { $ref: '#/components/schemas/UserSummary' }
 *             deliveryPerson: { $ref: '#/components/schemas/UserSummary' }
 *             orderItems:
 *               type: array
 *               items: { $ref: '#/components/schemas/OrderItemWithRelations' }
 *             vendor: { $ref: '#/components/schemas/VendorWithDetails' }
 *             deliveryAddress: { $ref: '#/components/schemas/DeliveryAddress', nullable: true }
 *     VendorWithDetails:
 *       allOf:
 *         - $ref: '#/components/schemas/Vendor'
 *         - type: object
 *           properties:
 *             user: { $ref: '#/components/schemas/User' }
 *     Vendor:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         userId: { type: string, format: uuid }
 *         name: { type: string }
 *         email: { type: string, nullable: true }
 *         tagline: { type: string, nullable: true }
 *         details: { type: string, nullable: true }
 *         image: { type: string, format: uri, nullable: true }
 *         address: { type: string, nullable: true }
 *         longitude: { type: number, format: float, nullable: true }
 *         latitude: { type: number, format: float, nullable: true }
 *         timezone: { type: string, nullable: true }
 *         isVerified: { type: boolean }
 *         meta: { type: object, nullable: true }
 *     VendorWithRatingAndDistance:
 *       type: object
 *       properties:
 *         subtotal: { type: number, format: float }
 *         totalAmount: { type: number, format: float }
 *         deliveryFee: { type: number, format: float }
 *         serviceFee: { type: number, format: float }
 *         shoppingFee: { type: number, format: float }
 *         shopperTip: { type: number, format: float }
 *         deliveryPersonTip: { type: number, format: float }
 *         paymentMethod: { $ref: '#/components/schemas/PaymentMethods' }
 *         paymentStatus: { $ref: '#/components/schemas/PaymentStatus' }
 *         orderStatus: { $ref: '#/components/schemas/OrderStatus' }
 *         deliveryAddressId: { type: string, format: uuid }
 *         deliveryInstructions: { type: string }
 *         shopperId: { type: string, format: uuid }
 *         deliveryPersonId: { type: string, format: uuid }
 *         shoppingMethod: { $ref: '#/components/schemas/ShoppingMethod' }
 *         deliveryMethod: { $ref: '#/components/schemas/DeliveryMethod' }
 *         shoppingStartTime: { type: string, format: date-time }
 *         scheduledDeliveryTime: { type: string, format: date-time }
 *         actualDeliveryTime: { type: string, format: date-time }
 *     CreateOrderClientPayload:
 *       type: object
 *       required: [vendorId, paymentMethod, orderItems, shoppingMethod, deliveryMethod]
 *       properties:
 *         vendorId: { type: string, format: uuid }
 *         paymentMethod: { $ref: '#/components/schemas/PaymentMethods' }
 *         shippingAddressId: { type: string, format: uuid, nullable: true, description: "ID of an existing delivery address. Required if `deliveryMethod` is `delivery_person`." }
 *         shopperTip: { type: number, format: float, description: "Optional. Tip for the shopper." }
 *         deliveryPersonTip: { type: number, format: float, description: "Optional. Tip for the delivery person." }
 *         deliveryInstructions: { type: string, nullable: true, example: "Leave at the front door." }
 *         orderItems:
 *           type: array
 *           items:
 *             type: object
 *             required: [vendorProductId, quantity]
 *             properties:
 *               vendorProductId: { type: string, format: uuid }
 *               quantity: { type: integer, minimum: 1 }
 *               instructions: { type: string, nullable: true }
 *               replacementIds:
 *                 type: array
 *                 items: { type: string, format: uuid }
 *         shoppingMethod: { $ref: '#/components/schemas/ShoppingMethod' }
 *         deliveryMethod: { $ref: '#/components/schemas/DeliveryMethod' }
 *         scheduledDeliveryTime: { type: string, format: date-time, nullable: true }
 *     UpdateTipPayload:
 *       type: object
 *       properties:
 *         shopperTip: { type: number, format: float }
 *         deliveryPersonTip: { type: number, format: float }
 *     DeliverySlot:
 *       type: object
 *       properties:
 *         date: { type: string, example: "27-09-2025" }
 *         timeSlots:
 *           type: array
 *           items: { type: string, example: "9:00am - 10:00am" }
 *     DeclineOrderPayload:
 *       type: object
 *       properties:
 *         reason:
 *           type: string
 *           nullable: true
 */
export const createOrderController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string; // Get userId from authenticated request
    const finalOrder = await createOrderFromClient(userId, req.body);
    res.status(201).json(finalOrder);
  } catch (error: any) {
    if (error instanceof OrderCreationError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message || 'Internal server error during order creation.' });
  }
};

/**
 * Controller for getting an order by ID.
 * @swagger
 * /order/{id}:
 *   get:
 *     summary: Get an order by its ID
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order to retrieve.
 *     responses:
 *       200:
 *         description: The requested order, with vendor distance and rating included.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorOrder'
 *       404:
 *         description: Order not found.
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
 * @swagger
 * /order/user/me:
 *   get:
 *     summary: Get all orders for the authenticated user
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of the user's orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VendorOrder'
 */
export const getOrdersByUserController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const orders = await getOrdersByUserIdService(userId as string);
    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve orders: ' + error.message });
  }
};

/**
 * Controller for updating the status of an order.
 * @swagger
 * /order/{id}/status:
 *   patch:
 *     summary: Update the status of an order
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderStatusPayload'
 *     responses:
 *       200:
 *         description: The updated order.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Order' }
 *       404:
 *         description: Order not found.
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
 * @swagger
 * /order/{id}:
 *   patch:
 *     summary: Update an order
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderPayload'
 *     responses:
 *       200:
 *         description: The updated order.
 *         content:
 *           application/json: { schema: { $ref: '#/components/schemas/Order' } }
 *       404:
 *         description: Order not found.
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
 * @swagger
 * /order/vendorOrders:
 *   get:
 *     summary: Get orders for a vendor's dashboard
 *     tags: [Order, Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/OrderStatus'
 *         description: Optional. Filter orders by a specific status.
 *     responses:
 *       200:
 *         description: A list of orders for the vendor.
 *         content:
 *           application/json:
 *             schema: 
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VendorOrder'
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
 * @swagger
 * /order/{orderId}/items/{itemId}/update-shopping-status:
 *   patch:
 *     summary: Update the shopping status of an order item
 *     tags: [Order, Vendor]
 *     description: Allows the assigned shopper or delivery person to update an item's status during shopping (e.g., found, not found, suggest replacement).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateOrderItemShoppingStatusPayload' }
 *     responses:
 *       200:
 *         description: The updated order item.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/OrderItemWithRelations' } } }
 *       400:
 *         description: Bad request (e.g., invalid payload).
 *       403:
 *         description: Forbidden (user is not the assigned shopper).
 *       404:
 *         description: Order or item not found.
 */
export const updateOrderItemShoppingStatusController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const shopperId = req.userId as string;
    const { orderId, itemId } = req.params;
    const payload: UpdateOrderItemShoppingStatusPayload = req.body;

    const updatedItem = await updateOrderItemShoppingStatusService(orderId, itemId, shopperId, payload);
    res.status(200).json(updatedItem);
  } catch (error: any) {
    if (error instanceof OrderCreationError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Error in updateOrderItemShoppingStatusController:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /order/{orderId}/items/{itemId}/respond-to-replacement:
 *   patch:
 *     summary: Respond to a suggested item replacement
 *     tags: [Order]
 *     description: Allows a customer to approve or reject a replacement suggested by the shopper.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RespondToReplacementPayload' }
 *     responses:
 *       200:
 *         description: The updated order item.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/OrderItemWithRelations' } } }
 *       400:
 *         description: Bad request (e.g., no replacement was suggested).
 *       403:
 *         description: Forbidden (user does not own this order).
 *       404:
 *         description: Order or item not found.
 */
export const respondToReplacementController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = req.userId as string;
    const { orderId, itemId } = req.params;
    const payload: RespondToReplacementPayload = req.body;

    const updatedItem = await respondToReplacementService(orderId, itemId, customerId, payload);
    res.status(200).json(updatedItem);
  } catch (error: any) {
    if (error instanceof OrderCreationError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Error in respondToReplacementController:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};



/**
 * Controller to accept a pending order.
 * @swagger
 * /order/{orderId}/accept:
 *   patch:
 *     summary: Accept a pending order
 *     tags: [Order, Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order to accept.
 *     responses:
 *       200:
 *         description: The accepted order.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request or order cannot be accepted.
 */
export const acceptOrderController = async (req: OrderAuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const shoppingHandlerUserId = req.userId as string; // ID of the accepting staff
    const vendorId = req.vendorId as string; // Vendor ID of the staff

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
 * Controller to get available delivery time slots for a vendor.
 * @swagger
 * /order/delivery-slots:
 *   get:
 *     summary: Get available delivery time slots
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the vendor.
 *       - in: query
 *         name: deliveryMethod
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/DeliveryMethod'
 *         description: The delivery method for the order.
 *     responses:
 *       200:
 *         description: A list of available delivery dates and time slots.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: 
 *                 $ref: '#/components/schemas/DeliverySlot'
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 *       500:
 *         description: Internal server error.
 */
export const getAvailableDeliverySlotsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { vendorId, deliveryMethod } = req.query as {vendorId: string, deliveryMethod: DeliveryMethod};
    
    const slots = await getAvailableDeliverySlots(vendorId, deliveryMethod);
    res.status(200).json(slots);
  } catch (error: any) {
    console.error('Error getting delivery slots:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};


/**
 * Controller to decline a pending order.
 * @swagger
 * /order/{orderId}/decline:
 *   patch:
 *     summary: Decline a pending order
 *     tags: [Order, Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order to decline.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/DeclineOrderPayload' }
 *     responses:
 *       200:
 *         description: The declined order.
 *         content: { application/json: { schema: { $ref: '#/components/schemas/Order' } } }
 *       400:
 *         description: Bad request or order cannot be declined.
 */
export const declineOrderController = async (req: OrderAuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body; // Optional reason for decline
    const vendorId = req.vendorId as string; // Vendor ID of the staff

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
 * @swagger
 * /order/{orderId}/start-shopping:
 *   patch:
 *     summary: Mark an order as 'currently shopping'
 *     tags: [Order, Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order to start shopping for.
 *     responses:
 *       200:
 *         description: The updated order.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request or shopping cannot be started for this order.
 */
export const startShoppingController = async (req: OrderAuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const shoppingHandlerUserId = req.userId as string; // ID of the staff starting shopping
    const vendorId = req.vendorId as string; // Vendor ID of the staff

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



/**
 * @swagger
 * /order/{orderId}/tip:
 *   patch:
 *     summary: Add or update a tip for an order
 *     tags: [Order]
 *     description: Allows a customer to add or update tips for the shopper and/or delivery person after an order has been placed. This will recalculate the order's total amount.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order to add a tip to.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateTipPayload' }
 *     responses:
 *       200:
 *         description: The updated order with the new tip amount.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request (e.g., invalid tip amount).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user does not own this order).
 *       404:
 *         description: Order not found.
 */
export const updateOrderTipController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const { orderId } = req.params;
    const payload: UpdateTipPayload = req.body;
    const updatedOrder = await updateOrderTipService(orderId, userId, payload);
    res.status(200).json(updatedOrder);
  } catch (error: any) {
    if (error instanceof OrderCreationError) { return res.status(error.statusCode).json({ error: error.message }); }
    console.error('Error in updateOrderTipController:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};


/**
 * @swagger
 * /order/vendor:
 *   get:
 *     summary: Get all orders for a vendor user's stores
 *     tags: [Order, Vendor]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Retrieves a list of all orders for the stores owned by the authenticated vendor user.
 *       Can be filtered by a specific `vendorId` (store ID) and/or `orderStatus`.
 *       If no `vendorId` is provided, it fetches orders from all stores owned by the user.
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         schema: { type: string, format: uuid }
 *         description: Optional. Filter orders by a specific store ID owned by the user.
 *       - in: query
 *         name: status
 *         schema: { $ref: '#/components/schemas/OrderStatus' }
 *         description: Optional. Filter orders by a specific status.
 *     responses:
 *       200:
 *         description: A list of orders matching the criteria.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       403:
 *         description: Forbidden if the user tries to access a vendor they do not own.
 *       500:
 *         description: Internal server error.
 */
export const getOrdersForVendor = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId as string;
  try {
    const { vendorId, status } = req.query as { vendorId?: string; status?: OrderStatus };

    const orders = await getOrdersForVendorUserService(userId, { vendorId, status });
    res.status(200).json(orders);
  } catch (error: any) {
    if (error instanceof OrderCreationError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};