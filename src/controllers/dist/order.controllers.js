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
exports.updateOrderController = exports.updateOrderStatusController = exports.getOrdersByUserController = exports.getOrderByIdController = exports.createOrderController = void 0;
var order_service_1 = require("../services/order.service"); // Adjust the path if needed
var cartItem_model_1 = require("../models/cartItem.model");
var order_model_1 = require("../models/order.model");
var product_model_1 = require("../models/product.model");
var fee_service_1 = require("../services/fee.service");
var client_1 = require("@prisma/client");
var dayjs_1 = require("dayjs");
var utc_1 = require("dayjs/plugin/utc");
var timezone_1 = require("dayjs/plugin/timezone");
var vendor_service_1 = require("../services/vendor.service");
var deliveryAddress_service_1 = require("../services/deliveryAddress.service");
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
    var userId, _a, vendorId, paymentMethod, shippingAddressId, newShippingAddress, deliveryInstructions, orderItems, shoppingMethod, deliveryMethod, scheduledShoppingStartTime, parsedScheduledTime, vendor, vendorLocalDayjs, dayOfWeek_1, openingHoursToday, _b, openHours, openMinutes, _c, closeHours, closeMinutes, vendorOpenTimeUTC, vendorCloseTimeUTC, twoHoursBeforeCloseUTC, totalAmount_1, serviceFeeObject, serviceFee, payloadForNewAddress, createdAddress, order_1, updatedOrderItems, finalOrder, error_1;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 11, , 12]);
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
                    // This is a critical point: if vendor doesn't have a timezone, validation is impossible.
                    // You might default to a specific timezone or throw an error.
                    // For robust validation, make timezone mandatory for vendors.
                    console.warn("Vendor " + vendorId + " does not have a timezone set. Skipping time validation.");
                    // return res.status(500).json({ error: 'Vendor timezone not configured. Cannot validate shopping time.' });
                }
                vendorLocalDayjs = parsedScheduledTime.tz(vendor.timezone || 'UTC');
                dayOfWeek_1 = getDayEnumFromDayjs(vendorLocalDayjs.day());
                openingHoursToday = vendor.openingHours.find(function (h) { return h.day === dayOfWeek_1; });
                if (!openingHoursToday || !openingHoursToday.open || !openingHoursToday.close) {
                    console.log(dayOfWeek_1, vendor.openingHours);
                    return [2 /*return*/, res.status(400).json({
                            error: "Vendor is closed or has no defined hours for " + dayOfWeek_1 + "."
                        })];
                }
                _b = openingHoursToday.open.split(':').map(Number), openHours = _b[0], openMinutes = _b[1];
                _c = openingHoursToday.close.split(':').map(Number), closeHours = _c[0], closeMinutes = _c[1];
                vendorOpenTimeUTC = vendorLocalDayjs.hour(openHours).minute(openMinutes).second(0).millisecond(0).utc();
                vendorCloseTimeUTC = vendorLocalDayjs.hour(closeHours).minute(closeMinutes).second(0).millisecond(0).utc();
                // Handle cases where closing time is on the next day (e.g., 22:00 - 02:00)
                // This assumes the `open` and `close` times are relative to the same day.
                // If close is numerically smaller than open, it means it rolls over to the next day.
                if (vendorCloseTimeUTC.isBefore(vendorOpenTimeUTC)) {
                    vendorCloseTimeUTC = vendorCloseTimeUTC.add(1, 'day');
                }
                twoHoursBeforeCloseUTC = vendorCloseTimeUTC.subtract(2, 'hour');
                // Perform the validation check
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
                totalAmount_1 = 0;
                return [4 /*yield*/, Promise.all(orderItems.map(function (item) { return __awaiter(void 0, void 0, void 0, function () {
                        var vendorProduct;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, product_model_1.getVendorProductById(item.vendorProductId)];
                                case 1:
                                    vendorProduct = _a.sent();
                                    if (vendorProduct) {
                                        totalAmount_1 += vendorProduct.price;
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 3:
                _d.sent();
                return [4 /*yield*/, fee_service_1.getCurrentFees(client_1.FeeType.SERVICE)];
            case 4:
                serviceFeeObject = _d.sent();
                serviceFee = 0;
                if (serviceFeeObject && !Array.isArray(serviceFeeObject)) {
                    // Ensure it's a single Fee object and not an array
                    serviceFee = serviceFeeObject.amount;
                }
                if (!(!shippingAddressId && newShippingAddress)) return [3 /*break*/, 6];
                // If no existing address ID is provided, but new address details are, create it
                // Ensure newShippingAddress has userId, and other required fields
                if (!newShippingAddress.addressLine1 || !newShippingAddress.city) {
                    return [2 /*return*/, res.status(400).json({ error: 'New shipping address requires addressLine1 and city.' })];
                }
                payloadForNewAddress = __assign(__assign({}, newShippingAddress), { userId: userId });
                return [4 /*yield*/, deliveryAddress_service_1.createDeliveryAddressService(payloadForNewAddress)];
            case 5:
                createdAddress = _d.sent();
                shippingAddressId = createdAddress.id; // Use the ID of the newly created address
                return [3 /*break*/, 7];
            case 6:
                if (!shippingAddressId) {
                    // If no shippingAddressId and no newShippingAddress, and deliveryMethod requires it
                    // (e.g., DELIVERY_PERSON), then it's an error.
                    // If deliveryMethod is CUSTOMER_PICKUP, then shippingAddressId might be null.
                    if (deliveryMethod === 'DELIVERY_PERSON') { // Adjust based on your DeliveryMethod enum
                        return [2 /*return*/, res.status(400).json({ error: 'Delivery address is required for delivery orders.' })];
                    }
                }
                _d.label = 7;
            case 7: return [4 /*yield*/, order_model_1.createOrder({ userId: userId, vendorId: vendorId, paymentMethod: paymentMethod, deliveryAddressId: shippingAddressId, deliveryInstructions: deliveryInstructions, totalAmount: totalAmount_1, serviceFee: serviceFee, shoppingMethod: shoppingMethod, deliveryMethod: deliveryMethod, scheduledShoppingStartTime: scheduledShoppingStartTime })
                // pass the orderId into each cartItem and bulk create cartItems
            ];
            case 8:
                order_1 = _d.sent();
                updatedOrderItems = orderItems.map(function (item) {
                    return __assign(__assign({}, item), { orderId: order_1.id });
                });
                return [4 /*yield*/, cartItem_model_1.createManyCartItems(updatedOrderItems)];
            case 9:
                _d.sent();
                return [4 /*yield*/, order_model_1.getOrderById(order_1.id)];
            case 10:
                finalOrder = _d.sent();
                res.status(201).json(finalOrder);
                return [3 /*break*/, 12];
            case 11:
                error_1 = _d.sent();
                // Handle specific errors (e.g., from the service layer)
                if (error_1.message === 'Cart not found') {
                    return [2 /*return*/, res.status(400).json({ error: error_1.message })];
                }
                res.status(500).json({ error: 'Failed to create order: ' + error_1.message });
                return [3 /*break*/, 12];
            case 12: return [2 /*return*/];
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
