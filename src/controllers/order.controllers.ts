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
  getOrdersForVendorUserService,
  verifyPickupOtpService,
  getOrderOverviewDataService,
  adminGetAllOrdersService,
  adminUpdateOrderService,
  getOrdersForDeliveryPersonService,
  getAvailableOrdersForDeliveryService,
  acceptOrderForDeliveryService,
  getActiveOrderService
} from '../services/order.service'; // Adjust the path if needed
import { Role, OrderStatus, DeliveryMethod, } from '@prisma/client';
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
 *               $ref: '#/components/schemas/OrderWithRelations'
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
 *           description: The vendorProductId of the suggested replacement if status is NOT_FOUND or REPLACED.
 *         replacementBarcode:
 *           type: string
 *           description: Optional. The barcode of a replacement item if chosenReplacementId is not provided.
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
 *             vendorProduct: { $ref: '#/components/schemas/VendorProductWithProduct' }
 *             chosenReplacement:
 *               $ref: '#/components/schemas/VendorProductWithProduct'
 *             replacements:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VendorProductWithProduct'
 *     UserSummary:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         name: { type: string, nullable: true }
 *         mobileNumber: { type: string, nullable: true }
 *     Order:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         userId: { type: string, format: uuid }
 *         vendorId: { type: string, format: uuid }
 *         orderCode: { type: string }
 *         pickupOtp: { type: string, nullable: true }
 *         subtotal: { type: number, format: float }
 *         totalAmount: { type: number, format: float }
 *         deliveryFee: { type: number, format: float, nullable: true }
 *         serviceFee: { type: number, format: float, nullable: true }
 *         shoppingFee: { type: number, format: float, nullable: true }
 *         shopperTip: { type: number, format: float, nullable: true }
 *         deliveryPersonTip: { type: number, format: float, nullable: true }
 *         paymentMethod: { $ref: '#/components/schemas/PaymentMethods' }
 *         paymentStatus: { $ref: '#/components/schemas/PaymentStatus' }
 *         orderStatus: { $ref: '#/components/schemas/OrderStatus' }
 *         deliveryAddressId: { type: string, format: uuid, nullable: true }
 *         deliveryInstructions: { type: string, nullable: true }
 *         shopperId: { type: string, format: uuid, nullable: true }
 *         deliveryPersonId: { type: string, format: uuid, nullable: true }
 *         shoppingMethod: { $ref: '#/components/schemas/ShoppingMethod' }
 *         deliveryMethod: { $ref: '#/components/schemas/DeliveryMethod' }
 *         shoppingStartTime: { type: string, format: date-time, nullable: true }
 *         scheduledDeliveryTime: { type: string, format: date-time, nullable: true }
 *         actualDeliveryTime: { type: string, format: date-time, nullable: true }
 *         pickupOtpVerifiedAt: { type: string, format: date-time, nullable: true }
 *         reasonForDecline: { type: string, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     OrderWithRelations:
 *       allOf:
 *         - $ref: '#/components/schemas/Order'
 *         - type: object
 *           properties:
 *             user: { $ref: '#/components/schemas/UserSummary', nullable: true }
 *             shopper: { $ref: '#/components/schemas/UserSummary', nullable: true }
 *             deliveryPerson: { $ref: '#/components/schemas/UserSummary', nullable: true }
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
 *             rating:
 *               type: object
 *               properties:
 *                 average: { type: number, format: float }
 *                 count: { type: integer }
 *             distance: { type: number, format: float, nullable: true }
 *     VendorProductWithProduct:
 *       allOf:
 *         - $ref: '#/components/schemas/VendorProduct'
 *         - type: object
 *           properties:
 *             product:
 *               $ref: '#/components/schemas/Product'
 *             categories:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
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
 *               $ref: '#/components/schemas/OrderWithRelations'
 *       404:
 *         description: Order not found.
 */
export const getOrderByIdController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const { userId, userRole, vendorId: staffVendorId } = req;

    const order = await getOrderByIdService(orderId, userId as string, userRole, staffVendorId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve order: ' + error.message });
  }
};

/**
 * Controller for getting the active order for the authenticated user.
 * @swagger
 * /order/active/me:
 *   get:
 *     summary: Get the currently active order for the user
 *     tags: [Order]
 *     description: Retrieves the order that the user (Vendor Staff or Delivery Person) is currently working on. Returns 200 with the order if found, or 200 with null/empty if no active order exists.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The active order or null.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderWithRelations'
 */
