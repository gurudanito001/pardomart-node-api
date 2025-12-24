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
exports.unregisterDeviceController = exports.registerDeviceController = void 0;
var deviceService = require("../services/device.service");
/**
 * @swagger
 * /devices:
 *   post:
 *     summary: Register a device for push notifications
 *     tags: [User, Notification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fcmToken, platform]
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 description: The Firebase Cloud Messaging token for the device.
 *               platform:
 *                 type: string
 *                 enum: [ios, android, web]
 *                 description: The platform of the device.
 *     responses:
 *       201:
 *         description: Device registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Device'
 * components:
 *   schemas:
 *     Device:
 *       type: object
 *       properties:
 *         id: { type: string, description: "UUID" }
 *         userId: { type: string, format: uuid }
 *         fcmToken: { type: string }
 *         platform: { type: string, enum: [ios, android, web] }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */
exports.registerDeviceController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, fcmToken, platform, userId, device, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, fcmToken = _a.fcmToken, platform = _a.platform;
                userId = req.userId;
                return [4 /*yield*/, deviceService.registerDevice(userId, fcmToken, platform)];
            case 1:
                device = _b.sent();
                res.status(201).json(device);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                res.status(500).json({ error: 'Failed to register device.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /devices/{fcmToken}:
 *   delete:
 *     summary: Unregister a device for push notifications
 *     tags: [User, Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fcmToken
 *         required: true
 *         schema:
 *           type: string
 *         description: The FCM token of the device to unregister.
 *     responses:
 *       204:
 *         description: Device unregistered successfully.
 */
exports.unregisterDeviceController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var fcmToken, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                fcmToken = req.params.fcmToken;
                return [4 /*yield*/, deviceService.unregisterDevice(fcmToken)];
            case 1:
                _a.sent();
                res.status(204).send();
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                res.status(500).json({ error: 'Failed to unregister device.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
