import { Router } from 'express';
import * as returnController from '../controllers/return.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Customer creates a return request
router.post('/', returnController.createReturnRequestController);

// Vendor/Admin updates status (Approve, Reject, Refund, etc.)
router.patch(
  '/:requestId/status',
  authorize([Role.vendor, Role.store_admin, Role.admin]),
  returnController.updateReturnRequestStatusController
);

export default router;
