"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.getOrdersForVendorUserService = exports.respondToReplacementService = exports.updateOrderItemShoppingStatusService = exports.startShoppingService = exports.declineOrderService = exports.acceptOrderService = exports.getOrdersForVendorDashboard = exports.getAvailableDeliverySlots = exports.updateOrderStatusService = exports.updateOrderService = exports.updateOrderTipService = exports.createOrderFromClient = exports.getOrdersByUserIdService = exports.OrderCreationError = exports.getOrderByIdService = exports.createOrderService = void 0;
var orderModel = require("../models/order.model"); // Adjust the path if needed
var vendorModel = require("../models/vendor.model"); // Add this import for vendorModel
var client_1 = require("@prisma/client");
var dayjs_1 = require("dayjs");
var fee_service_1 = require("./fee.service");
var vendor_service_1 = require("./vendor.service");
var utc_1 = require("dayjs/plugin/utc");
var timezone_1 = require("dayjs/plugin/timezone");
var customParseFormat_1 = require("dayjs/plugin/customParseFormat");
var socket_1 = require("../socket");
var rating_service_1 = require("./rating.service");
var notificationService = require("./notification.service");
dayjs_1["default"].extend(utc_1["default"]);
dayjs_1["default"].extend(timezone_1["default"]);
dayjs_1["default"].extend(customParseFormat_1["default"]);
var prisma = new client_1.PrismaClient();
var toRadians = function (degrees) {
    return degrees * (Math.PI / 180);
};
var calculateDistance = function (lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the Earth in km
    var dLat = toRadians(lat2 - lat1);
    var dLon = toRadians(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};
// --- Order Service Functions ---
/**
 * Creates a new order.
 * @param userId - The ID of the user placing the order.
 * @param cartId - The ID of the cart to create the order from.
 * @param shippingAddress - The shipping address for the order.
 * @returns The newly created order.
 */
exports.createOrderService = function (payload) { return __awaiter(void 0, void 0, Promise, function () {
    var order;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, orderModel.createOrder(payload)];
            case 1:
                order = _a.sent();
                return [2 /*return*/, order];
        }
    });
}); };
/**
 * Retrieves an order by its ID.
 * @param id - The ID of the order to retrieve.
 * @returns The order, or null if not found.
 */
exports.getOrderByIdService = function (id) { return __awaiter(void 0, void 0, Promise, function () {
    var order, rating, distance, calculatedDistance, orderWithExtras;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, orderModel.getOrderById(id)];
            case 1:
                order = _a.sent();
                if (!order || !order.vendor) {
                    return [2 /*return*/, null];
                }
                return [4 /*yield*/, rating_service_1.getAggregateRatingService({ ratedVendorId: order.vendorId })];
            case 2:
                rating = _a.sent();
                if (order.deliveryAddress && order.deliveryAddress.latitude && order.deliveryAddress.longitude && order.vendor.latitude && order.vendor.longitude) {
                    if (!isNaN(order.deliveryAddress.latitude) && !isNaN(order.deliveryAddress.longitude)) {
                        calculatedDistance = calculateDistance(order.deliveryAddress.latitude, order.deliveryAddress.longitude, order.vendor.latitude, order.vendor.longitude);
                        distance = parseFloat(calculatedDistance.toFixed(2));
                    }
                }
                orderWithExtras = __assign(__assign({}, order), { vendor: __assign(__assign({}, order.vendor), { rating: rating || { average: 0, count: 0 }, distance: distance }) });
                return [2 /*return*/, orderWithExtras];
        }
    });
}); };
var OrderCreationError = /** @class */ (function (_super) {
    __extends(OrderCreationError, _super);
    function OrderCreationError(message, statusCode) {
        if (statusCode === void 0) { statusCode = 400; }
        var _this = _super.call(this, message) || this;
        _this.name = 'OrderCreationError';
        _this.statusCode = statusCode;
        return _this;
    }
    return OrderCreationError;
}(Error));
exports.OrderCreationError = OrderCreationError;
var generateUniqueOrderCode = function (tx) { return __awaiter(void 0, void 0, Promise, function () {
    var orderCode, isUnique, chars, i, existingOrder;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                isUnique = false;
                chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                _a.label = 1;
            case 1:
                if (!!isUnique) return [3 /*break*/, 3];
                orderCode = '';
                for (i = 0; i < 6; i++) {
                    orderCode += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                return [4 /*yield*/, tx.order.findUnique({
                        where: { orderCode: orderCode }
                    })];
            case 2:
                existingOrder = _a.sent();
                if (!existingOrder) {
                    isUnique = true;
                }
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/, orderCode];
        }
    });
}); };
/**
 * Retrieves all orders for a specific user.
 * @param userId - The ID of the user whose orders are to be retrieved.
 * @returns An array of orders for the user.
 */
