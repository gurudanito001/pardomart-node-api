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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.approveVendor = exports.publishVendor = exports.getVendorDocumentCounts = exports.getVendorsByUserIdWithProductCount = exports.getVendorsByUserId = exports.deleteVendor = exports.updateVendor = exports.getAllVendors = exports.getVendorById = exports.createVendor = void 0;
// services/vendor.service.ts
var vendorModel = require("../models/vendor.model");
var media_service_1 = require("./media.service");
var rating_service_1 = require("./rating.service");
var prisma_1 = require("../config/prisma");
var toRadians = function (degrees) {
    return degrees * (Math.PI / 180);
};
var calculateDistance = function (lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the Earth in km
    var dLat = toRadians(lat2 - lat1);
    var dLon = toRadians(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
exports.createVendor = function (payload) { return __awaiter(void 0, void 0, Promise, function () {
    var image, vendorData, newVendor, imageBuffer, mockFile, uploadResult, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                image = payload.image, vendorData = __rest(payload, ["image"]);
                return [4 /*yield*/, prisma_1.prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        var vendor;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, vendorModel.createVendor(vendorData, tx)];
                                case 1:
                                    vendor = _a.sent();
                                    // 2. Create a Wallet and link it to the new Vendor
                                    return [4 /*yield*/, tx.wallet.create({
                                            data: {
                                                vendorId: vendor.id
                                            }
                                        })];
                                case 2:
                                    // 2. Create a Wallet and link it to the new Vendor
                                    _a.sent();
                                    return [2 /*return*/, vendor];
                            }
                        });
                    }); })];
            case 1:
                newVendor = _a.sent();
                if (!image) return [3 /*break*/, 5];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                imageBuffer = Buffer.from(image, 'base64');
                mockFile = {
                    fieldname: 'image',
                    originalname: newVendor.id + "-store-image.jpg",
                    encoding: '7bit',
                    mimetype: 'image/jpeg',
                    buffer: imageBuffer,
                    size: imageBuffer.length,
                    stream: new (require('stream').Readable)(),
                    destination: '',
                    filename: '',
                    path: ''
                };
                return [4 /*yield*/, media_service_1.uploadMedia(mockFile, newVendor.id, 'store_image')];
            case 3:
                uploadResult = _a.sent();
                // Update the vendor with the final image URL
                return [2 /*return*/, vendorModel.updateVendor(newVendor.id, { image: uploadResult.cloudinaryResult.secure_url })];
            case 4:
                error_1 = _a.sent();
                console.error('Error uploading vendor image after creation:', error_1);
                return [3 /*break*/, 5];
            case 5: return [4 /*yield*/, exports.getVendorById(newVendor.id)];
            case 6: 
            // 4. Fetch and return the complete vendor data with relations.
            // This ensures the final object is consistent, whether the image was uploaded or not.
            return [2 /*return*/, (_a.sent())];
        }
    });
}); };
exports.getVendorById = function (id, latitude, longitude) { return __awaiter(void 0, void 0, Promise, function () {
    var vendor, _a, rating, documentCount, productCount, _count, vendorData, result, customerLatitude, customerLongitude, distance;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, vendorModel.getVendorById(id)];
            case 1:
                vendor = _d.sent();
                if (!vendor) {
                    return [2 /*return*/, null];
                }
                return [4 /*yield*/, Promise.all([
                        rating_service_1.getAggregateRatingService({ ratedVendorId: vendor.id }),
                        vendorModel.getVendorDocumentCount(vendor.id),
                    ])];
            case 2:
                _a = _d.sent(), rating = _a[0], documentCount = _a[1];
                productCount = (_c = (_b = vendor._count) === null || _b === void 0 ? void 0 : _b.vendorProducts) !== null && _c !== void 0 ? _c : 0;
                _count = vendor._count, vendorData = __rest(vendor, ["_count"]);
                result = __assign(__assign({}, vendorData), { rating: rating || { average: 0, count: 0 }, productCount: productCount,
                    documentCount: documentCount });
                // Now, calculate distance if coordinates are provided
                if (latitude && longitude && result.latitude && result.longitude) {
                    customerLatitude = parseFloat(latitude);
                    customerLongitude = parseFloat(longitude);
                    if (!isNaN(customerLatitude) && !isNaN(customerLongitude)) {
                        distance = calculateDistance(customerLatitude, customerLongitude, result.latitude, result.longitude);
                        result.distance = parseFloat(distance.toFixed(2));
                    }
                }
                return [2 /*return*/, result];
        }
    });
}); };
exports.getAllVendors = function (filters, pagination) { return __awaiter(void 0, void 0, void 0, function () {
    var vendorsResult, vendorIds, ratingsMap, vendorsWithExtras, customerLatitude_1, customerLongitude_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, vendorModel.getAllVendors(filters, pagination)];
            case 1:
                vendorsResult = _a.sent();
                if (vendorsResult.data.length === 0) {
                    return [2 /*return*/, vendorsResult];
                }
                vendorIds = vendorsResult.data.map(function (v) { return v.id; });
                return [4 /*yield*/, rating_service_1.getAggregateRatingsForVendorsService(vendorIds)];
            case 2:
                ratingsMap = _a.sent();
                vendorsWithExtras = vendorsResult.data.map(function (vendor) {
                    var _a, _b, _c;
                    var cartItemCount = ((_c = (_b = (_a = vendor.carts) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b._count) === null || _c === void 0 ? void 0 : _c.items) || 0;
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    var carts = vendor.carts, vendorWithoutCarts = __rest(vendor, ["carts"]);
                    var rating = ratingsMap.get(vendor.id) || { average: 0, count: 0 };
                    return __assign(__assign({}, vendorWithoutCarts), { cartItemCount: cartItemCount, rating: rating });
                });
                if (filters.latitude && filters.longitude) {
                    customerLatitude_1 = parseFloat(filters.latitude);
                    customerLongitude_1 = parseFloat(filters.longitude);
                    if (!isNaN(customerLatitude_1) && !isNaN(customerLongitude_1)) {
                        vendorsWithExtras = vendorsWithExtras.map(function (vendor) {
                            var distance = calculateDistance(customerLatitude_1, customerLongitude_1, vendor.latitude, vendor.longitude);
                            return __assign(__assign({}, vendor), { distance: distance });
                        });
                        // Sort vendors by distance in ascending order
                        vendorsWithExtras.sort(function (a, b) { return a.distance - b.distance; });
                    }
                }
                return [2 /*return*/, __assign(__assign({}, vendorsResult), { data: vendorsWithExtras })];
        }
    });
}); };
exports.updateVendor = function (id, payload) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, vendorModel.updateVendor(id, payload)];
    });
}); };
exports.deleteVendor = function (id) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, vendorModel.deleteVendor(id)];
    });
}); };
exports.getVendorsByUserId = function (userId) { return __awaiter(void 0, void 0, Promise, function () {
    var vendors, vendorIds, ratingsMap, vendorsWithRatings;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, vendorModel.getVendorsByUserId(userId)];
            case 1:
                vendors = _a.sent();
                if (vendors.length === 0) {
                    return [2 /*return*/, []];
                }
                vendorIds = vendors.map(function (v) { return v.id; });
                return [4 /*yield*/, rating_service_1.getAggregateRatingsForVendorsService(vendorIds)];
            case 2:
                ratingsMap = _a.sent();
                vendorsWithRatings = vendors.map(function (vendor) { return (__assign(__assign({}, vendor), { rating: ratingsMap.get(vendor.id) || { average: 0, count: 0 } })); });
                return [2 /*return*/, vendorsWithRatings];
        }
    });
}); };
/**
 * Retrieves all vendors for a user and includes the count of associated products.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to an array of vendors with their product counts.
 */
