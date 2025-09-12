import { Router } from 'express';
import * as deliveryAddressController from '../controllers/deliveryAddress.controllers';
import {
  validate,
  validateCreateDeliveryAddress,
  validateUpdateDeliveryAddress,
  validateGetOrDeleteDeliveryAddress,
} from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All routes in this file are protected and require authentication
router.use(authenticate);

// Create a new delivery address
router.post('/', validate(validateCreateDeliveryAddress), deliveryAddressController.createDeliveryAddressController);

// Get all delivery addresses for the authenticated user
router.get('/me', deliveryAddressController.getMyDeliveryAddressesController);

// Get the default delivery address for the authenticated user
router.get('/me/default', deliveryAddressController.getMyDefaultDeliveryAddressController);

router.get('/:id', validate(validateGetOrDeleteDeliveryAddress), deliveryAddressController.getDeliveryAddressByIdController);
router.put('/:id', validate(validateUpdateDeliveryAddress), deliveryAddressController.updateDeliveryAddressController);
router.delete('/:id', validate(validateGetOrDeleteDeliveryAddress), deliveryAddressController.deleteDeliveryAddressController);
router.patch('/:id/set-default', validate(validateGetOrDeleteDeliveryAddress), deliveryAddressController.setDefaultDeliveryAddressController);

export default router;