exports.getOrdersByUserIdService = function (userId) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, orderModel.getOrdersByUserId(userId)];
    });
}); };
var getDayEnumFromDayjs = function (dayjsDayIndex) {
    var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayjsDayIndex];
};
exports.createOrderFromClient = function (userId, payload) { return __awaiter(void 0, void 0, void 0, function () {
    var vendorId, paymentMethod, shippingAddressId, deliveryInstructions, orderItems, shoppingMethod, deliveryMethod, scheduledDeliveryTime, shopperTip, deliveryPersonTip, shoppingStartTime, parsedScheduledDeliveryTime, vendor, deliveryLocalDayjs, dayOfWeek_1, openingHoursToday, _a, openHours, openMinutes, _b, closeHours, closeMinutes, vendorOpenTimeUTC, vendorCloseTimeUTC, lastDeliveryTimeUTC;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                vendorId = payload.vendorId, paymentMethod = payload.paymentMethod, shippingAddressId = payload.shippingAddressId, deliveryInstructions = payload.deliveryInstructions, orderItems = payload.orderItems, shoppingMethod = payload.shoppingMethod, deliveryMethod = payload.deliveryMethod, scheduledDeliveryTime = payload.scheduledDeliveryTime, shopperTip = payload.shopperTip, deliveryPersonTip = payload.deliveryPersonTip;
                if (!scheduledDeliveryTime) return [3 /*break*/, 2];
                parsedScheduledDeliveryTime = dayjs_1["default"].utc(scheduledDeliveryTime);
                if (!parsedScheduledDeliveryTime.isValid()) {
                    throw new OrderCreationError('Invalid scheduled delivery time format.');
                }
                // Calculate scheduledShoppingStartTime based on delivery time and method
                if (deliveryMethod === client_1.DeliveryMethod.delivery_person) {
                    shoppingStartTime = parsedScheduledDeliveryTime.subtract(2, 'hour').toDate();
                }
                else if (deliveryMethod === client_1.DeliveryMethod.customer_pickup) {
                    shoppingStartTime = parsedScheduledDeliveryTime.subtract(1, 'hour').toDate();
                }
                return [4 /*yield*/, vendor_service_1.getVendorById(vendorId)];
            case 1:
                vendor = _c.sent();
                if (!vendor)
                    throw new OrderCreationError('Vendor not found.', 404);
                if (!vendor.timezone)
                    console.warn("Vendor " + vendorId + " does not have a timezone set. Skipping time validation.");
                deliveryLocalDayjs = parsedScheduledDeliveryTime.tz(vendor.timezone || 'UTC');
                dayOfWeek_1 = getDayEnumFromDayjs(deliveryLocalDayjs.day());
                openingHoursToday = vendor.openingHours.find(function (h) { return h.day === dayOfWeek_1; });
                if (!openingHoursToday || !openingHoursToday.open || !openingHoursToday.close) {
                    throw new OrderCreationError("Vendor is closed or has no defined hours for " + dayOfWeek_1 + ".");
                }
                _a = openingHoursToday.open.split(':').map(Number), openHours = _a[0], openMinutes = _a[1];
                _b = openingHoursToday.close.split(':').map(Number), closeHours = _b[0], closeMinutes = _b[1];
                vendorOpenTimeUTC = deliveryLocalDayjs.hour(openHours).minute(openMinutes).second(0).millisecond(0).utc();
                vendorCloseTimeUTC = deliveryLocalDayjs.hour(closeHours).minute(closeMinutes).second(0).millisecond(0).utc();
                if (vendorCloseTimeUTC.isBefore(vendorOpenTimeUTC)) {
                    vendorCloseTimeUTC = vendorCloseTimeUTC.add(1, 'day');
                }
                lastDeliveryTimeUTC = vendorCloseTimeUTC.subtract(30, 'minutes');
                _c.label = 2;
            case 2: 
            // --- Transactional Block ---
            return [2 /*return*/, prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                    var fees, subtotal, deliveryFee, serviceFee, shoppingFee, finalTotalAmount, orderCode, newOrder, _i, orderItems_1, item, finalOrder;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, fee_service_1.calculateOrderFeesService({
                                    orderItems: orderItems,
                                    vendorId: vendorId,
                                    deliveryAddressId: shippingAddressId
                                }, tx)];
                            case 1:
                                fees = _a.sent();
                                subtotal = fees.subtotal, deliveryFee = fees.deliveryFee, serviceFee = fees.serviceFee, shoppingFee = fees.shoppingFee;
                                finalTotalAmount = subtotal +
                                    (deliveryFee || 0) +
                                    (serviceFee || 0) +
                                    (shoppingFee || 0) +
                                    (shopperTip || 0) +
                                    (deliveryPersonTip || 0);
                                return [4 /*yield*/, generateUniqueOrderCode(tx)];
                            case 2:
                                orderCode = _a.sent();
                                return [4 /*yield*/, orderModel.createOrder({
                                        userId: userId,
                                        vendorId: vendorId,
                                        orderCode: orderCode,
                                        subtotal: subtotal,
                                        totalAmount: finalTotalAmount,
                                        deliveryFee: deliveryFee, serviceFee: serviceFee, shoppingFee: shoppingFee,
                                        shopperTip: shopperTip, deliveryPersonTip: deliveryPersonTip,
                                        paymentMethod: paymentMethod, shoppingMethod: shoppingMethod, deliveryMethod: deliveryMethod, scheduledDeliveryTime: scheduledDeliveryTime,
                                        shoppingStartTime: shoppingStartTime,
                                        deliveryAddressId: shippingAddressId,
                                        deliveryInstructions: deliveryInstructions
                                    }, tx)];
                            case 3:
                                newOrder = _a.sent();
                                _i = 0, orderItems_1 = orderItems;
                                _a.label = 4;
                            case 4:
                                if (!(_i < orderItems_1.length)) return [3 /*break*/, 7];
                                item = orderItems_1[_i];
                                if (item.quantity <= 0) {
                                    throw new OrderCreationError("Quantity for product " + item.vendorProductId + " must be positive.");
                                }
                                return [4 /*yield*/, tx.orderItem.create({
                                        data: {
                                            orderId: newOrder.id,
                                            vendorProductId: item.vendorProductId,
                                            quantity: item.quantity,
                                            instructions: item.instructions,
                                            replacements: item.replacementIds
                                                ? {
                                                    connect: item.replacementIds.map(function (id) { return ({ id: id }); })
                                                }
                                                : undefined
                                        }
                                    })];
                            case 5:
                                _a.sent();
                                _a.label = 6;
                            case 6:
                                _i++;
                                return [3 /*break*/, 4];
                            case 7: return [4 /*yield*/, orderModel.getOrderById(newOrder.id, tx)];
                            case 8:
                                finalOrder = _a.sent();
                                if (!finalOrder) {
                                    throw new OrderCreationError("Failed to retrieve the created order.", 500);
                                }
                                // --- Add Notification Logic Here ---
                                // --- Add Notification Logic Here ---
                                return [4 /*yield*/, notificationService.createNotification({
                                        userId: finalOrder.vendor.userId,
                                        type: 'NEW_ORDER_PLACED',
                                        title: 'New Order Received!',
                                        body: "You have a new order #" + finalOrder.orderCode + " from " + finalOrder.user.name + ".",
                                        meta: { orderId: finalOrder.id }
                                    })];
                            case 9:
                                // --- Add Notification Logic Here ---
                                // --- Add Notification Logic Here ---
                                _a.sent();
                                // I will remove it later
                                return [4 /*yield*/, notificationService.createNotification({
                                        userId: finalOrder.userId,
                                        type: 'ORDER_PLACED_CUSTOMER',
                                        title: 'Order Placed Successfully!',
                                        body: "Your order #" + finalOrder.orderCode + " has been placed.",
                                        meta: { orderId: finalOrder.id }
                                    })];
                            case 10:
                                // I will remove it later
                                _a.sent();
                                // --- End Notification Logic ---
                                // --- End Notification Logic ---
                                return [2 /*return*/, finalOrder];
                        }
                    });
                }); })];
        }
    });
}); };
/**
 * Allows a customer to add or update a tip for an order.
 * Recalculates the order's total amount.
 *
 * @param orderId The ID of the order to update.
 * @param userId The ID of the customer making the request (for authorization).
 * @param payload An object containing `shopperTip` and/or `deliveryPersonTip`.
 * @returns The updated order object.
 * @throws OrderCreationError if the order is not found, user is not authorized, or tips are invalid.
 */
