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
exports.getUnreadCountController = exports.markAllAsReadController = exports.markAsReadController = exports.getNotificationsController = void 0;
var notificationService = require("../services/notification.service");
/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get notifications for the authenticated user
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page.
 *     responses:
 *       200:
 *         description: A paginated list of notifications.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedNotifications'
 * components:
 *   schemas:
 *     NotificationType:
 *       type: string
 *       enum:
 *         - ORDER_ACCEPTED
 *         - ORDER_DECLINED
 *         - ORDER_SHOPPING_STARTED
 *         - ORDER_READY_FOR_PICKUP
 *         - ORDER_READY_FOR_DELIVERY
 *         - EN_ROUTE
 *         - DELIVERED
 *         - COMPLETED
 *         - ORDER_CANCELLED
 *         - NEW_ORDER_PLACED
 *         - ORDER_PLACED_CUSTOMER
 *         - ASSIGNED_TO_ORDER
 *         - NEW_MESSAGE
 *         - PROMOTIONAL
 *         - ACCOUNT_UPDATE
 *         - BUG_REPORT_RECEIVED
 *         - BUG_REPORT_RESOLVED
 *     Notification:
 *       type: object
 *       properties:
 *         id: { type: string, description: "CUID" }
 *         userId: { type: string, format: uuid }
 *         type: { $ref: '#/components/schemas/NotificationType' }
 *         title: { type: string }
 *         body: { type: string }
 *         isRead: { type: boolean }
 *         meta: { type: object, nullable: true, description: "To store related IDs like orderId, etc. for deep linking" }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     PaginatedNotifications:
 *       type: object
 *       properties:
 *         page: { type: integer }
 *         totalPages: { type: integer }
 *         pageSize: { type: integer }
 *         totalCount: { type: integer }
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Notification'
 */
exports.getNotificationsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, page, size, notifications, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                page = req.query.page || 1;
                size = req.query.size || 20;
                return [4 /*yield*/, notificationService.getNotifications(userId, page, size)];
            case 1:
                notifications = _a.sent();
                res.status(200).json(notifications);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                res.status(500).json({ error: 'Failed to retrieve notifications.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark a specific notification as read
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the notification to mark as read.
 *     responses:
 *       200:
 *         description: The updated notification.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Notification not found or user does not have permission.
 */
exports.markAsReadController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, notificationId, notification, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                notificationId = req.params.notificationId;
                return [4 /*yield*/, notificationService.markAsRead(notificationId, userId)];
            case 1:
                notification = _a.sent();
                if (!notification) {
                    return [2 /*return*/, res.status(404).json({ error: 'Notification not found or you do not have permission to update it.' })];
                }
                res.status(200).json(notification);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                res.status(500).json({ error: 'Failed to mark notification as read.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all unread notifications as read
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The number of notifications that were updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 */
exports.markAllAsReadController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, result, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                return [4 /*yield*/, notificationService.markAllAsRead(userId)];
            case 1:
                result = _a.sent();
                res.status(200).json(result);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                res.status(500).json({ error: 'Failed to mark all notifications as read.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Get the count of unread notifications
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The count of unread notifications.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 */
exports.getUnreadCountController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, result, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                return [4 /*yield*/, notificationService.getUnreadCount(userId)];
            case 1:
                result = _a.sent();
                res.status(200).json(result);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                res.status(500).json({ error: 'Failed to get unread notification count.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
