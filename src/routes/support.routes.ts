import { Router } from 'express';
import * as supportController from '../controllers/support.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  validate,
  validateCreateSupportTicket,
  validateUpdateSupportTicket,
  validateUpdateSupportTicketStatus,
} from '../middlewares/validation.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// User-facing routes
router.post('/tickets', validate(validateCreateSupportTicket), supportController.createSupportTicketController);
router.get('/tickets/me', supportController.getMySupportTicketsController);
router.get('/tickets/:ticketId', supportController.getSupportTicketByIdController);
router.put('/tickets/:ticketId', validate(validateUpdateSupportTicket), supportController.updateSupportTicketController);

// Admin-facing routes
router.get(
  '/admin/overview',
  authorize([Role.admin]),
  supportController.getSupportTicketOverviewController
);

router.get(
  '/admin/export',
  authorize([Role.admin]),
  supportController.exportSupportTicketsController
);

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