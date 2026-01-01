import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as announcementService from '../services/announcement.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import { catchAsync } from '../utils/catchAsync';

/**
 * @swagger
 * tags:
 *   name: Announcement
 *   description: Announcement management
 */

/**
 * @swagger
 * /announcements:
 *   post:
 *     summary: Create a new announcement (Admin)
 *     tags: [Announcement]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description, targetAudience]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               image: { type: string, format: binary }
 *               targetAudience: 
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [customer, vendor, store_admin, store_shopper, delivery_person, admin]
 *               isActive: { type: boolean, default: true }
 *     responses:
 *       201:
 *         description: Announcement created.
 *       500:
 *         description: Server error.
 */
export const createAnnouncementController = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { title, description, targetAudience, isActive } = req.body;
  const imageUrl = req.file?.path;

  // Parse targetAudience if it comes as a string (common in FormData)
  let roles: Role[] = [];
  if (typeof targetAudience === 'string') {
      if (targetAudience.includes(',')) {
            roles = targetAudience.split(',').map((r: string) => r.trim() as Role);
      } else {
            roles = [targetAudience as Role];
      }
  } else if (Array.isArray(targetAudience)) {
      roles = targetAudience as Role[];
  }

  if (roles.length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Target audience is required.' });
  }

  const announcement = await announcementService.createAnnouncementService({
    title,
    description,
    imageUrl,
    targetAudience: roles,
    isActive: isActive === 'true' || isActive === true,
  });

  res.status(StatusCodes.CREATED).json(announcement);
});

/**
 * @swagger
 * /announcements:
 *   get:
 *     summary: Get all announcements (Admin sees all, Users see relevant)
 *     tags: [Announcement]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of announcements.
 */
export const getAnnouncementsController = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { userRole } = req;

  let announcements;
  if (userRole === Role.admin) {
    announcements = await announcementService.getAllAnnouncementsService();
  } else {
    announcements = await announcementService.getAnnouncementsForRoleService(userRole!);
  }

  res.status(StatusCodes.OK).json(announcements);
});

/**
 * @swagger
 * /announcements/{id}:
 *   patch:
 *     summary: Update an announcement (Admin)
 *     tags: [Announcement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               image: { type: string, format: binary }
 *               targetAudience: { type: array, items: { type: string } }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Updated announcement.
 */
export const updateAnnouncementController = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { title, description, targetAudience, isActive } = req.body;
  const imageUrl = req.file?.path;

  let roles: Role[] | undefined;
  if (targetAudience) {
      if (typeof targetAudience === 'string') {
          if (targetAudience.includes(',')) {
              roles = targetAudience.split(',').map((r: string) => r.trim() as Role);
          } else {
              roles = [targetAudience as Role];
          }
      } else if (Array.isArray(targetAudience)) {
          roles = targetAudience as Role[];
      }
  }

  const updated = await announcementService.updateAnnouncementService(id, {
    title,
    description,
    imageUrl,
    targetAudience: roles,
    isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : undefined,
  });

  res.status(StatusCodes.OK).json(updated);
});

/**
 * @swagger
 * /announcements/{id}:
 *   delete:
 *     summary: Delete an announcement (Admin)
 *     tags: [Announcement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Deleted.
 */
export const deleteAnnouncementController = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  await announcementService.deleteAnnouncementService(id);
  res.status(StatusCodes.NO_CONTENT).send();
});

/**
 * @swagger
 * /announcements/{id}/broadcast:
 *   post:
 *     summary: Broadcast an announcement to target audience (Admin)
 *     tags: [Announcement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Announcement broadcasted.
 */
export const broadcastAnnouncementController = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const announcement = await announcementService.broadcastAnnouncementService(id);
  res.status(StatusCodes.OK).json({ message: 'Announcement broadcasted successfully.', announcement });
});
