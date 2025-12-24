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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.markMessagesAsReadService = exports.adminGetMessagesForOrderService = exports.getMessagesForOrderService = exports.sendMessageService = void 0;
var client_1 = require("@prisma/client");
var socket_1 = require("../socket");
var notificationService = require("./notification.service");
var prisma = new client_1.PrismaClient();
/**
 * Sends a message within an order.
 * Validates that the sender and recipient are participants of the order.
 * @param {SendMessageInput} messageData - The message data.
 * @returns {Promise<Message>} The created message.
 */
exports.sendMessageService = function (_a) {
    var orderId = _a.orderId, senderId = _a.senderId, recipientId = _a.recipientId, content = _a.content;
    return __awaiter(void 0, void 0, Promise, function () {
        var order, participants, message, io, recipientSocketId;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, prisma.order.findUnique({
                        where: { id: orderId },
                        select: {
                            userId: true,
                            shopperId: true,
                            deliveryPersonId: true
                        }
                    })];
                case 1:
                    order = _b.sent();
                    if (!order) {
                        throw new Error('Order not found.');
                    }
                    participants = [order.userId, order.shopperId, order.deliveryPersonId].filter(function (id) { return id !== null; });
                    // 2. Check if sender and recipient are valid participants
                    if (!participants.includes(senderId)) {
                        throw new Error('Sender is not allowed to message in this order.');
                    }
                    if (!participants.includes(recipientId)) {
                        throw new Error('Recipient is not a participant in this order.');
                    }
                    return [4 /*yield*/, prisma.message.create({
                            data: {
                                orderId: orderId,
                                senderId: senderId,
                                recipientId: recipientId,
                                content: content
                            },
                            include: {
                                sender: {
                                    select: { id: true, name: true }
                                }
                            }
                        })];
                case 2:
                    message = _b.sent();
                    // --- Add Notification Logic Here ---
                    return [4 /*yield*/, notificationService.createNotification({
                            userId: recipientId,
                            type: client_1.NotificationType.NEW_MESSAGE,
                            title: "New message from " + message.sender.name,
                            category: client_1.NotificationCategory.ORDER,
                            body: content,
                            meta: { orderId: orderId, senderId: senderId }
                        })];
                case 3:
                    // --- Add Notification Logic Here ---
                    _b.sent();
                    // --- End Notification Logic ---
                    // 4. Trigger a real-time event to the recipient
                    try {
                        io = socket_1.getIO();
                        recipientSocketId = socket_1.userSocketMap.get(recipientId);
                        if (recipientSocketId) {
                            io.to(recipientSocketId).emit('new_message', message);
                        }
                    }
                    catch (error) {
                        console.error('Socket.IO error:', error);
                    }
                    return [2 /*return*/, message];
            }
        });
    });
};
/**
 * Retrieves all messages for a specific order.
 * Validates that the requesting user is a participant of the order.
 * @param {string} orderId - The ID of the order.
 * @param {string} userId - The ID of the user requesting the messages.
 * @returns {Promise<Message[]>} A list of messages for the order.
 */
exports.getMessagesForOrderService = function (orderId, userId) { return __awaiter(void 0, void 0, Promise, function () {
    var order, participants, messages;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.order.findUnique({
                    where: { id: orderId },
                    select: {
                        userId: true,
                        shopperId: true,
                        deliveryPersonId: true
                    }
                })];
            case 1:
                order = _a.sent();
                if (!order) {
                    throw new Error('Order not found.');
                }
                participants = [order.userId, order.shopperId, order.deliveryPersonId].filter(function (id) { return id !== null; });
                if (!participants.includes(userId)) {
                    throw new Error('User is not allowed to view messages for this order.');
                }
                return [4 /*yield*/, prisma.message.findMany({
                        where: {
                            orderId: orderId
                        },
                        orderBy: {
                            createdAt: 'asc'
                        },
                        include: {
                            sender: {
                                select: { id: true, name: true }
                            }
                        }
                    })];
            case 2:
                messages = _a.sent();
                return [2 /*return*/, messages];
        }
    });
}); };
/**
 * (Admin) Retrieves all messages for a specific order without participation checks.
 * @param {string} orderId - The ID of the order.
 * @returns {Promise<Message[]>} A list of messages for the order.
 * @throws Error if the order is not found.
 */
exports.adminGetMessagesForOrderService = function (orderId) { return __awaiter(void 0, void 0, Promise, function () {
    var order;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.order.findUnique({ where: { id: orderId } })];
            case 1:
                order = _a.sent();
                if (!order) {
                    throw new Error('Order not found.');
                }
                return [2 /*return*/, prisma.message.findMany({
                        where: { orderId: orderId },
                        orderBy: { createdAt: 'asc' },
                        include: {
                            sender: {
                                select: { id: true, name: true }
                            }
                        }
                    })];
        }
    });
}); };
/**
 * Marks all unread messages in an order for a specific user as read.
 * Notifies the senders of these messages in real-time.
 * @param {string} orderId - The ID of the order.
 * @param {string} userId - The ID of the user whose messages should be marked as read (the recipient).
 * @returns {Promise<{ count: number }>} The number of messages updated.
 */
exports.markMessagesAsReadService = function (orderId, userId) { return __awaiter(void 0, void 0, Promise, function () {
    var order, participants, messagesToUpdate, updateResult, io, uniqueSenderIds, _i, uniqueSenderIds_1, senderId, senderSocketId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.order.findUnique({
                    where: { id: orderId },
                    select: {
                        userId: true,
                        shopperId: true,
                        deliveryPersonId: true
                    }
                })];
            case 1:
                order = _a.sent();
                if (!order) {
                    throw new Error('Order not found.');
                }
                participants = [order.userId, order.shopperId, order.deliveryPersonId].filter(function (id) { return id !== null; });
                if (!participants.includes(userId)) {
                    throw new Error('User is not allowed to modify messages for this order.');
                }
                return [4 /*yield*/, prisma.message.findMany({
                        where: {
                            orderId: orderId,
                            recipientId: userId,
                            readAt: null
                        },
                        select: {
                            senderId: true
                        }
                    })];
            case 2:
                messagesToUpdate = _a.sent();
                if (messagesToUpdate.length === 0) {
                    return [2 /*return*/, { count: 0 }];
                }
                return [4 /*yield*/, prisma.message.updateMany({
                        where: {
                            orderId: orderId,
                            recipientId: userId,
                            readAt: null
                        },
                        data: {
                            readAt: new Date()
                        }
                    })];
            case 3:
                updateResult = _a.sent();
                // 3. Notify senders via WebSocket that their messages have been read
                try {
                    io = socket_1.getIO();
                    uniqueSenderIds = __spreadArrays(new Set(messagesToUpdate.map(function (m) { return m.senderId; })));
                    for (_i = 0, uniqueSenderIds_1 = uniqueSenderIds; _i < uniqueSenderIds_1.length; _i++) {
                        senderId = uniqueSenderIds_1[_i];
                        senderSocketId = socket_1.userSocketMap.get(senderId);
                        if (senderSocketId) {
                            // The payload tells the sender's client which user in which order read the messages.
                            io.to(senderSocketId).emit('messages_read', {
                                orderId: orderId,
                                readBy: userId
                            });
                        }
                    }
                }
                catch (error) {
                    console.error('Socket.IO error in markMessagesAsReadService:', error);
                }
                return [2 /*return*/, updateResult];
        }
    });
}); };
