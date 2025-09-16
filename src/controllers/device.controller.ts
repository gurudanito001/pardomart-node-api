// src/controllers/device.controller.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as deviceService from '../services/device.service';

/**
 * @swagger
 * /devices:
 *   post:
 *     summary: Register a device for push notifications
 *     tags: [User, Notification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fcmToken, platform]
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 description: The Firebase Cloud Messaging token for the device.
 *               platform:
 *                 type: string
 *                 enum: [ios, android, web]
 *                 description: The platform of the device.
 *     responses:
 *       201:
 *         description: Device registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Device'
 * components:
 *   schemas:
 *     Device:
 *       type: object
 *       properties:
 *         id: { type: string, description: "CUID" }
 *         userId: { type: string, format: uuid }
 *         fcmToken: { type: string }
 *         platform: { type: string, enum: [ios, android, web] }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */
export const registerDeviceController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fcmToken, platform } = req.body;
    const userId = req.userId!;
    const device = await deviceService.registerDevice(userId, fcmToken, platform);
    res.status(201).json(device);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to register device.' });
  }
};

/**
 * @swagger
 * /devices/{fcmToken}:
 *   delete:
 *     summary: Unregister a device for push notifications
 *     tags: [User, Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fcmToken
 *         required: true
 *         schema:
 *           type: string
 *         description: The FCM token of the device to unregister.
 *     responses:
 *       204:
 *         description: Device unregistered successfully.
 */
export const unregisterDeviceController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fcmToken } = req.params;
    await deviceService.unregisterDevice(fcmToken);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to unregister device.' });
  }
};
