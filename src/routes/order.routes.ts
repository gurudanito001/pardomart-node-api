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
  validateSendMessage,
  validateMarkMessagesAsRead,
} from '../middlewares/validation.middleware';
import { authenticate, authorizeVendorAccess, authorize } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import { validateAddLocation, validateGetPath } from '../middlewares/validation.middleware';
import { addLocationController, getPathController } from '../controllers/deliveryPersonLocation.controller';
import * as messageController from '../controllers/message.controller';

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

// --- Messaging within an Order ---
router.post('/:orderId/messages', validate(validateSendMessage), messageController.sendMessageController);
router.get('/:orderId/messages', messageController.getMessagesForOrderController);
router.patch('/:orderId/messages/read', validate(validateMarkMessagesAsRead), messageController.markMessagesAsReadController);

// Add a location point for a delivery person
router.post(
  '/:orderId/delivery-location',
  authenticate,
  authorize([Role.delivery]), // Ensure this role exists
  validate(validateAddLocation),
  addLocationController
);

// Get the delivery path for an order
router.get(
  '/:orderId/delivery-path',
  authenticate,
  authorize([Role.customer, Role.admin, Role.delivery]),
  validate(validateGetPath),
  getPathController // You would add this controller to order.controller.ts
);


export default router;
