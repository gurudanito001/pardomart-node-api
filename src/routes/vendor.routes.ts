// routes/vendor.routes.ts
import express from 'express';
import * as vendorController from '../controllers/vendor.controller';
import { authenticate } from '../middlewares/auth.middleware';
import {
  validate,
  validateCreateVendor,
  validateGetAllVendors,
  validateGetVendorById,
  validateUpdateVendor,
  validateVendorId,
} from '../middlewares/validation.middleware';

const router = express.Router();

router.post('/', authenticate, validate(validateCreateVendor), vendorController.createVendor);
router.get('/:id', validate(validateGetVendorById), vendorController.getVendorById);
router.get('/', validate(validateGetAllVendors), vendorController.getAllVendors);
//router.get('/findVendors/nearby', vendorController.getVendorsByProximity);
router.get('/getvendorsby/userId', authenticate, vendorController.getVendorsByUserId);
router.patch('/:id', authenticate, validate(validateUpdateVendor), vendorController.updateVendor);
router.delete('/:id', authenticate, validate(validateVendorId), vendorController.deleteVendor);

export default router;