"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.startShoppingController = exports.declineOrderController = exports.acceptOrderController = exports.getVendorOrdersController = exports.updateOrderController = exports.updateOrderStatusController = exports.getOrdersByUserController = exports.getOrderByIdController = exports.createOrderController = void 0;
var order_service_1 = require("../services/order.service"); // Adjust the path if needed
var cartItem_model_1 = require("../models/cartItem.model");
var order_model_1 = require("../models/order.model");
var client_1 = require("@prisma/client");
var dayjs_1 = require("dayjs");
var utc_1 = require("dayjs/plugin/utc");
var timezone_1 = require("dayjs/plugin/timezone");
var vendor_service_1 = require("../services/vendor.service");
var deliveryAddress_service_1 = require("../services/deliveryAddress.service");
var fee_service_1 = require("../services/fee.service");
// Extend dayjs with plugins
dayjs_1["default"].extend(utc_1["default"]);
dayjs_1["default"].extend(timezone_1["default"]);
// --- Helper function to map Dayjs day index to Prisma's Days enum ---
// Assuming your Days enum is like: enum Days { SUNDAY, MONDAY, TUESDAY, ... }
var getDayEnumFromDayjs = function (dayjsDayIndex) {
    var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayjsDayIndex];
};
exports.createOrderController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, vendorId, paymentMethod, shippingAddressId, newShippingAddress, deliveryInstructions, orderItems, shoppingMethod, deliveryMethod, scheduledShoppingStartTime, parsedScheduledTime, vendor, vendorLocalDayjs, dayOfWeek_1, openingHoursToday, _b, openHours, openMinutes, _c, closeHours, closeMinutes, vendorOpenTimeUTC, vendorCloseTimeUTC, twoHoursBeforeCloseUTC, finalShippingAddressId, payloadForNewAddress, createdAddress, orderItemsForFeeCalculation, fees, subtotal, shoppingFee, deliveryFee, serviceFee, totalEstimatedCost, order_1, orderItemsToCreate, finalOrder, error_1;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 10, , 11]);
                userId = req.userId;
                _a = req.body, vendorId = _a.vendorId, paymentMethod = _a.paymentMethod, shippingAddressId = _a.shippingAddressId, newShippingAddress = _a.newShippingAddress, deliveryInstructions = _a.deliveryInstructions, orderItems = _a.orderItems, shoppingMethod = _a.shoppingMethod, deliveryMethod = _a.deliveryMethod, scheduledShoppingStartTime = _a.scheduledShoppingStartTime;
                if (!scheduledShoppingStartTime) return [3 /*break*/, 2];
                parsedScheduledTime = dayjs_1["default"].utc(scheduledShoppingStartTime);
                if (!parsedScheduledTime.isValid()) {
                    return [2 /*return*/, res.status(400).json({ error: 'Invalid scheduled shopping start time format.' })];
                }
                return [4 /*yield*/, vendor_service_1.getVendorById(vendorId)];
            case 1:
                vendor = _d.sent();
                if (!vendor) {
                    return [2 /*return*/, res.status(404).json({ error: 'Vendor not found.' })];
                }
                if (!vendor.timezone) {
                    console.warn("Vendor " + vendorId + " does not have a timezone set. Skipping time validation.");
                }
                vendorLocalDayjs = parsedScheduledTime.tz(vendor.timezone || 'UTC');
                dayOfWeek_1 = getDayEnumFromDayjs(vendorLocalDayjs.day());
                openingHoursToday = vendor.openingHours.find(function (h) { return h.day === dayOfWeek_1; });
                if (!openingHoursToday || !openingHoursToday.open || !openingHoursToday.close) {
                    return [2 /*return*/, res.status(400).json({
                            error: "Vendor is closed or has no defined hours for " + dayOfWeek_1 + "."
                        })];
                }
                _b = openingHoursToday.open.split(':').map(Number), openHours = _b[0], openMinutes = _b[1];
                _c = openingHoursToday.close.split(':').map(Number), closeHours = _c[0], closeMinutes = _c[1];
                vendorOpenTimeUTC = vendorLocalDayjs.hour(openHours).minute(openMinutes).second(0).millisecond(0).utc();
                vendorCloseTimeUTC = vendorLocalDayjs.hour(closeHours).minute(closeMinutes).second(0).millisecond(0).utc();
                if (vendorCloseTimeUTC.isBefore(vendorOpenTimeUTC)) {
                    vendorCloseTimeUTC = vendorCloseTimeUTC.add(1, 'day');
                }
                twoHoursBeforeCloseUTC = vendorCloseTimeUTC.subtract(2, 'hour');
                if (parsedScheduledTime.isBefore(vendorOpenTimeUTC) || parsedScheduledTime.isAfter(twoHoursBeforeCloseUTC)) {
                    return [2 /*return*/, res.status(400).json({
                            error: "Scheduled shopping time must be between " + openingHoursToday.open + " and " + twoHoursBeforeCloseUTC.tz(vendor.timezone || 'UTC').format('HH:mm') + " vendor local time."
                        })];
                }
                if (parsedScheduledTime.isBefore(dayjs_1["default"].utc())) {
                    return [2 /*return*/, res.status(400).json({ error: 'Scheduled shopping time cannot be in the past.' })];
                }
                _d.label = 2;
            case 2:
                finalShippingAddressId = shippingAddressId;
                if (!(!shippingAddressId && newShippingAddress)) return [3 /*break*/, 4];
                if (!newShippingAddress.addressLine1 || !newShippingAddress.city) {
                    return [2 /*return*/, res.status(400).json({ error: 'New shipping address requires addressLine1 and city.' })];
                }
                payloadForNewAddress = __assign(__assign({}, newShippingAddress), { userId: userId });
                return [4 /*yield*/, deliveryAddress_service_1.createDeliveryAddressService(payloadForNewAddress)];
            case 3:
                createdAddress = _d.sent();
                finalShippingAddressId = createdAddress.id;
                return [3 /*break*/, 5];
            case 4:
                if (!shippingAddressId && deliveryMethod === client_1.DeliveryMethod.delivery_person) {
                    // If deliveryMethod is DELIVERY_PERSON, shippingAddressId is mandatory
                    return [2 /*return*/, res.status(400).json({ error: 'Delivery address is required for delivery orders.' })];
                }
                _d.label = 5;
            case 5:
                orderItemsForFeeCalculation = orderItems.map(function (item) { return ({
                    vendorProductId: item.vendorProductId,
                    quantity: item.quantity
                }); });
                // --- Calculate Fees ---
                if (!finalShippingAddressId && deliveryMethod === client_1.DeliveryMethod.delivery_person) {
                    // This should ideally be caught by the earlier address validation, but good to double check
                    return [2 /*return*/, res.status(400).json({ error: 'Cannot calculate delivery fee without a valid delivery address.' })];
                }
                return [4 /*yield*/, fee_service_1.calculateOrderFeesService({
                        orderItems: orderItemsForFeeCalculation,
                        vendorId: vendorId,
                        deliveryAddressId: finalShippingAddressId
                    })];
            case 6:
                fees = _d.sent();
                subtotal = fees.subtotal, shoppingFee = fees.shoppingFee, deliveryFee = fees.deliveryFee, serviceFee = fees.serviceFee, totalEstimatedCost = fees.totalEstimatedCost;
                return [4 /*yield*/, order_model_1.createOrder({
                        userId: userId,
                        vendorId: vendorId,
                        totalAmount: totalEstimatedCost,
                        deliveryFee: deliveryFee,
                        serviceFee: serviceFee,
                        shoppingFee: shoppingFee,
                        paymentMethod: paymentMethod,
                        shoppingMethod: shoppingMethod,
                        deliveryMethod: deliveryMethod,
                        scheduledShoppingStartTime: scheduledShoppingStartTime,
                        deliveryAddressId: finalShippingAddressId,
                        deliveryInstructions: deliveryInstructions
                    })];
            case 7:
                order_1 = _d.sent();
                orderItemsToCreate = orderItems.map(function (item) { return ({
                    vendorProductId: item.vendorProductId,
                    quantity: item.quantity,
                    orderId: order_1.id
                }); });
                return [4 /*yield*/, cartItem_model_1.createManyCartItems(orderItemsToCreate)];
            case 8:
                _d.sent(); // This function will create CartItems linked to the Order
                return [4 /*yield*/, order_model_1.getOrderById(order_1.id)];
            case 9:
                finalOrder = _d.sent();
                res.status(201).json(finalOrder);
                return [3 /*break*/, 11];
            case 10:
                error_1 = _d.sent();
                console.error('Error creating order:', error_1);
                // Provide a more generic error message if the specific error is not for the client
                res.status(500).json({ error: error_1.message || 'Internal server error during order creation.' });
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
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
 * Controller for updating an order.
 * PATCH /orders/:id
 */
