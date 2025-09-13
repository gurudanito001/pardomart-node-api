// routes/vendorOpeningHours.routes.ts
import express from 'express';
import * as vendorOpeningHoursController from '../controllers/vendorOpeningHours.controllers';
import { authenticate } from '../middlewares/auth.middleware';
import { validate, validateCreateOrUpdateVendorOpeningHours } from '../middlewares/validation.middleware';




const router = express.Router();

router.patch('/', authenticate, validate(validateCreateOrUpdateVendorOpeningHours), vendorOpeningHoursController.updateVendorOpeningHours);
router.get('/', authenticate, vendorOpeningHoursController.getAllVendorOpeningHours);

export default router;