exports.updateOrderTipService = function (orderId, userId, payload) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                var existingOrder, oldShopperTip, oldDeliveryPersonTip, newShopperTip, newDeliveryPersonTip, tipDifference;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, tx.order.findUnique({
                                where: { id: orderId }
                            })];
                        case 1:
                            existingOrder = _c.sent();
                            if (!existingOrder) {
                                throw new OrderCreationError('Order not found.', 404);
                            }
                            // 2. Authorize: Ensure the user owns the order
                            if (existingOrder.userId !== userId) {
                                throw new OrderCreationError('You are not authorized to update this order.', 403);
                            }
                            // 3. Validate tip amounts
                            if (payload.shopperTip !== undefined && payload.shopperTip < 0) {
                                throw new OrderCreationError('Shopper tip cannot be negative.');
                            }
                            if (payload.deliveryPersonTip !== undefined && payload.deliveryPersonTip < 0) {
                                throw new OrderCreationError('Delivery person tip cannot be negative.');
                            }
                            oldShopperTip = existingOrder.shopperTip || 0;
                            oldDeliveryPersonTip = existingOrder.deliveryPersonTip || 0;
                            newShopperTip = (_a = payload.shopperTip) !== null && _a !== void 0 ? _a : oldShopperTip;
                            newDeliveryPersonTip = (_b = payload.deliveryPersonTip) !== null && _b !== void 0 ? _b : oldDeliveryPersonTip;
                            tipDifference = newShopperTip - oldShopperTip + (newDeliveryPersonTip - oldDeliveryPersonTip);
                            // 5. Update the order with new tips and recalculated total amount
                            // NOTE: A full implementation would also handle payment adjustments here (e.g., capture more funds).
                            return [2 /*return*/, tx.order.update({
                                    where: { id: orderId },
                                    data: {
                                        shopperTip: newShopperTip,
                                        deliveryPersonTip: newDeliveryPersonTip,
                                        totalAmount: {
                                            increment: tipDifference
                                        }
                                    }
                                })];
                    }
                });
            }); })];
    });
}); };
/**
 * Service function to update an existing order.
 *
 * @param orderId The ID of the order to update.
 * @param updates An object containing the fields to update and their new values.
 * The keys of this object should match the Order model fields.
 * @returns The updated order object.
 * @throws Error if the order is not found or if the update fails.
 */
