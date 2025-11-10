// src/routes/ad.routes.ts
import { Router } from 'express';
import multer from 'multer';
import * as adController from '../controllers/ad.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * components:
 *   schemas:
 *     Ad:
 *       type: object
 *       properties:
 *         id: { type: string, format: cuid }
 *         title: { type: string }
 *         description: { type: string, nullable: true }
 *         imageUrl: { type: string, format: uri }
 *         vendorId: { type: string, format: uuid }
 *         isActive: { type: boolean }
 *         startDate: { type: string, format: date-time }
 *         endDate: { type: string, format: date-time, nullable: true }
 *     CreateAdPayload:
 *       type: object
 *       required: [title, vendorId, image]
 *       properties:
 *         title: { type: string }
 *         description: { type: string }
 *         vendorId: { type: string, format: uuid }
 *         image: { type: string, format: binary, description: "The ad image file." }
 *         isActive: { type: boolean }
 *         startDate: { type: string, format: date-time }
 *         endDate: { type: string, format: date-time }
 *     UpdateAdPayload:
 *       type: object
 *       properties:
 *         title: { type: string }
 *         description: { type: string }
 *         image: { type: string, format: binary }
 *         isActive: { type: boolean }
 *         startDate: { type: string, format: date-time }
 *         endDate: { type: string, format: date-time }
 */

// --- Public Ad Routes ---
router.get('/', adController.listAdsController);
router.get('/:id', adController.getAdByIdController);

// --- Admin-only Ad Routes ---
router.post('/', authenticate, authorize([Role.admin]), upload.single('image'), adController.createAdController);
router.patch('/:id', authenticate, authorize([Role.admin]), upload.single('image'), adController.updateAdController);
router.delete('/:id', authenticate, authorize([Role.admin]), adController.deleteAdController);

export default router;