// routes/vendorOpeningHours.routes.ts
import express from 'express';
import * as vendorOpeningHoursController from '../controllers/vendorOpeningHours.controllers';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate, validateCreateOrUpdateVendorOpeningHours } from '../middlewares/validation.middleware';
import { Role } from '@prisma/client';




const router = express.Router();

router.patch('/', authenticate, authorize([Role.vendor, Role.store_admin, Role.admin]), validate(validateCreateOrUpdateVendorOpeningHours), vendorOpeningHoursController.updateVendorOpeningHours);
router.get('/', authenticate, vendorOpeningHoursController.getAllVendorOpeningHours);

export default router;