exports.updateOrderService = function (orderId, updates) { return __awaiter(void 0, void 0, Promise, function () {
    var existingOrder, updatedOrder, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, orderModel.getOrderById(orderId)];
            case 1:
                existingOrder = _a.sent();
                if (!existingOrder) {
                    throw new Error('Order not found');
                }
                return [4 /*yield*/, orderModel.updateOrder(orderId, updates)];
            case 2:
                updatedOrder = _a.sent();
                return [2 /*return*/, updatedOrder];
            case 3:
                error_1 = _a.sent();
                // 3. Handle errors
                console.error('Error updating order:', error_1);
                throw new Error("Failed to update order: " + error_1.message);
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * Updates the status of an order.  Added this as a common use case.
 * @param id - The ID of the order to update.
 * @param status - The new status of the order.
 * @returns The updated order.
 */
exports.updateOrderStatusService = function (id, status) { return __awaiter(void 0, void 0, Promise, function () {
    var updates, orderDetails, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                updates = { orderStatus: status };
                // If order is delivered, handle payments to wallets
                if (status === client_1.OrderStatus.delivered) {
                    updates.actualDeliveryTime = new Date();
                    return [2 /*return*/, prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                            var order, vendorAmount;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, tx.order.findUnique({
                                            where: { id: id },
                                            include: { vendor: true }
                                        })];
                                    case 1:
                                        order = _a.sent();
                                        if (!order) {
                                            throw new OrderCreationError('Order not found', 404);
                                        }
                                        vendorAmount = order.subtotal;
                                        if (!(vendorAmount > 0 && order.vendor.userId)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, tx.wallet.update({
                                                where: { userId: order.vendor.userId },
                                                data: { balance: { increment: vendorAmount } }
                                            })];
                                    case 2:
                                        _a.sent();
                                        return [4 /*yield*/, tx.transaction.create({
                                                data: {
                                                    userId: order.vendor.userId,
                                                    amount: vendorAmount,
                                                    type: client_1.TransactionType.VENDOR_PAYOUT,
                                                    source: client_1.TransactionSource.SYSTEM,
                                                    status: 'COMPLETED',
                                                    description: "Payment for order #" + order.id.substring(0, 8),
                                                    orderId: order.id
                                                }
                                            })];
                                    case 3:
                                        _a.sent();
                                        _a.label = 4;
                                    case 4:
                                        if (!(order.shopperId && order.shopperTip && order.shopperTip > 0)) return [3 /*break*/, 7];
                                        return [4 /*yield*/, tx.wallet.update({
                                                where: { userId: order.shopperId },
                                                data: { balance: { increment: order.shopperTip } }
                                            })];
                                    case 5:
                                        _a.sent();
                                        return [4 /*yield*/, tx.transaction.create({
                                                data: {
                                                    userId: order.shopperId,
                                                    amount: order.shopperTip,
                                                    type: client_1.TransactionType.TIP_PAYOUT,
                                                    source: client_1.TransactionSource.SYSTEM,
                                                    status: 'COMPLETED',
                                                    description: "Tip for order #" + order.id.substring(0, 8),
                                                    orderId: order.id
                                                }
                                            })];
                                    case 6:
                                        _a.sent();
                                        _a.label = 7;
                                    case 7:
                                        if (!(order.deliveryPersonId && order.deliveryPersonTip && order.deliveryPersonTip > 0)) return [3 /*break*/, 10];
                                        return [4 /*yield*/, tx.wallet.update({
                                                where: { userId: order.deliveryPersonId },
                                                data: { balance: { increment: order.deliveryPersonTip } }
                                            })];
                                    case 8:
                                        _a.sent();
                                        return [4 /*yield*/, tx.transaction.create({
                                                data: {
                                                    userId: order.deliveryPersonId,
                                                    amount: order.deliveryPersonTip,
                                                    type: client_1.TransactionType.TIP_PAYOUT,
                                                    source: client_1.TransactionSource.SYSTEM,
                                                    status: 'COMPLETED',
                                                    description: "Tip for order #" + order.id.substring(0, 8),
                                                    orderId: order.id
                                                }
                                            })];
                                    case 9:
                                        _a.sent();
                                        _a.label = 10;
                                    case 10: 
                                    // 4. Update the order status
                                    return [2 /*return*/, orderModel.updateOrder(id, updates, tx)];
                                }
                            });
                        }); })];
                }
                return [4 /*yield*/, orderModel.getOrderById(id)];
            case 1:
                orderDetails = _b.sent();
                if (!orderDetails) return [3 /*break*/, 6];
                _a = status;
                switch (_a) {
                    case 'ready_for_pickup': return [3 /*break*/, 2];
                    case 'en_route': return [3 /*break*/, 4];
                }
                return [3 /*break*/, 6];
            case 2: return [4 /*yield*/, notificationService.createNotification({
                    userId: orderDetails.userId,
                    type: 'ORDER_READY_FOR_PICKUP',
                    title: 'Your order is ready for pickup!',
                    body: "Order #" + orderDetails.orderCode + " is now ready for pickup at " + orderDetails.vendor.name + ".",
                    meta: { orderId: id }
                })];
            case 3:
                _b.sent();
                return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, notificationService.createNotification({
                    userId: orderDetails.userId,
                    type: 'EN_ROUTE',
                    title: 'Your order is on the way!',
                    body: "Your delivery person is en route with order #" + orderDetails.orderCode + ".",
                    meta: { orderId: id }
                })];
            case 5:
                _b.sent();
                return [3 /*break*/, 6];
            case 6: 
            // --- End Notification Logic ---
            return [2 /*return*/, orderModel.updateOrder(id, updates, prisma)];
        }
    });
}); };
/**
 * Generates available delivery time slots for a vendor for the next 7 days.
 *
 * This considers the vendor's opening hours, a preparation buffer, and different
 * cut-off times based on the delivery method.
 *
 * @param vendorId The ID of the vendor.
 * @param deliveryMethod The method of delivery ('delivery_person' or 'customer_pickup').
 * @returns A promise that resolves to an array of available dates, each with a list of time slots.
 */
