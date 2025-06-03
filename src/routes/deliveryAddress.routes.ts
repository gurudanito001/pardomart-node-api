import { Router } from 'express';
import { createDeliveryAddressController, getDeliveryAddressByIdController, getMyDeliveryAddressesController, getMyDefaultDeliveryAddressController, updateDeliveryAddressController, deleteDeliveryAddressController, setDefaultDeliveryAddressController } from '../controllers/deliveryAddress.controllers';
import { authenticate } from "../middlewares/auth.middleware";

// --- DeliveryAddress Routes ---
const router = Router();

router.post('/', authenticate, createDeliveryAddressController);
router.get('/me/default', authenticate, getMyDefaultDeliveryAddressController); // Get default address for authenticated user
router.get('/me', authenticate, getMyDeliveryAddressesController); // Get all addresses for the authenticated user
router.get('/:id', authenticate, getDeliveryAddressByIdController);
router.put('/:id', authenticate, updateDeliveryAddressController);
router.delete('/:id', authenticate, deleteDeliveryAddressController);
router.patch('/:id/set-default', authenticate, setDefaultDeliveryAddressController); // Set an address as default

export default router;