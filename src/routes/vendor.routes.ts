// routes/vendor.routes.ts
import express from 'express';
import * as vendorController from '../controllers/vendor.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate, validateCreateVendor } from '../middlewares/validation.middleware';


const router = express.Router();

router.post('/', authenticate, validate(validateCreateVendor), vendorController.createVendor);
router.get('/:id', authenticate, vendorController.getVendorById);
router.get('/', authenticate, vendorController.getAllVendors);
router.patch('/:id', authenticate, vendorController.updateVendor);
router.delete('/:id', authenticate, vendorController.deleteVendor);
router.get('/user/:userId', authenticate, vendorController.getVendorsByUserId);

export default router;