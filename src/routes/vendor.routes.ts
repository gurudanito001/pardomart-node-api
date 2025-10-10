// routes/vendor.routes.ts
import express from 'express';
import * as vendorController from '../controllers/vendor.controller';
import multer from 'multer';
import { authenticate, authorize } from '../middlewares/auth.middleware'; // Assuming authorize is here
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
router.get('/', validate(validateGetAllVendors), vendorController.getAllVendors);
//router.get('/findVendors/nearby', vendorController.getVendorsByProximity);
router.get('/incomplete-setups', authenticate, vendorController.getIncompleteSetups);
router.get('/getvendorsby/userId', authenticate, vendorController.getVendorsByUserId);
router.get('/:id', validate(validateGetVendorById), vendorController.getVendorById);
router.patch('/:id/approve', authenticate, authorize(['admin']), validate(validateVendorId), vendorController.approveVendor); // Admin only
router.patch('/:id/publish', authenticate, authorize(['vendor', 'store_admin']), validate(validateVendorId), vendorController.publishVendor); // Vendor owner or store admin
router.patch('/:id', authenticate, authorize(['vendor', 'store_admin']), multer().none(), validate(validateUpdateVendor), vendorController.updateVendor); // Vendor owner or store admin
router.delete('/:id', authenticate, authorize(['vendor']), validate(validateVendorId), vendorController.deleteVendor); // Vendor owner only

export default router;