import { Router } from 'express';
import * as supportController from '../controllers/support.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate, validateCreateSupportTicket, validateUpdateSupportTicketStatus } from '../middlewares/validation.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// User-facing routes
router.post('/tickets', validate(validateCreateSupportTicket), supportController.createSupportTicketController);
router.get('/tickets/me', supportController.getMySupportTicketsController);

// Admin-facing routes
router.get(
  '/tickets',
  authorize([Role.admin]),
  supportController.getAllSupportTicketsController
);

router.patch(
  '/tickets/:ticketId/status',
  authorize([Role.admin]),
  validate(validateUpdateSupportTicketStatus),
  supportController.updateSupportTicketStatusController
);

export default router;