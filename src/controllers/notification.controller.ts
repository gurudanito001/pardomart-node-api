// src/controllers/notification.controller.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as notificationService from '../services/notification.service';

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get notifications for the authenticated user
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page.
 *     responses:
 *       200:
 *         description: A paginated list of notifications.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedNotifications'
 */
export const getNotificationsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const page = (req.query.page as number | undefined) || 1;
    const size = (req.query.size as number | undefined) || 20;

    const notifications = await notificationService.getNotifications(userId, page, size);
    res.status(200).json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve notifications.' });
  }
};

/**
 * @swagger
 * /notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark a specific notification as read
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the notification to mark as read.
 *     responses:
 *       200:
 *         description: The updated notification.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Notification not found or user does not have permission.
 */
export const markAsReadController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { notificationId } = req.params;
    const notification = await notificationService.markAsRead(notificationId, userId);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found or you do not have permission to update it.' });
    }

    res.status(200).json(notification);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to mark notification as read.' });
  }
};

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all unread notifications as read
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The number of notifications that were updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 */
export const markAllAsReadController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const result = await notificationService.markAllAsRead(userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to mark all notifications as read.' });
  }
};

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Get the count of unread notifications
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The count of unread notifications.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 */
export const getUnreadCountController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const result = await notificationService.getUnreadCount(userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get unread notification count.' });
  }
};
