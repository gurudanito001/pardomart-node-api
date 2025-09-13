"use strict";
exports.__esModule = true;
var express_1 = require("express");
var orderController = require("../controllers/order.controllers");
var validation_middleware_1 = require("../middlewares/validation.middleware");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = express_1.Router();
// All routes below require a logged-in user
router.use(auth_middleware_1.authenticate);
// --- Vendor-facing routes ---
router.get('/vendorOrders', auth_middleware_1.authorizeVendorAccess, validation_middleware_1.validate(validation_middleware_1.validateGetVendorOrders), orderController.getVendorOrdersController);
router.patch('/:orderId/accept', auth_middleware_1.authorizeVendorAccess, validation_middleware_1.validate(validation_middleware_1.validateVendorOrderAction), orderController.acceptOrderController);
router.patch('/:orderId/decline', auth_middleware_1.authorizeVendorAccess, validation_middleware_1.validate(validation_middleware_1.validateDeclineOrder), orderController.declineOrderController);
router.patch('/:orderId/start-shopping', auth_middleware_1.authorizeVendorAccess, validation_middleware_1.validate(validation_middleware_1.validateVendorOrderAction), orderController.startShoppingController);
// --- Customer-facing routes ---
router.post('/', validation_middleware_1.validate(validation_middleware_1.validateCreateOrder), orderController.createOrderController);
router.get('/user/me', orderController.getOrdersByUserController);
router.get('/delivery-slots', validation_middleware_1.validate(validation_middleware_1.validateGetDeliverySlots), orderController.getAvailableDeliverySlotsController);
router.get('/:id', validation_middleware_1.validate(validation_middleware_1.validateGetOrDeleteOrder), orderController.getOrderByIdController);
router.patch('/:id', validation_middleware_1.validate(validation_middleware_1.validateUpdateOrder), orderController.updateOrderController);
router.patch('/:id/status', validation_middleware_1.validate(validation_middleware_1.validateUpdateOrderStatus), orderController.updateOrderStatusController);
router.patch('/:orderId/tip', validation_middleware_1.validate(validation_middleware_1.validateUpdateTip), orderController.updateOrderTipController);
exports["default"] = router;