exports.getAvailableDeliverySlots = function (vendorId, deliveryMethod) { return __awaiter(void 0, void 0, Promise, function () {
    var vendor, vendorTimezone, availableSlotsByDay, nowInVendorTimezone, _loop_1, i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, vendor_service_1.getVendorById(vendorId)];
            case 1:
                vendor = _a.sent();
                if (!vendor || !vendor.openingHours || vendor.openingHours.length === 0) {
                    throw new OrderCreationError('Vendor not found or has no opening hours defined.', 404);
                }
                vendorTimezone = vendor.timezone || 'UTC';
                availableSlotsByDay = [];
                nowInVendorTimezone = dayjs_1["default"]().tz(vendorTimezone);
                _loop_1 = function (i) {
                    var currentDay = nowInVendorTimezone.add(i, 'day');
                    var dayOfWeek = getDayEnumFromDayjs(currentDay.day());
                    var openingHoursToday = vendor.openingHours.find(function (h) { return h.day === dayOfWeek; });
                    // Skip day if store is closed
                    if (!openingHoursToday || !openingHoursToday.open || !openingHoursToday.close) {
                        return "continue";
                    }
                    var _a = openingHoursToday.open.split(':').map(Number), openHour = _a[0], openMinute = _a[1];
                    var _b = openingHoursToday.close.split(':').map(Number), closeHour = _b[0], closeMinute = _b[1];
                    var openTime = currentDay.hour(openHour).minute(openMinute).second(0);
                    var closeTime = currentDay.hour(closeHour).minute(closeMinute).second(0);
                    var earliestSlotStartTime = void 0;
                    var latestSlotEndTime = void 0;
                    if (deliveryMethod === client_1.DeliveryMethod.customer_pickup) {
                        // For pickup, the earliest time is 1 hour from now.
                        earliestSlotStartTime = nowInVendorTimezone.add(1, 'hour');
                        // The latest time a customer can choose is 1 hour before the store closes.
                        latestSlotEndTime = closeTime.subtract(1, 'hour');
                    }
                    else { // delivery_person
                        // For delivery, the earliest time is 1.5 hours from now.
                        earliestSlotStartTime = nowInVendorTimezone.add(90, 'minutes');
                        // The latest time is the store's closing time.
                        latestSlotEndTime = closeTime;
                        // TODO: The latest delivery time should be adjusted based on the distance
                        // between the store and the customer's address to ensure the delivery
                        // person can complete the delivery before the store closes.
                    }
                    // For future days, the earliest slot can start right when the store opens.
                    // For today, it must be after the calculated `earliestSlotStartTime`.
                    var firstAvailableTime = openTime;
                    if (i === 0 && earliestSlotStartTime.isAfter(openTime)) {
                        firstAvailableTime = earliestSlotStartTime;
                    }
                    // Align to the start of the next hour for clean slots.
                    var firstSlotStart = firstAvailableTime;
                    if (firstSlotStart.minute() > 0 || firstSlotStart.second() > 0 || firstSlotStart.millisecond() > 0) {
                        firstSlotStart = firstSlotStart.add(1, 'hour').startOf('hour');
                    }
                    var timeSlots = [];
                    var currentSlotStart = firstSlotStart;
                    // Generate 1-hour slots until the start of the next slot is past the latest end time.
                    while (currentSlotStart.isBefore(latestSlotEndTime)) {
                        var slotEnd = currentSlotStart.add(1, 'hour');
                        // Ensure the entire slot is within the allowed time.
                        if (slotEnd.isAfter(latestSlotEndTime)) {
                            break;
                        }
                        timeSlots.push((currentSlotStart.format('h:mma') + " - " + slotEnd.format('h:mma')).toLowerCase());
                        currentSlotStart = currentSlotStart.add(1, 'hour');
                    }
                    if (timeSlots.length > 0) {
                        availableSlotsByDay.push({
                            date: currentDay.format('DD-MM-YYYY'),
                            timeSlots: timeSlots
                        });
                    }
                };
                // Generate slots for today and the next 3 days
                for (i = 0; i <= 3; i++) {
                    _loop_1(i);
                }
                return [2 /*return*/, availableSlotsByDay];
        }
    });
}); };
/**
 * Retrieves orders relevant for a vendor dashboard.
 * Filters by vendor ID, shopping method, and specified statuses.
 * Includes optional filtering by scheduled shopping start time.
 *
 * @param vendorId The ID of the vendor.
 * @param options Filtering options (e.g., statuses, includeFutureScheduled).
 * @returns An array of Order objects with necessary relations.
 */
