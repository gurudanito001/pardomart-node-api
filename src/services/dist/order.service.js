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
exports.startShoppingService = exports.declineOrderService = exports.acceptOrderService = exports.getOrdersForVendorDashboard = exports.updateOrderStatusService = exports.updateOrderService = exports.getOrdersByUserIdService = exports.getOrderByIdService = exports.createOrderService = void 0;
var orderModel = require("../models/order.model"); // Adjust the path if needed
var client_1 = require("@prisma/client");
var dayjs_1 = require("dayjs");
var prisma = new client_1.PrismaClient();
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
    return __generator(this, function (_a) {
        return [2 /*return*/, orderModel.getOrderById(id)];
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
    return __generator(this, function (_a) {
        return [2 /*return*/, orderModel.updateOrder(id, { orderStatus: status })];
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
                            { OrderStatus: options === null || options === void 0 ? void 0 : options.status } :
                            { orderStatus: { "in": defaultStatuses } })), { 
                            // Filter by scheduledShoppingStartTime:
                            // If includeFutureScheduled is false/undefined, only show orders where shopping is due now or in the past
                            scheduledShoppingStartTime: {
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
                            deliverer: { select: { id: true, name: true } }
                        },
                        orderBy: {
                            scheduledShoppingStartTime: 'asc',
                            createdAt: 'asc'
                        }
                    })]; /* as Promise<OrderWithRequiredRelations[]> */
            case 2:
                orders = _a.sent() /* as Promise<OrderWithRequiredRelations[]> */;
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
 * @param shoppingHandlerUserId The ID of the user (vendor_staff/admin) accepting the order.
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
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.order.update({
                        where: {
                            id: orderId,
                            vendorId: vendorId,
                            orderStatus: client_1.OrderStatus.pending,
                            shoppingMethod: client_1.ShoppingMethod.vendor,
                            shoppingHandlerId: null
                        },
                        data: {
                            orderStatus: client_1.OrderStatus.accepted_for_shopping,
                            shoppingHandlerId: shoppingHandlerUserId
                        }
                    })];
            case 1:
                acceptedOrder = _a.sent();
                return [2 /*return*/, acceptedOrder];
            case 2:
                error_3 = _a.sent();
                if (error_3.code === 'P2025') { // Prisma error for record not found
                    // This means the order was not found OR it didn't match the where conditions (e.g., not pending, wrong vendor)
                    throw new Error('Order not found or cannot be accepted in its current state/by this vendor.');
                }
                console.error("Error accepting order " + orderId + ":", error_3);
                throw new Error('Failed to accept order: ' + error_3.message);
            case 3: return [2 /*return*/];
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
    var declinedOrder, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.order.update({
                        where: {
                            id: orderId,
                            vendorId: vendorId,
                            orderStatus: client_1.OrderStatus.pending,
                            shoppingMethod: client_1.ShoppingMethod.vendor
                        },
                        data: {
                            orderStatus: client_1.OrderStatus.declined_by_vendor,
                            reasonForDecline: reason,
                            shoppingHandlerId: null
                        }
                    })];
            case 1:
                declinedOrder = _a.sent();
                return [2 /*return*/, declinedOrder];
            case 2:
                error_4 = _a.sent();
                if (error_4.code === 'P2025') { // Prisma error for record not found
                    throw new Error('Order not found or cannot be declined in its current state/by this vendor.');
                }
                console.error("Error declining order " + orderId + ":", error_4);
                throw new Error('Failed to decline order: ' + error_4.message);
            case 3: return [2 /*return*/];
        }
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
    var user, order, error_5;
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
                if (!user || user.vendorId !== vendorId || (user.role !== "vendor" && user.role !== "vendor_staff")) {
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
                            shoppingHandlerId: shoppingHandlerUserId
                        }
                    })];
            case 2:
                order = _a.sent();
                return [2 /*return*/, order];
            case 3:
                error_5 = _a.sent();
                if (error_5.code === 'P2025') {
                    throw new Error('Order not found or cannot start shopping in its current state/by this vendor.');
                }
                console.error("Error starting shopping for order " + orderId + ":", error_5);
                throw new Error('Failed to start shopping: ' + error_5.message);
            case 4: return [2 /*return*/];
        }
    });
}); };
