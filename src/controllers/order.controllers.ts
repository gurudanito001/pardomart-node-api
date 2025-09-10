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
  declineOrderService,
  startShoppingService,
  OrderCreationError,
} from '../services/order.service'; // Adjust the path if needed
import { Order, PaymentMethods, PaymentStatus, OrderStatus, DeliveryMethod } from '@prisma/client';
import { AuthenticatedRequest } from './vendor.controller';

// --- Order Controllers ---

/**
 * Controller for creating a new order.
 * @swagger
 * /order/:
 *   post:
 *     summary: Create an order from the client
 *     tags: [Order]
 *     description: Creates a new order based on a payload sent from the client, which includes all order items and delivery details. This endpoint is used when the cart state is managed on the client-side.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vendorId
 *               - paymentMethod
 *               - orderItems
 *               - shoppingMethod
 *               - deliveryMethod
 *             properties:
 *               vendorId:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the vendor for this order.
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, wallet, cash]
 *                 description: The payment method for the order.
 *               shippingAddressId: 
 *                 type: string
 *                 format: uuid
 *                     description: A label for the address (e.g., "Home", "Work").
 *                   addressLine1:
 *                     type: string
 *                     description: The primary address line.
 *                   addressLine2:
 *                     type: string
 *                     description: The secondary address line (optional).
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   postalCode:
 *                     type: string
 *                   country:
 *                     type: string
 *                     default: "Nigeria" Required for 'delivery_person' method if 'newShippingAddress' is not provided.
 *               deliveryInstructions:
 *                 type: string
 *                 description: Optional instructions for the delivery.
 *               orderItems:
 *                 type: array
 *                 description: A list of items to be included in the order.
 *                 items:
 *                   type: object
 *                   required:
 *                     - vendorProductId
 *                     - quantity
 *                   properties:
 *                     vendorProductId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *               shoppingMethod:
 *                 type: string
 *                 enum: [vendor, shopper]
 *                 description: Who will be shopping for the items.
 *               deliveryMethod:
 *                 type: string
 *                 enum: [delivery_person, customer_pickup]
 *                 description: How the order will be delivered.
 *               scheduledDeliveryTime:
 *                 type: string
 *                 format: date-time
 *                 description: Optional. The requested time for the delivery in UTC ISO 8601 format (e.g., 2023-10-27T14:30:00.000Z).
 *     responses:
 *       201:
 *         description: The created order.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request due to invalid input (e.g., missing fields, invalid time, item out of stock).
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
export const createOrderController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string; // Get userId from authenticated request
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
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
 *         description: The requested order.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
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
 * /order/user/getByUserId:
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
 *                 $ref: '#/components/schemas/Order'
 *       400:
 *         description: User ID is required.
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
 *             schema:
 *               $ref: '#/components/schemas/Order'
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
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
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
 *                 $ref: '#/components/schemas/Order'
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

    if (!orderId || !shoppingHandlerUserId || !vendorId) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

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
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     example: "27-09-2025"
 *                   timeSlots:
 *                     type: array
 *                     items:
 *                       type: string
 *                       example: "9:00am - 10:00am"
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 *       500:
 *         description: Internal server error.
 */
export const getAvailableDeliverySlotsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { vendorId, deliveryMethod } = req.query;

    if (!vendorId || typeof vendorId !== 'string') {
      return res.status(400).json({ error: 'Vendor ID is required.' });
    }

    if (!deliveryMethod || (deliveryMethod !== DeliveryMethod.customer_pickup && deliveryMethod !== DeliveryMethod.delivery_person)) {
      return res.status(400).json({ error: 'A valid delivery method is required.' });
    }

    const slots = await getAvailableDeliverySlots(vendorId, deliveryMethod as DeliveryMethod);
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
 *           schema:
 *             $ref: '#/components/schemas/DeclineOrderPayload'
 *     responses:
 *       200:
 *         description: The declined order.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request or order cannot be declined.
 */
export const declineOrderController = async (req: OrderAuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body; // Optional reason for decline
    const vendorId = req.vendorId as string; // Vendor ID of the staff

    if (!orderId || !vendorId) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

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

    if (!orderId || !shoppingHandlerUserId || !vendorId) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

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