// src/routes/device.routes.ts
import express from 'express';
import { registerDeviceController, unregisterDeviceController } from '../controllers/device.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate, validateRegisterDevice, validateUnregisterDevice } from '../middlewares/validation.middleware';

const router = express.Router();

router.post('/', authenticate, validate(validateRegisterDevice), registerDeviceController);
router.delete('/:fcmToken', authenticate, validate(validateUnregisterDevice), unregisterDeviceController);

export default router;