exports.getOrdersForVendorDashboard = function (vendorId, options) { return __awaiter(void 0, void 0, Promise, function () {
    var defaultStatuses, orders, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                defaultStatuses = [
                    client_1.OrderStatus.pending,
                    client_1.OrderStatus.accepted_for_shopping,
                    client_1.OrderStatus.currently_shopping,
                    client_1.OrderStatus.ready_for_delivery,
                    client_1.OrderStatus.ready_for_pickup,
                ];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prisma.order.findMany({
                        where: __assign(__assign({ vendorId: vendorId, shoppingMethod: client_1.ShoppingMethod.vendor }, ((options === null || options === void 0 ? void 0 : options.status) ?
                            { orderStatus: options.status } :
                            { orderStatus: { "in": defaultStatuses } })), { 
                            // Filter by scheduledShoppingStartTime:
                            // Only show orders where shopping is due now or in the past, plus those due in the next 30 minutes.
                            shoppingStartTime: {
                                lte: dayjs_1["default"]().add(30, 'minutes').utc().toDate()
                            } }),
                        include: {
                            user: { select: { id: true, name: true, mobileNumber: true } },
                            orderItems: {
                                include: {
                                    vendorProduct: {
                                        include: { product: true }
                                    }
                                }
                            },
                            deliveryAddress: true,
                            shopper: { select: { id: true, name: true } },
                            deliveryPerson: { select: { id: true, name: true } }
                        },
                        orderBy: {
                            shoppingStartTime: 'asc',
                            createdAt: 'asc'
                        }
                    })];
            case 2:
                orders = _a.sent();
                return [2 /*return*/, orders];
            case 3:
                error_2 = _a.sent();
                console.error('Error fetching vendor dashboard orders:', error_2);
                throw new Error('Failed to retrieve vendor orders.');
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * Accepts a pending order, setting its status to 'accepted' and assigning a shopping handler.
 *
 * @param orderId The ID of the order to accept.
 * @param shoppingHandlerUserId The ID of the user (store_shopper/admin) accepting the order.
 * @param vendorId The ID of the vendor to verify ownership.
 * @returns The updated Order object.
 * @throws Error if order not found, not pending, or does not belong to the vendor.
 */
exports.acceptOrderService = function (orderId, shoppingHandlerUserId, vendorId // Pass vendorId for stricter security check at service layer
) { return __awaiter(void 0, void 0, Promise, function () {
    var acceptedOrder, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, prisma.order.update({
                        where: {
                            id: orderId,
                            vendorId: vendorId,
                            orderStatus: client_1.OrderStatus.pending,
                            shoppingMethod: client_1.ShoppingMethod.vendor,
                            shopperId: null
                        },
                        data: {
                            orderStatus: client_1.OrderStatus.accepted_for_shopping,
                            shopperId: shoppingHandlerUserId
                        }
                    })];
            case 1:
                acceptedOrder = _a.sent();
                // --- Add Notification Logic Here ---
                return [4 /*yield*/, notificationService.createNotification({
                        userId: acceptedOrder.userId,
                        type: 'ORDER_ACCEPTED',
                        title: 'Your order has been accepted!',
                        body: "Your order with code #" + acceptedOrder.orderCode + " has been accepted  and will begin preparing it shortly.",
                        meta: { orderId: acceptedOrder.id }
                    })];
            case 2:
                // --- Add Notification Logic Here ---
                _a.sent();
                // --- End Notification Logic ---
                return [2 /*return*/, acceptedOrder];
            case 3:
                error_3 = _a.sent();
                if (error_3.code === 'P2025') { // Prisma error for record not found
                    // This means the order was not found OR it didn't match the where conditions (e.g., not pending, wrong vendor)
                    throw new Error('Order not found or cannot be accepted in its current state/by this vendor.');
                }
                console.error("Error accepting order " + orderId + ":", error_3);
                throw new Error('Failed to accept order: ' + error_3.message);
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * Declines a pending order.
 *
 * @param orderId The ID of the order to decline.
 * @param vendorId The ID of the vendor to verify ownership.
 * @param reason Optional reason for declining.
 * @returns The updated Order object.
 * @throws Error if order not found, not pending, or does not belong to the vendor.
 */
exports.declineOrderService = function (orderId, vendorId, // Pass vendorId for stricter security check at service layer
reason) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                var orderToDecline, declinedOrder;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, tx.order.findFirst({
                                where: {
                                    id: orderId,
                                    vendorId: vendorId,
                                    orderStatus: client_1.OrderStatus.pending,
                                    shoppingMethod: client_1.ShoppingMethod.vendor
                                },
                                include: {
                                    orderItems: true
                                }
                            })];
                        case 1:
                            orderToDecline = _a.sent();
                            if (!orderToDecline) {
                                throw new OrderCreationError('Order not found or cannot be declined in its current state/by this vendor.', 404);
                            }
                            if (!(orderToDecline.totalAmount > 0)) return [3 /*break*/, 4];
                            return [4 /*yield*/, tx.wallet.update({
                                    where: { userId: orderToDecline.userId },
                                    data: { balance: { increment: orderToDecline.totalAmount } }
                                })];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, tx.transaction.create({
                                    data: {
                                        userId: orderToDecline.userId,
                                        amount: orderToDecline.totalAmount,
                                        type: client_1.TransactionType.REFUND,
                                        source: client_1.TransactionSource.SYSTEM,
                                        description: "Refund for declined order #" + orderId.substring(0, 8),
                                        orderId: orderId
                                    }
                                })];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4: return [4 /*yield*/, tx.order.update({
                                where: { id: orderId },
                                data: {
                                    orderStatus: client_1.OrderStatus.declined_by_vendor,
                                    paymentStatus: client_1.PaymentStatus.refunded,
                                    reasonForDecline: reason
                                }
                            })];
                        case 5:
                            declinedOrder = _a.sent();
                            // --- Replace TODO with Notification Logic Here ---
                            return [4 /*yield*/, notificationService.createNotification({
                                    userId: orderToDecline.userId,
                                    type: 'ORDER_DECLINED',
                                    title: 'Your order has been declined',
                                    body: "Unfortunately, your order #" + orderToDecline.orderCode + " was declined. You have been refunded " + orderToDecline.totalAmount + " in your wallet.",
                                    meta: { orderId: orderToDecline.id }
                                })];
                        case 6:
                            // --- Replace TODO with Notification Logic Here ---
                            _a.sent();
                            // --- End Notification Logic ---
                            return [2 /*return*/, declinedOrder];
                    }
                });
            }); })];
    });
}); };
/**
 * Marks an accepted order as 'shopping', indicating active item picking.
 * Only the assigned shopping handler or vendor admin can start shopping.
 *
 * @param orderId The ID of the order.
 * @param shoppingHandlerUserId The ID of the user starting shopping.
 * @param vendorId The ID of the vendor to verify ownership.
 * @returns The updated Order object.
 * @throws Error if order not found, not accepted, or handler/vendor mismatch.
 */
