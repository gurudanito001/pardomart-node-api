"use strict";
exports.__esModule = true;
var express_1 = require("express");
var order_controllers_1 = require("../controllers/order.controllers");
var auth_middleware_1 = require("../middlewares/auth.middleware");
// --- Cart Routes ---
var router = express_1.Router();
router.post('/', auth_middleware_1.authenticate, order_controllers_1.createOrderController); // Changed route to /
router.get('/:id', auth_middleware_1.authenticate, order_controllers_1.getOrderByIdController);
router.get('/user/getByUserId', auth_middleware_1.authenticate, order_controllers_1.getOrdersByUserController); // New route to get cart by user ID
router.patch('/:id', auth_middleware_1.authenticate, order_controllers_1.updateOrderController);
router.patch('/:id/status', auth_middleware_1.authenticate, order_controllers_1.updateOrderStatusController);
// Query parameters: status=pending,accepted
router.get('/vendorOrders', auth_middleware_1.authenticate, auth_middleware_1.authorizeVendorAccess, order_controllers_1.getVendorOrdersController);
router.patch('/:orderId/accept', auth_middleware_1.authenticate, auth_middleware_1.authorizeVendorAccess, order_controllers_1.acceptOrderController);
// Body: { "reason": "Optional reason for declining" }
router.patch('/:orderId/decline', auth_middleware_1.authenticate, auth_middleware_1.authorizeVendorAccess, order_controllers_1.declineOrderController);
router.patch('/:orderId/start-shopping', auth_middleware_1.authenticate, auth_middleware_1.authorizeVendorAccess, order_controllers_1.startShoppingController);
exports["default"] = router;
