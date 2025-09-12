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
exports.setDefaultDeliveryAddressController = exports.deleteDeliveryAddressController = exports.updateDeliveryAddressController = exports.getMyDefaultDeliveryAddressController = exports.getMyDeliveryAddressesController = exports.getDeliveryAddressByIdController = exports.createDeliveryAddressController = void 0;
var deliveryAddress_service_1 = require("../services/deliveryAddress.service");
var client_1 = require("@prisma/client");
/**
 * @swagger
 * /deliveryAddress:
 *   post:
 *     summary: Create a new delivery address for the authenticated user
 *     tags: [Delivery Address]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDeliveryAddressPayload'
 *     responses:
 *       201:
 *         description: The created delivery address.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryAddress'
 *       400:
 *         description: Bad request, required fields are missing.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
exports.createDeliveryAddressController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, payload, newAddress, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({ error: 'Unauthorized: User ID not found.' })];
                }
                payload = __assign(__assign({}, req.body), { userId: userId });
                return [4 /*yield*/, deliveryAddress_service_1.createDeliveryAddressService(payload)];
            case 1:
                newAddress = _a.sent();
                res.status(201).json(newAddress);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error in createDeliveryAddressController:', error_1);
                res.status(500).json({ error: error_1.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /deliveryAddress/{id}:
 *   get:
 *     summary: Get a specific delivery address by its ID
 *     tags: [Delivery Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the delivery address.
 *     responses:
 *       200:
 *         description: The requested delivery address.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryAddress'
 *       404:
 *         description: Delivery address not found.
 */
exports.getDeliveryAddressByIdController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, address, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, deliveryAddress_service_1.getDeliveryAddressByIdService(id)];
            case 1:
                address = _a.sent();
                if (!address) {
                    return [2 /*return*/, res.status(404).json({ error: 'Delivery address not found.' })];
                }
                res.status(200).json(address);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error in getDeliveryAddressByIdController:', error_2);
                res.status(500).json({ error: error_2.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /deliveryAddress/me:
 *   get:
 *     summary: Get all delivery addresses for the authenticated user
 *     tags: [Delivery Address]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of the user's delivery addresses.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DeliveryAddress'
 *       401:
 *         description: Unauthorized.
 */
exports.getMyDeliveryAddressesController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, addresses, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({ error: 'Unauthorized: User ID not found.' })];
                }
                return [4 /*yield*/, deliveryAddress_service_1.getDeliveryAddressesByUserIdService(userId)];
            case 1:
                addresses = _a.sent();
                res.status(200).json(addresses);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error in getMyDeliveryAddressesController:', error_3);
                res.status(500).json({ error: error_3.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /deliveryAddress/me/default:
 *   get:
 *     summary: Get the default delivery address for the authenticated user
 *     tags: [Delivery Address]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user's default delivery address.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryAddress'
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: No default address found for this user.
 */
exports.getMyDefaultDeliveryAddressController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, defaultAddress, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({ error: 'Unauthorized: User ID not found.' })];
                }
                return [4 /*yield*/, deliveryAddress_service_1.getDefaultDeliveryAddressByUserIdService(userId)];
            case 1:
                defaultAddress = _a.sent();
                if (!defaultAddress) {
                    return [2 /*return*/, res.status(404).json({ message: 'No default address found for this user.' })];
                }
                res.status(200).json(defaultAddress);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Error in getMyDefaultDeliveryAddressController:', error_4);
                res.status(500).json({ error: error_4.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /deliveryAddress/{id}:
 *   put:
 *     summary: Update a delivery address
 *     tags: [Delivery Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the delivery address to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDeliveryAddressPayload'
 *     responses:
 *       200:
 *         description: The updated delivery address.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryAddress'
 *       404:
 *         description: Delivery address not found.
 */
exports.updateDeliveryAddressController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, payload, updatedAddress, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                payload = req.body;
                return [4 /*yield*/, deliveryAddress_service_1.updateDeliveryAddressService(id, payload)];
            case 1:
                updatedAddress = _a.sent();
                res.status(200).json(updatedAddress);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Error in updateDeliveryAddressController:', error_5);
                // The service/model layer throws a generic error for not found.
                if (error_5.message.toLowerCase().includes('not found')) {
                    return [2 /*return*/, res.status(404).json({ error: error_5.message })];
                }
                res.status(500).json({ error: error_5.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /deliveryAddress/{id}:
 *   delete:
 *     summary: Delete a delivery address by its ID
 *     tags: [Delivery Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the delivery address to delete.
 *     responses:
 *       200:
 *         description: The deleted delivery address.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryAddress'
 *       404:
 *         description: Delivery address not found.
 */
exports.deleteDeliveryAddressController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, deletedAddress, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, deliveryAddress_service_1.deleteDeliveryAddressService(id)];
            case 1:
                deletedAddress = _a.sent();
                res.status(200).json(deletedAddress);
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Error in deleteDeliveryAddressController:', error_6);
                // The service/model layer throws a generic error for not found.
                if (error_6.message.toLowerCase().includes('not found')) {
                    return [2 /*return*/, res.status(404).json({ error: 'Delivery address not found.' })];
                }
                res.status(500).json({ error: error_6.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /deliveryAddress/{id}/set-default:
 *   patch:
 *     summary: Set a delivery address as the default for the authenticated user
 *     tags: [Delivery Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the delivery address to set as default.
 *     responses:
 *       200:
 *         description: The updated default delivery address.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryAddress'
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Delivery address not found.
 *       500:
 *         description: Internal server error.
 */
exports.setDefaultDeliveryAddressController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, addressId, newDefaultAddress, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({ error: 'Unauthorized: User ID not found.' })];
                }
                addressId = req.params.id;
                return [4 /*yield*/, deliveryAddress_service_1.setDefaultDeliveryAddressService(userId, addressId)];
            case 1:
                newDefaultAddress = _a.sent();
                res.status(200).json(newDefaultAddress);
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                console.error('Error in setDefaultDeliveryAddressController:', error_7);
                if (error_7 instanceof client_1.Prisma.PrismaClientKnownRequestError && error_7.code === 'P2025') {
                    return [2 /*return*/, res.status(404).json({ error: 'Delivery address not found or does not belong to the user.' })];
                }
                res.status(500).json({ error: error_7.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
