import { Router } from 'express';
import * as deliveryPersonController from '../controllers/delivery-person.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/admin/overview', authenticate, authorize([Role.admin]), deliveryPersonController.getAdminDeliveryPersonOverviewController);
router.get('/admin/all', authenticate, authorize([Role.admin]), deliveryPersonController.adminListAllDeliveryPersonsController);
router.get('/admin/export', authenticate, authorize([Role.admin]), deliveryPersonController.exportDeliveryPersonsController);
router.get('/admin/:id/deliveries', authenticate, authorize([Role.admin]), deliveryPersonController.adminGetDeliveryHistoryController);
router.get('/admin/:id', authenticate, authorize([Role.admin]), deliveryPersonController.adminGetDeliveryPersonDetailsByIdController);
router.patch('/admin/:id', authenticate, authorize([Role.admin]), deliveryPersonController.adminUpdateDeliveryPersonProfileController);

export default router;
