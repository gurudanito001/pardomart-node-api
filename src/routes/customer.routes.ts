// src/routes/customer.routes.ts
import { Router } from 'express';
import * as customerController from '../controllers/customer.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// --- Admin-only Customer Routes ---
router.get('/admin/overview', authorize([Role.admin]), customerController.getAdminCustomerOverviewController);
router.get('/admin/all', authorize([Role.admin]), customerController.adminListAllCustomersController);
router.patch('/admin/:customerId', authorize([Role.admin]), customerController.adminUpdateCustomerProfileController);
router.get('/admin/:customerId/transactions', authorize([Role.admin]), customerController.adminListCustomerTransactionsController);
router.get('/admin/:customerId', authorize([Role.admin]), customerController.adminGetCustomerDetailsController);

router.get('/', authorize([Role.vendor, Role.store_admin, Role.store_shopper]), customerController.listCustomersController);
router.get('/:customerId/transactions', authorize([Role.vendor, Role.store_admin]), customerController.listCustomerTransactionsController);

export default router;