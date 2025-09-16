// src/services/notification.service.ts
import { Notification, NotificationType, Role } from '@prisma/client';
import * as notificationModel from '../models/notification.model';
import * as deviceModel from '../models/device.model';
import * as userModel from '../models/user.model';
import { sendPushNotification } from '../utils/fcm.util';

interface CreateNotificationArgs {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  meta?: object;
}

/**
 * A generic function to create a notification record and send a push notification.
 */
export const createNotification = async (args: CreateNotificationArgs) => {
  const { userId, title, body, type, meta } = args;

  // 1. Store notification in the database for in-app history
  const notification = await notificationModel.createNotification({
    userId,
    title,
    body,
    type,
    meta: meta || {},
  });

  // 2. Get user's device tokens for push notifications
  const devices = await deviceModel.getDevicesByUserId(userId);
  if (devices.length === 0) {
    console.log(`No devices found for user ${userId} to send push notification.`);
    return notification;
  }
  const tokens = devices.map(d => d.fcmToken);

  // 3. Send push notification via a provider like FCM
  await sendPushNotification({
    tokens,
    title,
    body,
    data: {
      notificationId: notification.id,
      ...(meta as any), // Send meta data for deep linking on the client
    },
  });

  return notification;
};

/**
 * Notifies all relevant users of a vendor (owner and staff) about a new order.
 * This function would be called from the order service.
 * @param vendorId - The ID of the vendor who received the order.
 * @param orderId - The ID of the new order.
 */
export const notifyVendorOfNewOrder = async (vendorId: string, orderId: string) => {
  // Find all vendor admins and staff for this vendor
  const vendorUsers = await userModel.findMany({
    where: {
      OR: [{ vendor: { id: vendorId }, role: Role.vendor }, { vendorId: vendorId, role: Role.vendor_staff }],
    },
    select: { id: true },
  });

  if (vendorUsers.length === 0) return;

  const title = 'New Order Received!';
  const body = `A new order has been placed. Tap to view.`;

  const notificationPromises = vendorUsers.map(user =>
    createNotification({ userId: user.id, title, body, type: NotificationType.NEW_ORDER_PLACED, meta: { orderId } })
  );

  await Promise.all(notificationPromises);
};

export const getNotifications = async (userId: string, page: number, take: number) => {
  const { data, totalCount } = await notificationModel.getNotificationsByUserId(userId, { page, take });
  const totalPages = Math.ceil(totalCount / take);
  return {
    data,
    page,
    pageSize: take,
    totalCount,
    totalPages,
  };
};

export const markAsRead = async (notificationId: string, userId: string): Promise<Notification | null> => {
  return notificationModel.markNotificationAsRead(notificationId, userId);
};

export const markAllAsRead = async (userId: string): Promise<{ count: number }> => {
  return notificationModel.markAllNotificationsAsRead(userId);
};

export const getUnreadCount = async (userId: string): Promise<{ count: number }> => {
  const count = await notificationModel.getUnreadNotificationCount(userId);
  return { count };
};