exports.getVendorsByUserIdWithProductCount = function (userId) {
    return vendorModel.getVendorsByUserIdWithProductCount(userId);
};
/**
 * Retrieves the count of documents for a given list of vendor IDs.
 * @param vendorIds - An array of vendor IDs.
 * @returns A promise that resolves to an array of objects containing vendor ID and document count.
 */
exports.getVendorDocumentCounts = function (vendorIds) {
    return vendorModel.getVendorDocumentCounts(vendorIds);
};
/**
 * Publishes a vendor's store, making it visible to the public.
 *
 * @param vendorId The ID of the vendor to publish.
 * @param userId The ID of the user attempting to publish the store.
 * @returns The updated vendor object.
 * @throws Error if the vendor is not found or if the user is not authorized.
 */
exports.publishVendor = function (vendorId, userId) { return __awaiter(void 0, void 0, Promise, function () {
    var vendor;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, vendorModel.getVendorById(vendorId)];
            case 1:
                vendor = _a.sent();
                if (!vendor) {
                    throw new Error('Vendor not found');
                }
                if (vendor.userId !== userId) {
                    throw new Error('Forbidden: You do not have permission to publish this store.');
                }
                // 2. Perform the update.
                return [2 /*return*/, vendorModel.updateVendor(vendorId, {
                        isPublished: true
                    })];
        }
    });
}); };
/**
 * Approves a vendor's store, marking it as verified.
 * This is typically an admin-only action.
 *
 * @param vendorId The ID of the vendor to approve.
 * @returns The updated vendor object.
 * @throws Error if the vendor is not found.
 */
exports.approveVendor = function (vendorId) { return __awaiter(void 0, void 0, Promise, function () {
    var vendor;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, vendorModel.getVendorById(vendorId)];
            case 1:
                vendor = _a.sent();
                if (!vendor) {
                    throw new Error('Vendor not found');
                }
                // 2. Perform the update.
                return [2 /*return*/, vendorModel.updateVendor(vendorId, {
                        isVerified: true
                    })];
        }
    });
}); };
