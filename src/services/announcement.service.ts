import { PrismaClient, Announcement, Role, NotificationType, NotificationCategory } from '@prisma/client';
import * as notificationService from './notification.service';

const prisma = new PrismaClient();

export interface CreateAnnouncementPayload {
  title: string;
  description: string;
  imageUrl?: string;
  targetAudience: Role[];
  isActive?: boolean;
}

export interface UpdateAnnouncementPayload {
  title?: string;
  description?: string;
  imageUrl?: string;
  targetAudience?: Role[];
  isActive?: boolean;
}

export const createAnnouncementService = async (payload: CreateAnnouncementPayload): Promise<Announcement> => {
  return prisma.announcement.create({
    data: {
      title: payload.title,
      description: payload.description,
      imageUrl: payload.imageUrl,
      targetAudience: payload.targetAudience,
      isActive: payload.isActive ?? true,
    },
  });
};

export const updateAnnouncementService = async (id: string, payload: UpdateAnnouncementPayload): Promise<Announcement> => {
  return prisma.announcement.update({
    where: { id },
    data: payload,
  });
};

export const deleteAnnouncementService = async (id: string): Promise<Announcement> => {
  return prisma.announcement.delete({
    where: { id },
  });
};

export const getAnnouncementByIdService = async (id: string): Promise<Announcement | null> => {
  return prisma.announcement.findUnique({
    where: { id },
  });
};

/**
 * Fetches all announcements (typically for Admin view).
 */
export const getAllAnnouncementsService = async (): Promise<Announcement[]> => {
  return prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Fetches active announcements relevant to a specific user role.
 */
export const getAnnouncementsForRoleService = async (role: Role): Promise<Announcement[]> => {
  return prisma.announcement.findMany({
    where: {
      isActive: true,
      targetAudience: {
        has: role,
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Sends push notifications to the target audience of an announcement.
 */
export const broadcastAnnouncementService = async (id: string): Promise<Announcement> => {
  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) {
    throw new Error('Announcement not found');
  }

  if (!announcement.isActive) {
    throw new Error('Cannot broadcast an inactive announcement.');
  }

  // Find target users
  const users = await prisma.user.findMany({
    where: {
      role: {
        in: announcement.targetAudience,
      },
      active: true, // Only send to active users
    },
    select: { id: true },
  });

  // Send notifications
  // Note: For very large user bases, this should ideally be processed via a job queue (e.g., BullMQ).
  const notificationPromises = users.map((user) =>
    notificationService.createNotification({
      userId: user.id,
      title: announcement.title,
      body: announcement.description.substring(0, 100) + (announcement.description.length > 100 ? '...' : ''), // Truncate body for push
      type: NotificationType.PROMOTIONAL, 
      category: NotificationCategory.PROMOTION,
      meta: { announcementId: announcement.id, imageUrl: announcement.imageUrl },
    })
  );

  await Promise.all(notificationPromises);

  // Update sentAt timestamp
  return prisma.announcement.update({
    where: { id },
    data: { sentAt: new Date() },
  });
};
