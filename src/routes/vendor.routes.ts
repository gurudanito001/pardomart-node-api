// routes/vendor.routes.ts
import express from 'express';
import * as vendorController from '../controllers/vendor.controller';

const router = express.Router();

router.post('/', vendorController.createVendor);
router.get('/:id', vendorController.getVendorById);
router.get('/', vendorController.getAllVendors);
router.put('/:id', vendorController.updateVendor);
router.delete('/:id', vendorController.deleteVendor);
router.get('/user/:userId', vendorController.getVendorsByUserId);

export default router;