exports.updateOrderController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var orderId, updates, updatedOrder, error_5;
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
                error_5 = _a.sent();
                if (error_5.message === 'Order not found') {
                    return [2 /*return*/, res.status(404).json({ error: error_5.message })];
                }
                res.status(500).json({ error: 'Failed to update order: ' + error_5.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Controller to get a list of orders for a specific vendor's dashboard.
 * Requires vendor staff/admin authentication and authorization.
 * GET /vendor/orders
 * Query params: statuses=pending,accepted,shopping&includeFutureScheduled=true
 */
exports.getVendorOrdersController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var vendorId, status, orders, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                vendorId = req.vendorId;
                status = req.query.status;
                return [4 /*yield*/, order_service_1.getOrdersForVendorDashboard(vendorId, { status: status })];
            case 1:
                orders = _a.sent();
                res.status(200).json(orders);
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Error in getVendorOrdersController:', error_6);
                res.status(500).json({ error: error_6.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Controller to accept a pending order.
 * PATCH /vendor/orders/:orderId/accept
 */
exports.acceptOrderController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var orderId, shoppingHandlerUserId, vendorId, acceptedOrder, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                orderId = req.params.orderId;
                shoppingHandlerUserId = req.userId;
                vendorId = req.vendorId;
                if (!orderId || !shoppingHandlerUserId || !vendorId) {
                    return [2 /*return*/, res.status(400).json({ error: 'Missing required parameters.' })];
                }
                return [4 /*yield*/, order_service_1.acceptOrderService(orderId, shoppingHandlerUserId, vendorId)];
            case 1:
                acceptedOrder = _a.sent();
                res.status(200).json(acceptedOrder);
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                console.error('Error in acceptOrderController:', error_7);
                if (error_7.message.includes('not found') || error_7.message.includes('cannot be accepted')) {
                    return [2 /*return*/, res.status(400).json({ error: error_7.message })];
                }
                res.status(500).json({ error: error_7.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Controller to decline a pending order.
 * PATCH /vendor/orders/:orderId/decline
 */
exports.declineOrderController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var orderId, reason, vendorId, declinedOrder, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                orderId = req.params.orderId;
                reason = req.body.reason;
                vendorId = req.vendorId;
                if (!orderId || !vendorId) {
                    return [2 /*return*/, res.status(400).json({ error: 'Missing required parameters.' })];
                }
                return [4 /*yield*/, order_service_1.declineOrderService(orderId, vendorId, reason)];
            case 1:
                declinedOrder = _a.sent();
                res.status(200).json(declinedOrder);
                return [3 /*break*/, 3];
            case 2:
                error_8 = _a.sent();
                console.error('Error in declineOrderController:', error_8);
                if (error_8.message.includes('not found') || error_8.message.includes('cannot be declined')) {
                    return [2 /*return*/, res.status(400).json({ error: error_8.message })];
                }
                res.status(500).json({ error: error_8.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Controller to mark an accepted order as 'shopping'.
 * PATCH /vendor/orders/:orderId/start-shopping
 */
exports.startShoppingController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var orderId, shoppingHandlerUserId, vendorId, updatedOrder, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                orderId = req.params.orderId;
                shoppingHandlerUserId = req.userId;
                vendorId = req.vendorId;
                if (!orderId || !shoppingHandlerUserId || !vendorId) {
                    return [2 /*return*/, res.status(400).json({ error: 'Missing required parameters.' })];
                }
                return [4 /*yield*/, order_service_1.startShoppingService(orderId, shoppingHandlerUserId, vendorId)];
            case 1:
                updatedOrder = _a.sent();
                res.status(200).json(updatedOrder);
                return [3 /*break*/, 3];
            case 2:
                error_9 = _a.sent();
                console.error('Error in startShoppingController:', error_9);
                if (error_9.message.includes('not found') || error_9.message.includes('cannot start shopping')) {
                    return [2 /*return*/, res.status(400).json({ error: error_9.message })];
                }
                res.status(500).json({ error: error_9.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
