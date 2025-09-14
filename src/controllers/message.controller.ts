import { Response } from 'express';
import { AuthenticatedRequest } from './vendor.controller';
import { sendMessageService, getMessagesForOrderService, markMessagesAsReadService } from '../services/message.service';

/**
 * @swagger
 * tags:
 *   name: Messaging
 *   description: Messaging within an order
 */

/**
 * @swagger
 * /api/v1/order/{orderId}/messages:
 *   post:
 *     summary: Send a message related to an order
 *     tags: [Order, Messaging]
 *     description: Sends a message from the authenticated user to another participant (customer, shopper, or delivery person) of the order.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *               - content
 *             properties:
 *               recipientId:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the user who is the recipient of the message.
 *               content:
 *                 type: string
 *                 description: The text content of the message.
 *     responses:
 *       201:
 *         description: The created message.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Bad request (e.g., invalid input).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not a participant in the order or trying to message an invalid recipient).
 *       404:
 *         description: Order not found.
 *       500:
 *         description: Internal server error.
 */
export const sendMessageController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const senderId = req.userId as string;
    const { orderId } = req.params;
    const { recipientId, content } = req.body;

    // The service would handle validation to ensure sender and recipient are part of the order
    const message = await sendMessageService({
      orderId,
      senderId,
      recipientId,
      content,
    });

    res.status(201).json(message);
  } catch (error: any) {
    console.error('Error sending message:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('not allowed')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to send message.' });
  }
};

/**
 * @swagger
 * /api/v1/order/{orderId}/messages:
 *   get:
 *     summary: Get messages for an order
 *     tags: [Order, Messaging]
 *     description: Retrieves the conversation history for a specific order. The user must be a participant in the order (customer, shopper, or delivery person).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order.
 *     responses:
 *       200:
 *         description: A list of messages for the order.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not a participant in the order).
 *       404:
 *         description: Order not found.
 *       500:
 *         description: Internal server error.
 */
export const getMessagesForOrderController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const { orderId } = req.params;

    // The service would handle validation to ensure the user is part of the order
    const messages = await getMessagesForOrderService(orderId, userId);

    res.status(200).json(messages);
  } catch (error: any) {
    console.error('Error getting messages:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('not allowed')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to get messages.' });
  }
};

/**
 * @swagger
 * /api/v1/order/{orderId}/messages/read:
 *   patch:
 *     summary: Mark messages as read
 *     tags: [Order, Messaging]
 *     description: Marks all unread messages for the authenticated user within a specific order as read. This is typically called when the user opens the chat screen.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order.
 *     responses:
 *       200:
 *         description: The number of messages that were marked as read.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: The number of messages updated.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not a participant in the order).
 *       404:
 *         description: Order not found.
 *       500:
 *         description: Internal server error.
 */
export const markMessagesAsReadController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const { orderId } = req.params;

    const result = await markMessagesAsReadService(orderId, userId);

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error marking messages as read:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('not allowed')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to mark messages as read.' });
  }
};
