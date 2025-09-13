import { Router } from 'express';
import * as orderController from '../controllers/order.controllers';
import {
  validate,
  validateCreateOrder,
  validateGetOrDeleteOrder,
  validateUpdateOrderStatus,
  validateUpdateOrder,
  validateGetVendorOrders,
  validateVendorOrderAction,
  validateDeclineOrder,
  validateGetDeliverySlots,
  validateUpdateTip,
} from '../middlewares/validation.middleware';
import { authenticate, authorizeVendorAccess } from '../middlewares/auth.middleware';

const router = Router();

// All routes below require a logged-in user
router.use(authenticate);


// --- Vendor-facing routes ---
router.get('/vendorOrders', authorizeVendorAccess, validate(validateGetVendorOrders), orderController.getVendorOrdersController);
router.patch('/:orderId/accept', authorizeVendorAccess, validate(validateVendorOrderAction), orderController.acceptOrderController);
router.patch('/:orderId/decline', authorizeVendorAccess, validate(validateDeclineOrder), orderController.declineOrderController);
router.patch('/:orderId/start-shopping', authorizeVendorAccess, validate(validateVendorOrderAction), orderController.startShoppingController);


// --- Customer-facing routes ---
router.post('/', validate(validateCreateOrder), orderController.createOrderController);
router.get('/user/me', orderController.getOrdersByUserController);
router.get('/delivery-slots', validate(validateGetDeliverySlots), orderController.getAvailableDeliverySlotsController);
router.get('/:id', validate(validateGetOrDeleteOrder), orderController.getOrderByIdController);
router.patch('/:id', validate(validateUpdateOrder), orderController.updateOrderController);
router.patch('/:id/status', validate(validateUpdateOrderStatus), orderController.updateOrderStatusController);
router.patch('/:orderId/tip', validate(validateUpdateTip), orderController.updateOrderTipController);


export default router;
