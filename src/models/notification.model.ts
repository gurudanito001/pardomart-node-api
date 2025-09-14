// src/models/notification.model.ts
import { prisma } from '../config/prisma';
import { Notification, Prisma } from '@prisma/client';

export const createNotification = async (data: Prisma.NotificationUncheckedCreateInput): Promise<Notification> => {
  return prisma.notification.create({ data });
};

export const getNotificationsByUserId = async (
  userId: string,
  pagination: { page: number; take: number }
): Promise<{ data: Notification[]; totalCount: number }> => {
  const skip = (pagination.page - 1) * pagination.take;
  const take = pagination.take;

  const [notifications, totalCount] = await prisma.$transaction([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);

  return { data: notifications, totalCount };
};

export const markNotificationAsRead = async (notificationId: string, userId: string): Promise<Notification | null> => {
  // We add userId to the where clause to ensure a user can only mark their own notifications as read.
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    return null; // Let service layer handle not found
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};

export const markAllNotificationsAsRead = async (userId: string): Promise<{ count: number }> => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
};
