// src/controllers/deliveryPersonLocation.controller.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as deliveryPersonLocationService from '../services/deliveryPersonLocation.service';

/**
 * @swagger
 * /orders/{orderId}/delivery-location:
 *   post:
 *     summary: Add a location point for a delivery person
 *     tags: [Order, Delivery]
 *     security:
 *       - bearerAuth: []
 *     description: Logs the current geographic coordinates of the delivery person for a specific order. This should be called periodically by the delivery person's application. Only the assigned delivery person for the order can post a location.
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order being delivered.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *                 format: float
 *                 description: The latitude of the delivery person.
 *                 example: 34.052235
 *               longitude:
 *                 type: number
 *                 format: float
 *                 description: The longitude of the delivery person.
 *                 example: -118.243683
 *     responses:
 *       201:
 *         description: Location successfully logged.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryPersonLocation'
 *       403:
 *         description: Forbidden. User is not the assigned delivery person for this order.
 *       404:
 *         description: Order not found.
 * components:
 *   schemas:
 *     DeliveryPersonLocation:
 *       type: object
 *       properties:
 *         id: { type: string, description: "UUID" }
 *         latitude: { type: number, format: float }
 *         longitude: { type: number, format: float }
 *         createdAt: { type: string, format: date-time }
 *         orderId: { type: string, format: uuid }
 */
export const addLocationController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { latitude, longitude } = req.body;
    const deliveryPersonId = req.userId!;

    const location = await deliveryPersonLocationService.addDeliveryPersonLocation(orderId, deliveryPersonId, latitude, longitude);

    res.status(201).json(location);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /orders/{orderId}/delivery-path:
 *   get:
 *     summary: Get the delivery path for an order
 *     tags: [Order, Delivery]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves the historical path of the delivery person for a specific order. This can be used to display the route on a map. Accessible by the customer who placed the order, the assigned delivery person, or an admin.
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order to retrieve the path for.
 *     responses:
 *       200:
 *         description: An array of location points, sorted by time. An empty array is returned if no path data exists yet.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DeliveryPersonLocation'
 *       403:
 *         description: Forbidden. User is not authorized to view this path.
 *       404:
 *         description: Order not found.
 */
export const getPathController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { userId, userRole } = req;
    const path = await deliveryPersonLocationService.getDeliveryPath(orderId, userId!, userRole!);
    res.status(200).json(path);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Internal server error' });
  }
};
