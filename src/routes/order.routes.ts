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
  validateUpdateOrderItemShoppingStatus,
  validateRespondToReplacement,
} from '../middlewares/validation.middleware';
import { authenticate, authorizeVendorAccess, authorize } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import { validateAddLocation, validateGetPath } from '../middlewares/validation.middleware';
import { addLocationController, getPathController } from '../controllers/deliveryPersonLocation.controller';
import * as messageController from '../controllers/message.controller';

const router = Router();

// All routes below require a logged-in user
router.use(authenticate);


// --- Admin-only Order Routes ---
router.get('/admin/overview', authorize([Role.admin]), orderController.getOrderOverviewDataController);
router.get('/admin/all', authorize([Role.admin]), orderController.adminGetAllOrdersController);
router.patch('/admin/:orderId', authorize([Role.admin]), orderController.adminUpdateOrderController);
router.get('/admin/:orderId/messages', authorize([Role.admin]), messageController.adminGetMessagesForOrderController);

// --- Vendor-facing routes ---
//router.get('/vendorOrders', authorize([Role.store_admin, Role.store_shopper]), validate(validateGetVendorOrders), orderController.getVendorOrdersController);
router.patch('/:orderId/accept', authorizeVendorAccess, validate(validateVendorOrderAction), orderController.acceptOrderController);
router.patch('/:orderId/decline', authorizeVendorAccess, validate(validateDeclineOrder), orderController.declineOrderController);
router.patch('/:orderId/start-shopping', authorizeVendorAccess, validate(validateVendorOrderAction), orderController.startShoppingController);
// GET /api/v1/orders/vendor - Get all orders for the authenticated vendor's stores
router.get('/vendor', authenticate, authorize([Role.vendor, Role.store_admin, Role.store_shopper]), orderController.getOrdersForVendor);
// OTP Verification Route
router.post(
  '/:id/verify-pickup',
  authenticate,
  authorize(['vendor', 'store_admin', 'store_shopper']),
  orderController.verifyPickupOtp
);



// --- Customer-facing routes ---
router.post('/', validate(validateCreateOrder), orderController.createOrderController);
router.get('/user/me', orderController.getOrdersByUserController);
router.get(
  '/active/me',
  authorize([Role.store_admin, Role.store_shopper, Role.delivery_person]),
  orderController.getActiveOrderController
);
router.get('/delivery-slots', validate(validateGetDeliverySlots), orderController.getAvailableDeliverySlotsController);
router.get('/delivery/available', authenticate, authorize([Role.delivery_person]), orderController.getAvailableOrdersForDeliveryController);
router.get('/delivery/me', authenticate, authorize([Role.delivery_person]), orderController.getMyDeliveryOrdersController);
router.patch(
  '/:orderId/accept-delivery',
  authenticate,
  authorize([Role.delivery_person]),
  orderController.acceptOrderForDeliveryController
);
router.get('/:id', validate(validateGetOrDeleteOrder), orderController.getOrderByIdController);
router.patch('/:id', validate(validateUpdateOrder), orderController.updateOrderController);
router.patch('/:id/status', validate(validateUpdateOrderStatus), orderController.updateOrderStatusController);
router.patch('/:orderId/tip', validate(validateUpdateTip), orderController.updateOrderTipController);

// --- Messaging within an Order ---
router.post('/:orderId/messages', validate(validateSendMessage), messageController.sendMessageController);
router.get('/:orderId/messages', messageController.getMessagesForOrderController);
router.patch('/:orderId/messages/read', validate(validateMarkMessagesAsRead), messageController.markMessagesAsReadController);

// --- Live Shopping Actions ---
router.patch(
  '/:orderId/items/:itemId/update-shopping-status',
  authorize([Role.vendor, Role.store_admin, Role.store_shopper, Role.delivery_person]),
  validate(validateUpdateOrderItemShoppingStatus),
  orderController.updateOrderItemShoppingStatusController
);

router.patch(
  '/:orderId/items/:itemId/respond-to-replacement',
  authorize([Role.customer]),
  validate(validateRespondToReplacement),
  orderController.respondToReplacementController
);


// Add a location point for a delivery person
router.post(
  '/:orderId/delivery-location',
  authenticate,
  authorize([Role.delivery_person]),
  validate(validateAddLocation),
  addLocationController
);

// Get the delivery path for an order
router.get(
  '/:orderId/delivery-path',
  authenticate,
  authorize([Role.customer, Role.admin, Role.delivery_person]),
  validate(validateGetPath),
  getPathController // You would add this controller to order.controller.ts
);


export default router;
