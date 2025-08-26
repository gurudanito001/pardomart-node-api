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
exports.setDefaultDeliveryAddressService = exports.deleteDeliveryAddressService = exports.updateDeliveryAddressService = exports.getDefaultDeliveryAddressByUserIdService = exports.getDeliveryAddressesByUserIdService = exports.getDeliveryAddressByIdService = exports.createDeliveryAddressService = void 0;
var deliveryAddressModel = require("../models/deliveryAddress.model"); // Adjust this path as needed
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
// --- DeliveryAddress Service Functions ---
/**
 * Creates a new delivery address for a user.
 * @param payload The data for the new delivery address.
 * @returns The newly created DeliveryAddress object.
 */
exports.createDeliveryAddressService = function (payload, tx) { return __awaiter(void 0, void 0, Promise, function () {
    var createAddressInTx;
    return __generator(this, function (_a) {
        createAddressInTx = function (prismaClient) { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!payload.isDefault) return [3 /*break*/, 2];
                        // Deactivate any other default address for this user
                        return [4 /*yield*/, prismaClient.deliveryAddress.updateMany({
                                where: {
                                    userId: payload.userId,
                                    isDefault: true
                                },
                                data: {
                                    isDefault: false
                                }
                            })];
                    case 1:
                        // Deactivate any other default address for this user
                        _b.sent();
                        _b.label = 2;
                    case 2: 
                    // The model function now simply creates the record
                    return [2 /*return*/, deliveryAddressModel.createDeliveryAddress(__assign(__assign({}, payload), { isDefault: (_a = payload.isDefault) !== null && _a !== void 0 ? _a : false }), prismaClient)];
                }
            });
        }); };
        if (tx) {
            return [2 /*return*/, createAddressInTx(tx)];
        }
        else {
            return [2 /*return*/, prisma.$transaction(createAddressInTx)];
        }
        return [2 /*return*/];
    });
}); };
/**
 * Retrieves a delivery address by its ID.
 * @param id The ID of the delivery address.
 * @returns The DeliveryAddress object or null if not found.
 */
exports.getDeliveryAddressByIdService = function (id) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, deliveryAddressModel.getDeliveryAddressById(id)];
    });
}); };
/**
 * Retrieves all delivery addresses for a specific user.
 * @param userId The ID of the user.
 * @returns An array of DeliveryAddress objects.
 */
exports.getDeliveryAddressesByUserIdService = function (userId) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, deliveryAddressModel.getDeliveryAddressesByUserId(userId)];
    });
}); };
/**
 * Retrieves the default delivery address for a specific user.
 * @param userId The ID of the user.
 * @returns The default DeliveryAddress object or null if not found.
 */
exports.getDefaultDeliveryAddressByUserIdService = function (userId) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, deliveryAddressModel.getDefaultDeliveryAddressByUserId(userId)];
    });
}); };
/**
 * Updates an existing delivery address.
 * @param id The ID of the delivery address to update.
 * @param payload The data to update the address with.
 * @returns The updated DeliveryAddress object.
 */
exports.updateDeliveryAddressService = function (id, payload) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, deliveryAddressModel.updateDeliveryAddress(id, payload)];
    });
}); };
/**
 * Deletes a delivery address by its ID.
 * @param id The ID of the delivery address to delete.
 * @returns The deleted DeliveryAddress object.
 */
exports.deleteDeliveryAddressService = function (id) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, deliveryAddressModel.deleteDeliveryAddress(id)];
    });
}); };
/**
 * Sets a specific delivery address as the default for a user.
 * @param userId The ID of the user.
 * @param addressId The ID of the address to set as default.
 * @returns The newly defaulted DeliveryAddress object.
 */
exports.setDefaultDeliveryAddressService = function (userId, addressId) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, deliveryAddressModel.setDefaultDeliveryAddress(userId, addressId)];
    });
}); };
