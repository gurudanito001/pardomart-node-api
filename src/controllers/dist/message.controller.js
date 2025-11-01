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
exports.adminGetMessagesForOrderController = exports.markMessagesAsReadController = exports.getMessagesForOrderController = exports.sendMessageController = void 0;
var message_service_1 = require("../services/message.service");
/**
 * @swagger
 * tags:
 *   name: Messaging
 *   description: Messaging within an order
 */
/**
 * @swagger
 * /api/v1/order/{orderId}/messages:
 *   post:
 *     summary: Send a message related to an order
 *     tags: [Order, Messaging]
 *     description: Sends a message from the authenticated user to another participant (customer, shopper, or delivery person) of the order.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *               - content
 *             properties:
 *               recipientId:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the user who is the recipient of the message.
 *               content:
 *                 type: string
 *                 description: The text content of the message.
 *     responses:
 *       201:
 *         description: The created message.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MessageWithRelations' }
 *       400:
 *         description: Bad request (e.g., invalid input).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not a participant in the order or trying to message an invalid recipient).
 *       404:
 *         description: Order not found.
 *       500:
 *         description: Internal server error.
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         content: { type: string }
 *         senderId: { type: string, format: uuid }
 *         recipientId: { type: string, format: uuid }
 *         orderId: { type: string, format: uuid }
 *         readAt: { type: string, format: date-time, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     UserSummary:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         name: { type: string, nullable: true }
 *         mobileNumber: { type: string, nullable: true }
 *     MessageWithRelations:
 *       allOf:
 *         - $ref: '#/components/schemas/Message'
 *         - type: object
 *           properties:
 *             sender:
 *               $ref: '#/components/schemas/UserSummary'
 *             recipient:
 *               $ref: '#/components/schemas/UserSummary'
 */
exports.sendMessageController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var senderId, orderId, _a, recipientId, content, message, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                senderId = req.userId;
                orderId = req.params.orderId;
                _a = req.body, recipientId = _a.recipientId, content = _a.content;
                return [4 /*yield*/, message_service_1.sendMessageService({
                        orderId: orderId,
                        senderId: senderId,
                        recipientId: recipientId,
                        content: content
                    })];
            case 1:
                message = _b.sent();
                res.status(201).json(message);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                console.error('Error sending message:', error_1);
                if (error_1.message.includes('not found')) {
                    return [2 /*return*/, res.status(404).json({ error: error_1.message })];
                }
                if (error_1.message.includes('not allowed')) {
                    return [2 /*return*/, res.status(403).json({ error: error_1.message })];
                }
                res.status(500).json({ error: 'Failed to send message.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /api/v1/order/{orderId}/messages:
 *   get:
 *     summary: Get messages for an order
 *     tags: [Order, Messaging]
 *     description: Retrieves the conversation history for a specific order. The user must be a participant in the order (customer, shopper, or delivery person).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order.
 *     responses:
 *       200:
 *         description: A list of messages for the order.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/MessageWithRelations' }
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not a participant in the order).
 *       404:
 *         description: Order not found.
 *       500:
 *         description: Internal server error.
 */
exports.getMessagesForOrderController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, orderId, messages, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                orderId = req.params.orderId;
                return [4 /*yield*/, message_service_1.getMessagesForOrderService(orderId, userId)];
            case 1:
                messages = _a.sent();
                res.status(200).json(messages);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error getting messages:', error_2);
                if (error_2.message.includes('not found')) {
                    return [2 /*return*/, res.status(404).json({ error: error_2.message })];
                }
                if (error_2.message.includes('not allowed')) {
                    return [2 /*return*/, res.status(403).json({ error: error_2.message })];
                }
                res.status(500).json({ error: 'Failed to get messages.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /api/v1/order/{orderId}/messages/read:
 *   patch:
 *     summary: Mark messages as read
 *     tags: [Order, Messaging]
 *     description: Marks all unread messages for the authenticated user within a specific order as read. This is typically called when the user opens the chat screen.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order.
 *     responses:
 *       200:
 *         description: The number of messages that were marked as read.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: The number of messages updated.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not a participant in the order).
 *       404:
 *         description: Order not found.
 *       500:
 *         description: Internal server error.
 */
exports.markMessagesAsReadController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, orderId, result, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                orderId = req.params.orderId;
                return [4 /*yield*/, message_service_1.markMessagesAsReadService(orderId, userId)];
            case 1:
                result = _a.sent();
                res.status(200).json(result);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error marking messages as read:', error_3);
                if (error_3.message.includes('not found')) {
                    return [2 /*return*/, res.status(404).json({ error: error_3.message })];
                }
                if (error_3.message.includes('not allowed')) {
                    return [2 /*return*/, res.status(403).json({ error: error_3.message })];
                }
                res.status(500).json({ error: 'Failed to mark messages as read.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /api/v1/order/admin/{orderId}/messages:
 *   get:
 *     summary: Get all messages for an order (Admin)
 *     tags: [Order, Messaging, Admin]
 *     description: Retrieves the complete conversation history for a specific order. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the order.
 *     responses:
 *       200:
 *         description: A list of messages for the order.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/MessageWithRelations' }
 *       404:
 *         description: Order not found.
 */
exports.adminGetMessagesForOrderController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var orderId, messages, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                orderId = req.params.orderId;
                return [4 /*yield*/, message_service_1.adminGetMessagesForOrderService(orderId)];
            case 1:
                messages = _a.sent();
                res.status(200).json(messages);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                res.status(error_4.message.includes('not found') ? 404 : 500).json({ error: error_4.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