exports.startShoppingService = function (orderId, shoppingHandlerUserId, vendorId // Pass vendorId for stricter security check at service layer
) { return __awaiter(void 0, void 0, Promise, function () {
    var user, order, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, prisma.user.findUnique({
                        where: { id: shoppingHandlerUserId },
                        select: { role: true, vendorId: true }
                    })];
            case 1:
                user = _a.sent();
                if (!user || user.vendorId !== vendorId || (user.role !== "store_admin" && user.role !== "store_shopper")) {
                    throw new Error('Unauthorized to start shopping for this vendor/order.');
                }
                return [4 /*yield*/, prisma.order.update({
                        where: {
                            id: orderId,
                            vendorId: vendorId,
                            orderStatus: client_1.OrderStatus.accepted_for_shopping,
                            shoppingMethod: client_1.ShoppingMethod.vendor
                        },
                        data: {
                            orderStatus: client_1.OrderStatus.currently_shopping,
                            shopperId: shoppingHandlerUserId
                        }
                    })];
            case 2:
                order = _a.sent();
                return [2 /*return*/, order];
            case 3:
                error_4 = _a.sent();
                if (error_4.code === 'P2025') {
                    throw new Error('Order not found or cannot start shopping in its current state/by this vendor.');
                }
                console.error("Error starting shopping for order " + orderId + ":", error_4);
                throw new Error('Failed to start shopping: ' + error_4.message);
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * Updates the shopping status of an order item.
 * Performed by the shopper/vendor.
 * @param orderId The ID of the order.
 * @param itemId The ID of the order item to update.
 * @param shopperId The ID of the user performing the action.
 * @param payload The update payload.
 * @returns The updated order item.
 */
exports.updateOrderItemShoppingStatusService = function (orderId, itemId, shopperId, payload) { return __awaiter(void 0, void 0, Promise, function () {
    var status, quantityFound, chosenReplacementId, order, updatedItem, io;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                status = payload.status, quantityFound = payload.quantityFound, chosenReplacementId = payload.chosenReplacementId;
                return [4 /*yield*/, prisma.order.findUnique({
                        where: { id: orderId },
                        select: { shopperId: true, deliveryPersonId: true, userId: true }
                    })];
            case 1:
                order = _a.sent();
                if (!order) {
                    throw new OrderCreationError('Order not found.', 404);
                }
                // Authorize: only the assigned shopper or delivery person can update
                if (order.shopperId !== shopperId && order.deliveryPersonId !== shopperId) {
                    throw new OrderCreationError('You are not authorized to update this order.', 403);
                }
                // Validate payload logic
                if (status === 'FOUND' && quantityFound === undefined) {
                    throw new OrderCreationError('quantityFound is required when status is FOUND.');
                }
                return [4 /*yield*/, prisma.orderItem.update({
                        where: { id: itemId, orderId: orderId },
                        data: {
                            status: status,
                            quantityFound: quantityFound,
                            chosenReplacementId: chosenReplacementId,
                            isReplacementApproved: chosenReplacementId ? null : undefined
                        },
                        include: {
                            vendorProduct: { include: { product: true } },
                            chosenReplacement: { include: { product: true } }
                        }
                    })];
            case 2:
                updatedItem = _a.sent();
                // Emit real-time update to the customer
                try {
                    io = socket_1.getIO();
                    // The room is the orderId. The customer and shopper should be in this room.
                    io.to(orderId).emit('order_item_updated', updatedItem);
                }
                catch (error) {
                    console.error('Socket.IO error in updateOrderItemShoppingStatusService:', error);
                }
                return [2 /*return*/, updatedItem];
        }
    });
}); };
/**
 * Allows a customer to approve or reject a suggested replacement for an order item.
 * @param orderId The ID of the order.
 * @param itemId The ID of the order item.
 * @param customerId The ID of the customer.
 * @param payload The response payload.
 * @returns The updated order item.
 */
