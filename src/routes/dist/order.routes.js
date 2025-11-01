"use strict";
exports.__esModule = true;
var express_1 = require("express");
var orderController = require("../controllers/order.controllers");
var validation_middleware_1 = require("../middlewares/validation.middleware");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var client_1 = require("@prisma/client");
var validation_middleware_2 = require("../middlewares/validation.middleware");
var deliveryPersonLocation_controller_1 = require("../controllers/deliveryPersonLocation.controller");
var messageController = require("../controllers/message.controller");
var router = express_1.Router();
// All routes below require a logged-in user
router.use(auth_middleware_1.authenticate);
// --- Admin-only Order Routes ---
router.get('/admin/overview', auth_middleware_1.authorize([client_1.Role.admin]), orderController.getOrderOverviewDataController);
router.get('/admin/all', auth_middleware_1.authorize([client_1.Role.admin]), orderController.adminGetAllOrdersController);
router.patch('/admin/:orderId', auth_middleware_1.authorize([client_1.Role.admin]), orderController.adminUpdateOrderController);
router.get('/admin/:orderId/messages', auth_middleware_1.authorize([client_1.Role.admin]), messageController.adminGetMessagesForOrderController);
// --- Vendor-facing routes ---
//router.get('/vendorOrders', authorize([Role.store_admin, Role.store_shopper]), validate(validateGetVendorOrders), orderController.getVendorOrdersController);
router.patch('/:orderId/accept', auth_middleware_1.authorizeVendorAccess, validation_middleware_1.validate(validation_middleware_1.validateVendorOrderAction), orderController.acceptOrderController);
router.patch('/:orderId/decline', auth_middleware_1.authorizeVendorAccess, validation_middleware_1.validate(validation_middleware_1.validateDeclineOrder), orderController.declineOrderController);
router.patch('/:orderId/start-shopping', auth_middleware_1.authorizeVendorAccess, validation_middleware_1.validate(validation_middleware_1.validateVendorOrderAction), orderController.startShoppingController);
// GET /api/v1/orders/vendor - Get all orders for the authenticated vendor's stores
router.get('/vendor', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.vendor, client_1.Role.store_admin, client_1.Role.store_shopper]), orderController.getOrdersForVendor);
// OTP Verification Route
router.post('/:id/verify-pickup', auth_middleware_1.authenticate, auth_middleware_1.authorize(['vendor', 'store_admin', 'store_shopper']), orderController.verifyPickupOtp);
// --- Customer-facing routes ---
router.post('/', validation_middleware_1.validate(validation_middleware_1.validateCreateOrder), orderController.createOrderController);
router.get('/user/me', orderController.getOrdersByUserController);
router.get('/delivery-slots', validation_middleware_1.validate(validation_middleware_1.validateGetDeliverySlots), orderController.getAvailableDeliverySlotsController);
router.get('/:id', validation_middleware_1.validate(validation_middleware_1.validateGetOrDeleteOrder), orderController.getOrderByIdController);
router.patch('/:id', validation_middleware_1.validate(validation_middleware_1.validateUpdateOrder), orderController.updateOrderController);
router.patch('/:id/status', validation_middleware_1.validate(validation_middleware_1.validateUpdateOrderStatus), orderController.updateOrderStatusController);
router.patch('/:orderId/tip', validation_middleware_1.validate(validation_middleware_1.validateUpdateTip), orderController.updateOrderTipController);
// --- Messaging within an Order ---
router.post('/:orderId/messages', validation_middleware_1.validate(validation_middleware_1.validateSendMessage), messageController.sendMessageController);
router.get('/:orderId/messages', messageController.getMessagesForOrderController);
router.patch('/:orderId/messages/read', validation_middleware_1.validate(validation_middleware_1.validateMarkMessagesAsRead), messageController.markMessagesAsReadController);
// --- Live Shopping Actions ---
router.patch('/:orderId/items/:itemId/update-shopping-status', auth_middleware_1.authorize([client_1.Role.vendor, client_1.Role.store_admin, client_1.Role.store_shopper, client_1.Role.delivery_person]), validation_middleware_1.validate(validation_middleware_1.validateUpdateOrderItemShoppingStatus), orderController.updateOrderItemShoppingStatusController);
router.patch('/:orderId/items/:itemId/respond-to-replacement', auth_middleware_1.authorize([client_1.Role.customer]), validation_middleware_1.validate(validation_middleware_1.validateRespondToReplacement), orderController.respondToReplacementController);
// Add a location point for a delivery person
router.post('/:orderId/delivery-location', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.delivery_person]), validation_middleware_1.validate(validation_middleware_2.validateAddLocation), deliveryPersonLocation_controller_1.addLocationController);
// Get the delivery path for an order
router.get('/:orderId/delivery-path', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.customer, client_1.Role.admin, client_1.Role.delivery_person]), validation_middleware_1.validate(validation_middleware_2.validateGetPath), deliveryPersonLocation_controller_1.getPathController // You would add this controller to order.controller.ts
);
exports["default"] = router;
