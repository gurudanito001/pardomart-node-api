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
exports.updateOrderTipController = exports.startShoppingController = exports.declineOrderController = exports.getAvailableDeliverySlotsController = exports.acceptOrderController = exports.respondToReplacementController = exports.updateOrderItemShoppingStatusController = exports.getVendorOrdersController = exports.updateOrderController = exports.updateOrderStatusController = exports.getOrdersByUserController = exports.getOrderByIdController = exports.createOrderController = void 0;
var order_service_1 = require("../services/order.service"); // Adjust the path if needed
// --- Order Controllers ---
/**
 * Controller for creating a new order.
 * @swagger
 * /order:
 *   post:
 *     summary: Create an order from a client payload
 *     tags: [Order]
 *     description: Creates a new order based on a payload sent from the client, which includes all order items and delivery details. This endpoint is used when the cart state is managed on the client-side.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vendorId
 *               - paymentMethod
 *               - orderItems
 *               - shoppingMethod
 *               - deliveryMethod
 *             properties:
 *               vendorId:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the vendor for this order.
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, wallet, cash]
 *                 description: The payment method for the order.
 *               shippingAddressId:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of an existing delivery address. Required if `deliveryMethod` is `delivery_person`.
 *               shopperTip:
 *                 type: number
 *                 format: float
 *                 description: Optional. Tip for the shopper.
 *               deliveryPersonTip:
 *                 type: number
 *                 format: float
 *                 description: Optional. Tip for the delivery person.
 *               deliveryInstructions:
 *                 type: string
 *                 description: Optional instructions for the delivery.
 *               orderItems:
 *                 type: array
 *                 description: A list of items to be included in the order.
 *                 items:
 *                   type: object
 *                   required:
 *                     - vendorProductId
 *                     - quantity
 *                   properties:
 *                     vendorProductId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                     instructions:
 *                       type: string
 *                       description: Optional instructions for the shopper for this specific item.
 *                     replacementIds:
 *                       type: array
 *                       description: Optional. A list of vendor product IDs for potential replacements.
 *                       items:
 *                         type: string
 *                         format: uuid
 *               shoppingMethod:
 *                 type: string
 *                 enum: [vendor, shopper]
 *                 description: Who will be shopping for the items.
 *               deliveryMethod:
 *                 type: string
 *                 enum: [delivery_person, customer_pickup]
 *                 description: How the order will be delivered.
 *               scheduledDeliveryTime:
 *                 type: string
 *                 format: date-time
 *                 description: Optional. The requested time for the delivery in UTC ISO 8601 format (e.g., 2023-10-27T14:30:00.000Z).
 *     responses:
 *       201:
 *         description: The created order.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request due to invalid input (e.g., missing fields, invalid time, item out of stock).
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
exports.createOrderController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, finalOrder, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                return [4 /*yield*/, order_service_1.createOrderFromClient(userId, req.body)];
            case 1:
                finalOrder = _a.sent();
                res.status(201).json(finalOrder);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                if (error_1 instanceof order_service_1.OrderCreationError) {
                    return [2 /*return*/, res.status(error_1.statusCode).json({ error: error_1.message })];
                }
                console.error('Error creating order:', error_1);
                res.status(500).json({ error: error_1.message || 'Internal server error during order creation.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Controller for getting an order by ID.
 * @swagger
 * /order/{id}:
 *   get:
 *     summary: Get an order by its ID
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order to retrieve.
 *     responses:
 *       200:
 *         description: The requested order.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found.
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
 * @swagger
 * /order/user/getByUserId:
 *   get:
 *     summary: Get all orders for the authenticated user
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of the user's orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       400:
 *         description: User ID is required.
 */
exports.getOrdersByUserController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, orders, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
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
 * @swagger
 * /order/{id}/status:
 *   patch:
 *     summary: Update the status of an order
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderStatusPayload'
 *     responses:
 *       200:
 *         description: The updated order.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found.
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
 * @swagger
 * /order/{id}:
 *   patch:
 *     summary: Update an order
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderPayload'
 *     responses:
 *       200:
 *         description: The updated order.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found.
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
 * @swagger
 * /order/vendorOrders:
 *   get:
 *     summary: Get orders for a vendor's dashboard
 *     tags: [Order, Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/OrderStatus'
 *         description: Optional. Filter orders by a specific status.
 *     responses:
 *       200:
 *         description: A list of orders for the vendor.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
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
 * @swagger
 * /order/{orderId}/items/{itemId}/update-shopping-status:
 *   patch:
 *     summary: Update the shopping status of an order item
 *     tags: [Order, Vendor]
 *     description: Allows the assigned shopper or delivery person to update an item's status during shopping (e.g., found, not found, suggest replacement).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [FOUND, NOT_FOUND]
 *               quantityFound:
 *                 type: integer
 *                 description: Required if status is FOUND.
 *               chosenReplacementId:
 *                 type: string
 *                 format: uuid
 *                 description: The vendorProductId of the suggested replacement if status is NOT_FOUND.
 *     responses:
 *       200:
 *         description: The updated order item.
 *       400:
 *         description: Bad request (e.g., invalid payload).
 *       403:
 *         description: Forbidden (user is not the assigned shopper).
 *       404:
 *         description: Order or item not found.
 */
exports.updateOrderItemShoppingStatusController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var shopperId, _a, orderId, itemId, payload, updatedItem, error_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                shopperId = req.userId;
                _a = req.params, orderId = _a.orderId, itemId = _a.itemId;
                payload = req.body;
                return [4 /*yield*/, order_service_1.updateOrderItemShoppingStatusService(orderId, itemId, shopperId, payload)];
            case 1:
                updatedItem = _b.sent();
                res.status(200).json(updatedItem);
                return [3 /*break*/, 3];
            case 2:
                error_7 = _b.sent();
                if (error_7 instanceof order_service_1.OrderCreationError) {
                    return [2 /*return*/, res.status(error_7.statusCode).json({ error: error_7.message })];
                }
                console.error('Error in updateOrderItemShoppingStatusController:', error_7);
                res.status(500).json({ error: error_7.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /order/{orderId}/items/{itemId}/respond-to-replacement:
 *   patch:
 *     summary: Respond to a suggested item replacement
 *     tags: [Order]
 *     description: Allows a customer to approve or reject a replacement suggested by the shopper.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [approved]
 *             properties:
 *               approved:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: The updated order item.
 *       400:
 *         description: Bad request (e.g., no replacement was suggested).
 *       403:
 *         description: Forbidden (user does not own this order).
 *       404:
 *         description: Order or item not found.
 */
exports.respondToReplacementController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var customerId, _a, orderId, itemId, payload, updatedItem, error_8;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                customerId = req.userId;
                _a = req.params, orderId = _a.orderId, itemId = _a.itemId;
                payload = req.body;
                return [4 /*yield*/, order_service_1.respondToReplacementService(orderId, itemId, customerId, payload)];
            case 1:
                updatedItem = _b.sent();
                res.status(200).json(updatedItem);
                return [3 /*break*/, 3];
            case 2:
                error_8 = _b.sent();
                if (error_8 instanceof order_service_1.OrderCreationError) {
                    return [2 /*return*/, res.status(error_8.statusCode).json({ error: error_8.message })];
                }
                console.error('Error in respondToReplacementController:', error_8);
                res.status(500).json({ error: error_8.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Controller to accept a pending order.
 * @swagger
 * /order/{orderId}/accept:
 *   patch:
 *     summary: Accept a pending order
 *     tags: [Order, Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order to accept.
 *     responses:
 *       200:
 *         description: The accepted order.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request or order cannot be accepted.
 */
exports.acceptOrderController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var orderId, shoppingHandlerUserId, vendorId, acceptedOrder, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                orderId = req.params.orderId;
                shoppingHandlerUserId = req.userId;
                vendorId = req.vendorId;
                return [4 /*yield*/, order_service_1.acceptOrderService(orderId, shoppingHandlerUserId, vendorId)];
            case 1:
                acceptedOrder = _a.sent();
                res.status(200).json(acceptedOrder);
                return [3 /*break*/, 3];
            case 2:
                error_9 = _a.sent();
                console.error('Error in acceptOrderController:', error_9);
                if (error_9.message.includes('not found') || error_9.message.includes('cannot be accepted')) {
                    return [2 /*return*/, res.status(400).json({ error: error_9.message })];
                }
                res.status(500).json({ error: error_9.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Controller to get available delivery time slots for a vendor.
 * @swagger
 * /order/delivery-slots:
 *   get:
 *     summary: Get available delivery time slots
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the vendor.
 *       - in: query
 *         name: deliveryMethod
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/DeliveryMethod'
 *         description: The delivery method for the order.
 *     responses:
 *       200:
 *         description: A list of available delivery dates and time slots.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     example: "27-09-2025"
 *                   timeSlots:
 *                     type: array
 *                     items:
 *                       type: string
 *                       example: "9:00am - 10:00am"
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 *       500:
 *         description: Internal server error.
 */
exports.getAvailableDeliverySlotsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, vendorId, deliveryMethod, slots, error_10;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, vendorId = _a.vendorId, deliveryMethod = _a.deliveryMethod;
                return [4 /*yield*/, order_service_1.getAvailableDeliverySlots(vendorId, deliveryMethod)];
            case 1:
                slots = _b.sent();
                res.status(200).json(slots);
                return [3 /*break*/, 3];
            case 2:
                error_10 = _b.sent();
                console.error('Error getting delivery slots:', error_10);
                res.status(500).json({ error: error_10.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Controller to decline a pending order.
 * @swagger
 * /order/{orderId}/decline:
 *   patch:
 *     summary: Decline a pending order
 *     tags: [Order, Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order to decline.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeclineOrderPayload'
 *     responses:
 *       200:
 *         description: The declined order.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request or order cannot be declined.
 */
exports.declineOrderController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var orderId, reason, vendorId, declinedOrder, error_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                orderId = req.params.orderId;
                reason = req.body.reason;
                vendorId = req.vendorId;
                return [4 /*yield*/, order_service_1.declineOrderService(orderId, vendorId, reason)];
            case 1:
                declinedOrder = _a.sent();
                res.status(200).json(declinedOrder);
                return [3 /*break*/, 3];
            case 2:
                error_11 = _a.sent();
                console.error('Error in declineOrderController:', error_11);
                if (error_11.message.includes('not found') || error_11.message.includes('cannot be declined')) {
                    return [2 /*return*/, res.status(400).json({ error: error_11.message })];
                }
                res.status(500).json({ error: error_11.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Controller to mark an accepted order as 'shopping'.
 * @swagger
 * /order/{orderId}/start-shopping:
 *   patch:
 *     summary: Mark an order as 'currently shopping'
 *     tags: [Order, Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order to start shopping for.
 *     responses:
 *       200:
 *         description: The updated order.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request or shopping cannot be started for this order.
 */
exports.startShoppingController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var orderId, shoppingHandlerUserId, vendorId, updatedOrder, error_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                orderId = req.params.orderId;
                shoppingHandlerUserId = req.userId;
                vendorId = req.vendorId;
                return [4 /*yield*/, order_service_1.startShoppingService(orderId, shoppingHandlerUserId, vendorId)];
            case 1:
                updatedOrder = _a.sent();
                res.status(200).json(updatedOrder);
                return [3 /*break*/, 3];
            case 2:
                error_12 = _a.sent();
                console.error('Error in startShoppingController:', error_12);
                if (error_12.message.includes('not found') || error_12.message.includes('cannot start shopping')) {
                    return [2 /*return*/, res.status(400).json({ error: error_12.message })];
                }
                res.status(500).json({ error: error_12.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /order/{orderId}/tip:
 *   patch:
 *     summary: Add or update a tip for an order
 *     tags: [Order]
 *     description: Allows a customer to add or update tips for the shopper and/or delivery person after an order has been placed. This will recalculate the order's total amount.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order to add a tip to.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shopperTip:
 *                 type: number
 *                 format: float
 *                 description: The tip amount for the shopper.
 *               deliveryPersonTip:
 *                 type: number
 *                 format: float
 *                 description: The tip amount for the delivery person.
 *     responses:
 *       200:
 *         description: The updated order with the new tip amount.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request (e.g., invalid tip amount).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user does not own this order).
 *       404:
 *         description: Order not found.
 */
exports.updateOrderTipController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, orderId, payload, updatedOrder, error_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                orderId = req.params.orderId;
                payload = req.body;
                return [4 /*yield*/, order_service_1.updateOrderTipService(orderId, userId, payload)];
            case 1:
                updatedOrder = _a.sent();
                res.status(200).json(updatedOrder);
                return [3 /*break*/, 3];
            case 2:
                error_13 = _a.sent();
                if (error_13 instanceof order_service_1.OrderCreationError) {
                    return [2 /*return*/, res.status(error_13.statusCode).json({ error: error_13.message })];
                }
                console.error('Error in updateOrderTipController:', error_13);
                res.status(500).json({ error: error_13.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
