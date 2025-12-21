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
exports.calculateOrderFeesService = exports.getCurrentFees = exports.deactivateFee = exports.deleteFee = exports.updateFee = exports.createFee = void 0;
var client_1 = require("@prisma/client");
var geolib_1 = require("geolib");
var prisma = new client_1.PrismaClient();
// --- Fee Service Functions ---
/**
 * Creates a new fee record. If 'isActive' is true, it deactivates any existing
 * active fee of the same type to ensure only one active fee per type.
 *
 * @param payload The data for the new fee.
 * @returns The newly created Fee object.
 * @throws Error if creation fails or if a unique constraint is violated unexpectedly.
 */
exports.createFee = function (payload) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                var newFee;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!payload.isActive) return [3 /*break*/, 2];
                            return [4 /*yield*/, tx.fee.updateMany({
                                    where: {
                                        type: payload.type,
                                        isActive: true
                                    },
                                    data: {
                                        isActive: false
                                    }
                                })];
                        case 1:
                            _b.sent();
                            _b.label = 2;
                        case 2: return [4 /*yield*/, tx.fee.create({
                                data: {
                                    type: payload.type,
                                    amount: payload.amount,
                                    method: payload.method,
                                    unit: payload.unit,
                                    minThreshold: payload.minThreshold,
                                    maxThreshold: payload.maxThreshold,
                                    thresholdAppliesTo: payload.thresholdAppliesTo,
                                    isActive: (_a = payload.isActive) !== null && _a !== void 0 ? _a : false
                                }
                            })];
                        case 3:
                            newFee = _b.sent();
                            return [2 /*return*/, newFee];
                    }
                });
            }); })];
    });
}); };
/**
 * Updates an existing fee record. If 'isActive' is set to true, it deactivates
 * any other currently active fee of the same type.
 *
 * @param id The ID of the fee to update.
 * @param payload The data to update the fee with.
 * @returns The updated Fee object.
 * @throws Error if the fee is not found or update fails.
 */
exports.updateFee = function (id, payload) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                var existingFee, updatedFee;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, tx.fee.findUnique({ where: { id: id } })];
                        case 1:
                            existingFee = _a.sent();
                            if (!existingFee) {
                                throw new Error('Fee not found');
                            }
                            if (!(payload.isActive === true)) return [3 /*break*/, 3];
                            return [4 /*yield*/, tx.fee.updateMany({
                                    where: {
                                        type: existingFee.type,
                                        isActive: true,
                                        id: { not: id }
                                    },
                                    data: {
                                        isActive: false
                                    }
                                })];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [4 /*yield*/, tx.fee.update({
                                where: { id: id },
                                data: payload
                            })];
                        case 4:
                            updatedFee = _a.sent();
                            return [2 /*return*/, updatedFee];
                    }
                });
            }); })];
    });
}); };
/**
 * Deletes a fee record by its ID.
 *
 * @param id The ID of the fee to delete.
 * @returns The deleted Fee object.
 * @throws Error if the fee is not found or deletion fails.
 */
exports.deleteFee = function (id) { return __awaiter(void 0, void 0, Promise, function () {
    var deletedFee, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.fee["delete"]({
                        where: { id: id }
                    })];
            case 1:
                deletedFee = _a.sent();
                return [2 /*return*/, deletedFee];
            case 2:
                error_1 = _a.sent();
                if (error_1.code === 'P2025') { // Prisma error code for record not found
                    throw new Error('Fee not found');
                }
                console.error('Error deleting fee:', error_1);
                throw new Error('Failed to delete fee: ' + error_1.message);
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Deactivates the currently active fee for a specific type.
 *
 * @param type The FeeType to deactivate.
 * @returns The deactivated Fee object, or null if no active fee was found.
 * @throws Error if deactivation fails.
 */
exports.deactivateFee = function (type) { return __awaiter(void 0, void 0, Promise, function () {
    var activeFee, deactivatedFee, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, prisma.fee.findFirst({
                        where: {
                            type: type,
                            isActive: true
                        }
                    })];
            case 1:
                activeFee = _a.sent();
                if (!activeFee) return [3 /*break*/, 3];
                return [4 /*yield*/, prisma.fee.update({
                        where: { id: activeFee.id },
                        data: { isActive: false }
                    })];
            case 2:
                deactivatedFee = _a.sent();
                return [2 /*return*/, deactivatedFee];
            case 3: return [2 /*return*/, null]; // No active fee found for this type
            case 4:
                error_2 = _a.sent();
                console.error("Error deactivating fee of type " + type + ":", error_2);
                throw new Error("Failed to deactivate fee of type " + type + ": " + error_2.message);
            case 5: return [2 /*return*/];
        }
    });
}); };
/**
 * Retrieves the currently active fee(s).
 *
 * @param type Optional. If provided, retrieves the active fee for that specific type.
 * If not provided, retrieves all currently active fees.
 * @returns A single Fee object if type is provided, or an array of Fee objects.
 * Returns null or an empty array if no active fees are found.
 */
