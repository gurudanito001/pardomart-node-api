// routes/staff.routes.ts
import { Router } from 'express';
import * as staffController from '../controllers/staff.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
// import { validate, validateCreateStaff, validateId } from '../middlewares/validation.middleware';

const router = Router();

router.use(authenticate);

// Create a new staff member
router.post('/', /* validate(validateCreateStaff), */ staffController.createStaffController);

// List all staff for the authenticated user (across all their stores)
router.get('/', authorize([Role.vendor, Role.store_admin]), staffController.listStaffForVendorOrAdminController);
// List all transactions for staff of the authenticated vendor
router.get('/transactions', authorize([Role.vendor, Role.store_admin]), staffController.listStaffTransactionsController);


router.get('/store/:vendorId', /* validate(validateId('vendorId')), */ staffController.listStaffByVendorController);
router.get('/:staffId', /* validate(validateId('staffId')), */ staffController.getStaffByIdController);
router.patch('/:staffId', /* validate(validateId('staffId')), */ staffController.updateStaffController);
router.delete('/:staffId', /* validate(validateId('staffId')), */ staffController.deleteStaffController);

export default router;