exports.respondToReplacementService = function (orderId, itemId, customerId, payload) { return __awaiter(void 0, void 0, Promise, function () {
    var approved, order, itemToUpdate, updatedItem, io;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                approved = payload.approved;
                return [4 /*yield*/, prisma.order.findUnique({
                        where: { id: orderId },
                        select: { userId: true }
                    })];
            case 1:
                order = _a.sent();
                if (!order) {
                    throw new OrderCreationError('Order not found.', 404);
                }
                // Authorize: only the customer who placed the order can respond
                if (order.userId !== customerId) {
                    throw new OrderCreationError('You are not authorized to respond to this item.', 403);
                }
                return [4 /*yield*/, prisma.orderItem.findFirst({
                        where: { id: itemId, orderId: orderId }
                    })];
            case 2:
                itemToUpdate = _a.sent();
                if (!itemToUpdate) {
                    throw new OrderCreationError('Order item not found.', 404);
                }
                if (!itemToUpdate.chosenReplacementId) {
                    throw new OrderCreationError('No replacement has been suggested for this item.', 400);
                }
                return [4 /*yield*/, prisma.orderItem.update({
                        where: { id: itemId },
                        data: {
                            isReplacementApproved: approved,
                            status: approved ? client_1.OrderItemStatus.REPLACED : itemToUpdate.status
                        },
                        include: {
                            vendorProduct: { include: { product: true } },
                            chosenReplacement: { include: { product: true } }
                        }
                    })];
            case 3:
                updatedItem = _a.sent();
                // Emit real-time update to the shopper/vendor
                try {
                    io = socket_1.getIO();
                    io.to(orderId).emit('replacement_responded', updatedItem);
                }
                catch (error) {
                    console.error('Socket.IO error in respondToReplacementService:', error);
                }
                return [2 /*return*/, updatedItem];
        }
    });
}); };
/**
 * Retrieves all orders for a vendor user across all their stores.
 * It can be filtered by a specific vendorId (store) or order status.
 *
 * @param userId The ID of the authenticated vendor user.
 * @param options Filtering options including vendorId and status.
 * @returns A promise that resolves to an array of orders.
 * @throws OrderCreationError if the user has no vendors or if the specified vendorId does not belong to the user.
 */
exports.getOrdersForVendorUserService = function (userId, options) { return __awaiter(void 0, void 0, Promise, function () {
    var vendorId, status, userVendors, userVendorIds, vendorIdsToQuery;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                vendorId = options.vendorId, status = options.status;
                return [4 /*yield*/, vendorModel.getVendorsByUserId(userId)];
            case 1:
                userVendors = _a.sent();
                if (userVendors.length === 0) {
                    // If the user has no stores, they have no orders.
                    return [2 /*return*/, []];
                }
                userVendorIds = userVendors.map(function (v) { return v.id; });
                vendorIdsToQuery = userVendorIds;
                // 2. If a specific vendorId is provided, validate it and narrow the query.
                if (vendorId) {
                    if (!userVendorIds.includes(vendorId)) {
                        // The user is trying to access orders for a store they don't own.
                        throw new OrderCreationError('You are not authorized to access orders for this vendor.', 403);
                    }
                    vendorIdsToQuery = [vendorId];
                }
                // 3. Fetch the orders using the determined vendor IDs and optional status.
                return [2 /*return*/, orderModel.findOrdersForVendors({ vendorIds: vendorIdsToQuery, status: status })];
        }
    });
}); };
