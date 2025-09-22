import { Router } from 'express';
import * as faqController from '../controllers/faq.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  validate,
  validateCreateFaq,
  validateUpdateFaq,
  validateFaqId,
} from '../middlewares/validation.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Public route to get all active FAQs
router.get('/', faqController.getAllFaqsController);

// --- Admin-only routes ---
router.post('/', authenticate, authorize([Role.admin]), validate(validateCreateFaq), faqController.createFaqController);
router.patch('/:id', authenticate, authorize([Role.admin]), validate(validateUpdateFaq), faqController.updateFaqController);
router.delete('/:id', authenticate, authorize([Role.admin]), validate(validateFaqId), faqController.deleteFaqController);

export default router;
