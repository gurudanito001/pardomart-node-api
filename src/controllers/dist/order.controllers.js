"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.updateOrderController = exports.cancelOrderController = exports.updateOrderStatusController = exports.getOrdersByUserController = exports.getOrderByIdController = exports.createOrderController = void 0;
var order_service_1 = require("../services/order.service"); // Adjust the path if needed
var cartItem_model_1 = require("../models/cartItem.model");
var order_model_1 = require("../models/order.model");
// --- Order Controllers ---
/**
 * Controller for creating a new order.
 * POST /orders
 */
exports.createOrderController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, vendorId, cartId, shippingAddress, deliveryInstructions, cartItems, totalAmount_1, order, finalOrder, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                userId = req.userId;
                _a = req.body, vendorId = _a.vendorId, cartId = _a.cartId, shippingAddress = _a.shippingAddress, deliveryInstructions = _a.deliveryInstructions;
                return [4 /*yield*/, cartItem_model_1.getCartItemsByCartId(cartId)];
            case 1:
                cartItems = _b.sent();
                totalAmount_1 = 0;
                cartItems === null || cartItems === void 0 ? void 0 : cartItems.forEach(function (item) {
                    var _a;
                    if (item.vendorProduct) {
                        totalAmount_1 += (_a = item.vendorProduct) === null || _a === void 0 ? void 0 : _a.price;
                    }
                });
                return [4 /*yield*/, order_model_1.createOrder({
                        userId: userId,
                        deliveryAddress: shippingAddress,
                        vendorId: vendorId,
                        deliveryInstructions: deliveryInstructions,
                        totalAmount: totalAmount_1
                    })];
            case 2:
                order = _b.sent();
                // Update many for cartItems, pass orderId to the object.
                return [4 /*yield*/, cartItem_model_1.updateCartItemsWithOrderId(cartId, order === null || order === void 0 ? void 0 : order.id)];
            case 3:
                // Update many for cartItems, pass orderId to the object.
                _b.sent();
                return [4 /*yield*/, order_model_1.getOrderById(order.id)];
            case 4:
                finalOrder = _b.sent();
                res.status(201).json(finalOrder);
                return [3 /*break*/, 6];
            case 5:
                error_1 = _b.sent();
                // Handle specific errors (e.g., from the service layer)
                if (error_1.message === 'Cart not found') {
                    return [2 /*return*/, res.status(400).json({ error: error_1.message })];
                }
                res.status(500).json({ error: 'Failed to create order: ' + error_1.message });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
/**
 * Controller for getting an order by ID.
 * GET /orders/:id
 */
exports.getOrderByIdController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var orderId, order, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                orderId = req.params.id;
                return [4 /*yield*/, order_service_1.getOrderByIdService(orderId)];
            case 1:
                order = _a.sent();
                if (!order) {
                    return [2 /*return*/, res.status(404).json({ error: 'Order not found' })];
                }
                res.status(200).json(order);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                res.status(500).json({ error: 'Failed to retrieve order: ' + error_2.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Controller for getting all orders for a user.
 * GET /orders/user/:userId
 */
exports.getOrdersByUserController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, orders, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                if (!userId) {
                    return [2 /*return*/, res.status(400).json({ error: 'User ID is required.' })];
                }
                return [4 /*yield*/, order_service_1.getOrdersByUserIdService(userId)];
            case 1:
                orders = _a.sent();
                res.status(200).json(orders);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                res.status(500).json({ error: 'Failed to retrieve orders: ' + error_3.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Controller for updating the status of an order.
 * PATCH /orders/:id/status
 */
exports.updateOrderStatusController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var orderId, status, updatedOrder, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                orderId = req.params.id;
                status = req.body.status;
                return [4 /*yield*/, order_service_1.updateOrderStatusService(orderId, status)];
            case 1:
                updatedOrder = _a.sent();
                res.status(200).json(updatedOrder);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                if (error_4.message === 'Order not found') {
                    return [2 /*return*/, res.status(404).json({ error: error_4.message })];
                }
                res.status(500).json({ error: 'Failed to update order status: ' + error_4.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Controller for cancelling an order.
 * PATCH /orders/:id/cancel
 */
exports.cancelOrderController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var orderId, cancelledOrder, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                orderId = req.params.id;
                return [4 /*yield*/, order_service_1.cancelOrderService(orderId)];
            case 1:
                cancelledOrder = _a.sent();
                res.status(200).json(cancelledOrder);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                if (error_5.message === 'Order not found') {
                    return [2 /*return*/, res.status(404).json({ error: error_5.message })];
                }
                res.status(500).json({ error: 'Failed to cancel order: ' + error_5.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Controller for updating an order.
 * PATCH /orders/:id
 */
exports.updateOrderController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var orderId, updates, updatedOrder, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                orderId = req.params.id;
                updates = req.body;
                return [4 /*yield*/, order_service_1.updateOrderService(orderId, updates)];
            case 1:
                updatedOrder = _a.sent();
                res.status(200).json(updatedOrder);
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                if (error_6.message === 'Order not found') {
                    return [2 /*return*/, res.status(404).json({ error: error_6.message })];
                }
                res.status(500).json({ error: 'Failed to update order: ' + error_6.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
