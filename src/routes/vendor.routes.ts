// routes/vendor.routes.ts
import express from 'express';
import * as vendorController from '../controllers/vendor.controller';
import multer from 'multer';
import { authenticate, authorize } from '../middlewares/auth.middleware';
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
router.post('/', authenticate, validate(validateCreateVendor), vendorController.createVendor);
router.get('/:id', validate(validateGetVendorById), vendorController.getVendorById);
router.get('/', validate(validateGetAllVendors), vendorController.getAllVendors);
//router.get('/findVendors/nearby', vendorController.getVendorsByProximity);
router.get('/incomplete-setups', authenticate, vendorController.getIncompleteSetups);
router.patch('/:id/approve', authenticate, authorize(['admin']), validate(validateVendorId), vendorController.approveVendor);
router.patch('/:id/publish', authenticate, validate(validateVendorId), vendorController.publishVendor);
router.get('/getvendorsby/userId', authenticate, vendorController.getVendorsByUserId);
router.patch('/:id', authenticate, multer().none(), validate(validateUpdateVendor), vendorController.updateVendor);
router.delete('/:id', authenticate, validate(validateVendorId), vendorController.deleteVendor);

export default router;