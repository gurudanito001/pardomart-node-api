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
/**
 * Controller for creating a new delivery address.
 * POST /addresses
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
                // Basic validation
                if (!payload.addressLine1 || !payload.city) {
                    return [2 /*return*/, res.status(400).json({ error: 'Address Line 1 and City are required.' })];
                }
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
 * Controller for getting a delivery address by ID.
 * GET /addresses/:id
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
 * Controller for getting all delivery addresses for the authenticated user.
 * GET /addresses/me
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
 * Controller for getting the default delivery address for the authenticated user.
 * GET /addresses/me/default
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
 * Controller for updating a delivery address.
 * PUT /addresses/:id
 */
exports.updateDeliveryAddressController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, payload, updatedAddress, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                payload = req.body;
                // Basic validation
                if (Object.keys(payload).length === 0) {
                    return [2 /*return*/, res.status(400).json({ error: 'No update data provided.' })];
                }
                return [4 /*yield*/, deliveryAddress_service_1.updateDeliveryAddressService(id, payload)];
            case 1:
                updatedAddress = _a.sent();
                res.status(200).json(updatedAddress);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Error in updateDeliveryAddressController:', error_5);
                if (error_5.message === 'Delivery address not found') {
                    return [2 /*return*/, res.status(404).json({ error: error_5.message })];
                }
                res.status(500).json({ error: error_5.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Controller for deleting a delivery address.
 * DELETE /addresses/:id
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
                if (error_6.message === 'Delivery address not found') {
                    return [2 /*return*/, res.status(404).json({ error: error_6.message })];
                }
                res.status(500).json({ error: error_6.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Controller for setting a delivery address as default.
 * PATCH /addresses/:id/set-default
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
                if (error_7.message === 'Delivery address not found') {
                    return [2 /*return*/, res.status(404).json({ error: error_7.message })];
                }
                res.status(500).json({ error: error_7.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
