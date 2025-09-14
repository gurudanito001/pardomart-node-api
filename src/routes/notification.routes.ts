// src/routes/notification.routes.ts
import express from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate, validateGetNotifications, validateNotificationId } from '../middlewares/validation.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', validate(validateGetNotifications), notificationController.getNotificationsController);
router.get('/unread-count', notificationController.getUnreadCountController);
router.patch('/:notificationId/read', validate(validateNotificationId), notificationController.markAsReadController);
router.patch('/read-all', notificationController.markAllAsReadController);

export default router;
