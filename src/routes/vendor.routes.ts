// routes/vendor.routes.ts
import express from 'express';
import * as vendorController from '../controllers/vendor.controller';
import multer from 'multer';
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

// Use multer().none() to handle multipart/form-data text fields.
// This will populate req.body with the text fields from the formData.
router.post('/', authenticate, multer().none(), validate(validateCreateVendor), vendorController.createVendor);
router.get('/:id', validate(validateGetVendorById), vendorController.getVendorById);
router.get('/', validate(validateGetAllVendors), vendorController.getAllVendors);
//router.get('/findVendors/nearby', vendorController.getVendorsByProximity);
router.get('/getvendorsby/userId', authenticate, vendorController.getVendorsByUserId);
router.patch('/:id', authenticate, validate(validateUpdateVendor), vendorController.updateVendor);
router.delete('/:id', authenticate, validate(validateVendorId), vendorController.deleteVendor);

export default router;