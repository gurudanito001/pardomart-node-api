// routes/vendor.routes.ts
import express from 'express';
import * as vendorController from '../controllers/vendor.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate, validateCreateVendor } from '../middlewares/validation.middleware';


const router = express.Router();

router.post('/', authenticate, validate(validateCreateVendor), vendorController.createVendor);
router.get('/:id', vendorController.getVendorById);
router.get('/', vendorController.getAllVendors);
//router.get('/findVendors/nearby', vendorController.getVendorsByProximity);
router.get('/getvendorsby/userId', authenticate, vendorController.getVendorsByUserId);
router.patch('/:id', authenticate, vendorController.updateVendor);
router.delete('/:id', authenticate, vendorController.deleteVendor);


export default router;