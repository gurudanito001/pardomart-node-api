// routes/staff.routes.ts
import { Router } from 'express';
import * as staffController from '../controllers/staff.controller';
import { authenticate } from '../middlewares/auth.middleware';
// import { validate, validateCreateStaff, validateId } from '../middlewares/validation.middleware';

const router = Router();

router.use(authenticate);

// Create a new staff member
router.post('/', /* validate(validateCreateStaff), */ staffController.createStaffController);

// List all staff for the authenticated user (across all their stores)
router.get('/', staffController.listStaffByOwnerController);

router.get('/store/:vendorId', /* validate(validateId('vendorId')), */ staffController.listStaffByVendorController);
router.get('/:staffId', /* validate(validateId('staffId')), */ staffController.getStaffByIdController);
router.patch('/:staffId', /* validate(validateId('staffId')), */ staffController.updateStaffController);
router.delete('/:staffId', /* validate(validateId('staffId')), */ staffController.deleteStaffController);

export default router;