exports.getCurrentFees = function (type) { return __awaiter(void 0, void 0, Promise, function () {
    var fee, fees, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                if (!type) return [3 /*break*/, 2];
                return [4 /*yield*/, prisma.fee.findFirst({
                        where: {
                            type: type,
                            isActive: true
                        }
                    })];
            case 1:
                fee = _a.sent();
                return [2 /*return*/, fee];
            case 2: return [4 /*yield*/, prisma.fee.findMany({
                    where: {
                        isActive: true
                    }
                })];
            case 3:
                fees = _a.sent();
                return [2 /*return*/, fees];
            case 4: return [3 /*break*/, 6];
            case 5:
                error_3 = _a.sent();
                console.error('Error getting current fees:', error_3);
                throw new Error('Failed to retrieve current fees: ' + error_3.message);
            case 6: return [2 /*return*/];
        }
    });
}); };
/**
 * Converts degrees to radians for geographical calculations.
 * @param degrees Angle in degrees.
 * @returns Angle in radians.
 */
var toRadians = function (degrees) {
    return degrees * (Math.PI / 180);
};
/**
 * Calculates the distance between two geographical coordinates using the Haversine formula.
 * @param lat1 Latitude of the first point.
 * @param lon1 Longitude of the first point.
 * @param lat2 Latitude of the second point.
 * @param lon2 Longitude of the second point.
 * @param unit The unit of distance: 'km' for kilometers, 'miles' for miles, defaults to 'km'.
 * @returns The distance between the two points in the specified unit.
 */
/**
 * Service function to calculate all applicable fees for a given order request.
 *
 * @param payload - Contains order items, vendor ID, and delivery address ID.
 * @returns A promise that resolves to an object containing calculated fees.
 * @throws Error if data is invalid, not found, or calculations fail.
 */