export const getActiveOrderController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, userRole } = req;
    const order = await getActiveOrderService(userId as string, userRole as Role);
    // It's okay to return null if no order is active, frontend should handle it.
    res.status(200).json(order); 
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve active order: ' + error.message });
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
 *                 $ref: '#/components/schemas/OrderWithRelations'
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
export const updateOrderStatusController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const { userId, userRole } = req;

    const updatedOrder = await updateOrderStatusService(orderId, status, userId as string, userRole as any);
    res.status(200).json(updatedOrder);
  } catch (error: any) {
    if (error instanceof OrderCreationError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    if (error.message.includes('not found')) {
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
 *                 $ref: '#/components/schemas/OrderWithRelations'
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

    console.log(`Updating item ${itemId} shopping status. Payload:`, JSON.stringify(payload, null, 2));

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
 *     summary: Get orders based on user role (Vendor, Store Admin, or Store Shopper)
 *     tags: [Order, Vendor]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Retrieves a list of orders with role-based access:
 *       - **Vendor**: Can see all orders from all their stores. Can filter by `vendorId` and/or `status`.
 *       - **Store Admin**: Can only see orders from their assigned store.
 *       - **Store Shopper**: Can only see orders assigned to them (`shopperId` matches their user ID) within their store.
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         schema: { type: string, format: uuid }
 *         description: Optional. For Vendors, filters orders by a specific store ID. Ignored for staff roles.
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
  try {
    const { userId, userRole, vendorId: staffVendorId } = req;
    const { vendorId, status } = req.query as { vendorId?: string; status?: OrderStatus };

    const orders = await getOrdersForVendorUserService(userId as string, userRole as any, { vendorId, status, staffVendorId });
    res.status(200).json(orders);
  } catch (error: any) {
    if (error instanceof OrderCreationError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};




/**
 * @swagger
 * /order/{id}/verify-pickup:
 *   post:
 *     summary: Verify order pickup with an OTP
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Allows a vendor or their staff to verify an order for pickup by providing a 6-digit OTP.
 *       Upon successful verification, the order status is automatically transitioned.
 *       - If `deliveryMethod` is `customer_pickup`, status changes from `ready_for_pickup` to `picked_up_by_customer`.
 *       - If `deliveryMethod` is `delivery_person`, status changes from `ready_for_delivery` to `en_route`.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The ID of the order to verify.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp]
 *             properties:
 *               otp: { type: string, description: "The 6-digit pickup OTP." }
 *     responses:
 *       200: { description: "The updated order after successful verification." }
 *       400: { description: "Invalid OTP or order not in a verifiable state." }
 *       403: { description: "User not authorized to perform this action." }
 *       404: { description: "Order not found." }
 */
export const verifyPickupOtp = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { otp } = req.body;
  const { userId, userRole, vendorId: staffVendorId } = req;

  try {
    const updatedOrder = await verifyPickupOtpService(id, otp, userId!, userRole as Role, staffVendorId);
    res.status(200).json(updatedOrder);
  } catch (error: any) {
    console.error(`Error verifying OTP for order ${id}:`, error);
    if (error instanceof OrderCreationError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /order/admin/overview:
 *   get:
 *     summary: Get platform-wide order overview data (Admin)
 *     tags: [Order, Admin]
 *     description: Retrieves aggregate data about all orders on the platform, such as total orders, total products, in-stock products, and total cancelled orders. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: An object containing the order overview data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOrders: { type: integer }
 *                 totalProducts: { type: integer }
 *                 inStockProducts: { type: integer }
 *                 totalCancelledOrders: { type: integer }
 *       500:
 *         description: Internal server error.
 */
export const getOrderOverviewDataController = async (req: Request, res: Response) => {
  try {
    const overviewData = await getOrderOverviewDataService();
    res.status(200).json(overviewData);
  } catch (error: any) {
    console.error('Error getting order overview data:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

/**
 * @swagger
 * /order/delivery/me:
 *   get:
 *     summary: Get orders assigned to the authenticated delivery person
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of orders assigned to the delivery person.
 *         content:
 *           application/json:
 *             schema: { type: array, items: { $ref: '#/components/schemas/OrderWithRelations' } }
 */
export const getMyDeliveryOrdersController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const orders = await getOrdersForDeliveryPersonService(userId);
    res.status(200).json(orders);
  } catch (error: any) {
    console.error('Error getting delivery orders:', error);
    res.status(500).json({ error: 'Failed to retrieve delivery orders.' });
  }
};

/**
 * @swagger
 * /order/delivery/available:
 *   get:
 *     summary: Get available orders for delivery persons
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Retrieves a list of unassigned orders that require a delivery person.
 *       - If shopping is by vendor, order must be `ready_for_delivery`.
 *       - If shopping is by delivery person, order is available immediately or 30 mins before scheduled time.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number for pagination.
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 20 }
 *         description: Number of items per page.
 *     responses:
 *       200:
 *         description: A paginated list of available orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string, format: uuid }
 *                       shoppingMethod: { $ref: '#/components/schemas/ShoppingMethod' }
 *                       deliveryMethod: { $ref: '#/components/schemas/DeliveryMethod' }
 *                       totalAmount: { type: number }
 *                       customerName: { type: string }
 *                       scheduledDeliveryTime: { type: string, format: date-time }
 *                       numberOfOrderItems: { type: integer }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total: { type: integer }
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     totalPages: { type: integer }
 */
export const getAvailableOrdersForDeliveryController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 20;

    const result = await getAvailableOrdersForDeliveryService({ page, take: size });
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error getting available delivery orders:', error);
    res.status(500).json({ error: 'Failed to retrieve available orders.' });
  }
};

/**
 * @swagger
 * /order/{orderId}/accept-delivery:
 *   patch:
 *     summary: Accept an order for delivery (Delivery Person)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     description: Allows a delivery person to accept an available order.
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Order accepted successfully.
 *       409:
 *         description: Conflict (order already assigned).
 */
export const acceptOrderForDeliveryController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const deliveryPersonId = req.userId as string;
    const order = await acceptOrderForDeliveryService(orderId, deliveryPersonId);
    res.status(200).json(order);
  } catch (error: any) {
    if (error instanceof OrderCreationError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Error accepting order for delivery:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * @swagger
 * /order/admin/{orderId}:
 *   patch:
 *     summary: Update an order's details (Admin)
 *     tags: [Order, Admin]
 *     description: >
 *       Allows an admin to update specific fields of an order to resolve issues or "un-stuck" it.
 *       Fields that can be updated include `orderStatus`, `paymentStatus`, `shopperId`, `deliveryPersonId`, etc.
 *       **Warning**: Changing `orderStatus` to `delivered` will trigger payout logic.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string, format: uuid }
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
 *       404:
 *         description: Order not found.
 *       500:
 *         description: Internal server error.
 */
export const adminUpdateOrderController = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const updates = req.body;

    const updatedOrder = await adminUpdateOrderService(orderId, updates);
    res.status(200).json(updatedOrder);
  } catch (error: any) {
    if (error instanceof OrderCreationError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'An unexpected error occurred while updating the order.' });
  }
};

/**
 * @swagger
 * /order/admin/all:
 *   get:
 *     summary: Get a paginated list of all orders (Admin)
 *     tags: [Order, Admin]
 *     description: Retrieves a paginated list of all orders on the platform. Allows filtering by orderCode, status (pending, in-progress, completed, cancelled), creation date, and customer name. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: orderCode, schema: { type: string }, description: "Filter by order code." }
 *       - { in: query, name: status, schema: { type: string }, description: "Filter by order status (pending, in-progress, completed, cancelled) or specific OrderStatus." }
 *       - { in: query, name: customerName, schema: { type: string }, description: "Filter by customer's name (case-insensitive)." }
 *       - { in: query, name: createdAtStart, schema: { type: string, format: date-time }, description: "Filter orders created on or after this date." }
 *       - { in: query, name: createdAtEnd, schema: { type: string, format: date-time }, description: "Filter orders created on or before this date." }
 *       - { in: query, name: page, schema: { type: integer, default: 1 }, description: "Page number for pagination." }
 *       - { in: query, name: size, schema: { type: integer, default: 20 }, description: "Number of items per page." }
 *     responses:
 *       200:
 *         description: A paginated list of orders.
 *       500:
 *         description: Internal server error.
 */
export const adminGetAllOrdersController = async (req: Request, res: Response) => {
  try {
    const {
      orderCode,
      status,
      customerName,
      createdAtStart,
      createdAtEnd,
    } = req.query;

    const page = parseInt(req.query.page as string) || 1;
    const take = parseInt(req.query.size as string) || 20;

    let statusFilter: OrderStatus | OrderStatus[] | undefined;

    if (status) {
      const statusStr = status as string;
      switch (statusStr.toLowerCase()) {
        case 'pending':
          statusFilter = [OrderStatus.pending];
          break;
        case 'in-progress':
          statusFilter = [
            OrderStatus.accepted_for_shopping,
            OrderStatus.currently_shopping,
            OrderStatus.ready_for_pickup,
            OrderStatus.ready_for_delivery,
            OrderStatus.accepted_for_delivery,
            OrderStatus.en_route
          ];
          break;
        case 'completed':
          statusFilter = [OrderStatus.delivered, OrderStatus.picked_up_by_customer];
          break;
        case 'cancelled':
          statusFilter = [OrderStatus.cancelled_by_customer, OrderStatus.declined_by_vendor];
          break;
        default:
          if (Object.values(OrderStatus).includes(statusStr as OrderStatus)) {
            statusFilter = statusStr as OrderStatus;
          }
          break;
      }
    }

    const filters = {
      orderCode: orderCode as string | undefined,
      status: statusFilter,
      customerName: customerName as string | undefined,
      createdAtStart: createdAtStart as string | undefined,
      createdAtEnd: createdAtEnd as string | undefined,
    };

    const pagination = { page, take };

    const result = await adminGetAllOrdersService(filters, pagination);

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in adminGetAllOrdersController:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};