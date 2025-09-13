// routes/tag.routes.ts
import express from 'express';
import * as feeController from '../controllers/fee.controllers';
import {
  validate,
  validateCalculateFees,
  validateCreateFee,
  validateFeeId,
  validateFeeType,
  validateUpdateFee,
} from '../middlewares/validation.middleware';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = express.Router();

// Public routes
router.get('/current', feeController.getCurrentFeesController);
router.get('/current/:type', validate(validateFeeType), feeController.getCurrentFeesController);

// Authenticated routes
router.post('/calculate-fees', authenticate, validate(validateCalculateFees), feeController.calculateFeesController);

// Admin routes
router.post('/', authenticate, authorize([Role.admin]), validate(validateCreateFee), feeController.createFeeController);
router.patch('/:id', authenticate, authorize([Role.admin]), validate(validateUpdateFee), feeController.updateFeeController);
router.patch('/deactivate/:type', authenticate, authorize([Role.admin]), validate(validateFeeType), feeController.deactivateFeeController);
router.delete('/:id', authenticate, authorize([Role.admin]), validate(validateFeeId), feeController.deleteFeeController);

export default router;