exports.calculateOrderFeesService = function (payload, tx) { return __awaiter(void 0, void 0, Promise, function () {
    var prismaClient, orderItems, vendorId, deliveryAddressId, vendor, deliveryAddress, uniqueVendorProductIds, vendorProducts, productDetailsMap_1, activeFees, feeConfigMap_1, subtotal, totalItemCount, _i, orderItems_1, item, productDetails, shoppingFee, deliveryFee, serviceFee, shoppingFeeConfig, deliveryFeeConfig, distanceMeters, distanceInConfigUnit, serviceFeeConfig, totalEstimatedCost, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                prismaClient = tx || prisma;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                orderItems = payload.orderItems, vendorId = payload.vendorId, deliveryAddressId = payload.deliveryAddressId;
                // --- 1. Input Validation ---
                if (!orderItems || orderItems.length === 0) {
                    throw new Error('Order items cannot be empty.');
                }
                if (!vendorId) {
                    throw new Error('Vendor ID is required.');
                }
                if (!deliveryAddressId) {
                    throw new Error('Delivery address ID is required.');
                }
                return [4 /*yield*/, prismaClient.vendor.findUnique({
                        where: { id: vendorId },
                        select: { latitude: true, longitude: true }
                    })];
            case 2:
                vendor = _a.sent();
                if (!vendor || vendor.latitude === null || vendor.longitude === null) {
                    throw new Error('Vendor location not found or invalid.');
                }
                return [4 /*yield*/, prismaClient.deliveryAddress.findUnique({
                        where: { id: deliveryAddressId },
                        select: { latitude: true, longitude: true }
                    })];
            case 3:
                deliveryAddress = _a.sent();
                if (!deliveryAddress || deliveryAddress.latitude === null || deliveryAddress.longitude === null) {
                    throw new Error('Delivery address location not found or invalid.');
                }
                uniqueVendorProductIds = orderItems.map(function (item) { return item.vendorProductId; });
                return [4 /*yield*/, prismaClient.vendorProduct.findMany({
                        where: {
                            id: {
                                "in": uniqueVendorProductIds
                            }
                        },
                        select: {
                            id: true,
                            price: true,
                            isAvailable: true
                        }
                    })];
            case 4:
                vendorProducts = _a.sent();
                productDetailsMap_1 = new Map();
                vendorProducts.forEach(function (vp) { return productDetailsMap_1.set(vp.id, { price: vp.price, isAvailable: vp.isAvailable }); });
                return [4 /*yield*/, prismaClient.fee.findMany({
                        where: {
                            isActive: true,
                            type: {
                                "in": [client_1.FeeType.shopping, client_1.FeeType.delivery, client_1.FeeType.service] // Using lowercase enum values
                            }
                        }
                    })];
            case 5:
                activeFees = _a.sent();
                console.log('Active Fees:', activeFees);
                feeConfigMap_1 = new Map();
                activeFees.forEach(function (fee) { return feeConfigMap_1.set(fee.type, fee); });
                subtotal = 0;
                totalItemCount = 0;
                for (_i = 0, orderItems_1 = orderItems; _i < orderItems_1.length; _i++) {
                    item = orderItems_1[_i];
                    productDetails = productDetailsMap_1.get(item.vendorProductId);
                    if (!productDetails) {
                        throw new Error("Price not found for vendor product ID: " + item.vendorProductId);
                    }
                    if (!productDetails.isAvailable) {
                        throw new Error("Product ID " + item.vendorProductId + " is not available.");
                    }
                    subtotal += productDetails.price * item.quantity;
                    totalItemCount += item.quantity;
                }
                shoppingFee = 0;
                deliveryFee = 0;
                serviceFee = 0;
                shoppingFeeConfig = feeConfigMap_1.get(client_1.FeeType.shopping);
                if (shoppingFeeConfig && shoppingFeeConfig.method === client_1.FeeCalculationMethod.per_unit) {
                    shoppingFee = totalItemCount * shoppingFeeConfig.amount;
                }
                deliveryFeeConfig = feeConfigMap_1.get(client_1.FeeType.delivery);
                if (deliveryFeeConfig && deliveryFeeConfig.method === client_1.FeeCalculationMethod.per_distance) {
                    distanceMeters = geolib_1.getDistance({ latitude: vendor.latitude, longitude: vendor.longitude }, { latitude: deliveryAddress.latitude, longitude: deliveryAddress.longitude });
                    distanceInConfigUnit = void 0;
                    if (deliveryFeeConfig.unit === 'km') {
                        distanceInConfigUnit = distanceMeters / 1000; // Convert meters to kilometers
                    }
                    else if (deliveryFeeConfig.unit === 'miles') {
                        distanceInConfigUnit = distanceMeters / 1609.34; // Convert meters to miles
                    }
                    else {
                        // Fallback or error if unit is not recognized; defaulting to km
                        console.warn("Unknown unit for delivery fee: " + deliveryFeeConfig.unit + ". Defaulting to kilometers.");
                        distanceInConfigUnit = distanceMeters / 1000;
                    }
                    deliveryFee = distanceInConfigUnit * deliveryFeeConfig.amount;
                    // Apply minThreshold if set
                    if (deliveryFeeConfig.minThreshold !== null && deliveryFee < deliveryFeeConfig.minThreshold) {
                        deliveryFee = deliveryFeeConfig.minThreshold;
                    }
                }
                serviceFeeConfig = feeConfigMap_1.get(client_1.FeeType.service);
                if (serviceFeeConfig && serviceFeeConfig.method === client_1.FeeCalculationMethod.percentage) {
                    // Check if subtotal meets the minThreshold for service fee
                    if (serviceFeeConfig.minThreshold === null || subtotal >= serviceFeeConfig.minThreshold) {
                        serviceFee = subtotal * serviceFeeConfig.amount;
                    }
                }
                else if (serviceFeeConfig && serviceFeeConfig.method === client_1.FeeCalculationMethod.flat) {
                    if (serviceFeeConfig.minThreshold === null || subtotal >= serviceFeeConfig.minThreshold) {
                        serviceFee = serviceFeeConfig.amount;
                    }
                }
                // Round fees to two decimal places
                shoppingFee = parseFloat(shoppingFee.toFixed(2));
                deliveryFee = parseFloat(deliveryFee.toFixed(2));
                serviceFee = parseFloat(serviceFee.toFixed(2));
                totalEstimatedCost = subtotal + shoppingFee + deliveryFee + serviceFee;
                return [2 /*return*/, {
                        subtotal: parseFloat(subtotal.toFixed(2)),
                        shoppingFee: shoppingFee,
                        deliveryFee: deliveryFee,
                        serviceFee: serviceFee,
                        totalEstimatedCost: parseFloat(totalEstimatedCost.toFixed(2))
                    }];
            case 6:
                error_4 = _a.sent();
                console.error('Error calculating order fees:', error_4);
                throw new Error("Failed to calculate fees: " + error_4.message);
            case 7: return [2 /*return*/];
        }
    });
}); };
