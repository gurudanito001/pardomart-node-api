// routes/tag.routes.ts
import express from 'express';
import * as tagController from '../controllers/tag.controllers';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = express.Router();

// --- Public Tag Routes ---
router.get('/:id', tagController.getTagById);
router.get('/', tagController.getAllTags);

// --- Admin-only Tag Routes ---
router.post(
  '/',
  authenticate,
  authorize([Role.admin]),
  tagController.createTag
);
router.post(
  '/bulk',
  authenticate,
  authorize([Role.admin]),
  tagController.createTagsBulk
);
router.patch(
  '/:id',
  authenticate,
  authorize([Role.admin]),
  tagController.updateTag
);
router.delete(
  '/:id',
  authenticate,
  authorize([Role.admin]),
  tagController.deleteTag
);

export default router;