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
exports.transferVendorProductsService = exports.deleteVendorProduct = exports.getTrendingVendorProductsService = exports.deleteProduct = exports.getVendorProductsByUser = exports.getVendorProductsByCategory = exports.getAllVendorProducts = exports.getAllProducts = exports.updateVendorProduct = exports.updateProductBase = exports.getVendorProductsByTagIds = exports.getProductsByTagIds = exports.getVendorProductByBarcode = exports.getProductByBarcode = exports.getMyVendorProductsService = exports.createVendorProductWithBarcode = exports.getVendorProductById = exports.createProduct = exports.createVendorProduct = void 0;
// services/product.service.ts
var client_1 = require("@prisma/client");
var productModel = require("../models/product.model");
var vendorModel = require("../models/vendor.model");
var media_service_1 = require("./media.service");
/**
 * Uploads an array of base64 encoded images to Cloudinary.
 *
 * @param images - An array of base64 image strings.
 * @param referenceId - A reference ID (like vendorProductId or productId) for naming.
 * @returns A promise that resolves to an array of secure Cloudinary URLs.
 */
var uploadImages = function (images, referenceId) { return __awaiter(void 0, void 0, Promise, function () {
    var imageUrls, uploadPromises, results;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                imageUrls = [];
                if (!images || images.length === 0) {
                    return [2 /*return*/, imageUrls];
                }
                uploadPromises = images.map(function (base64Image, index) { return __awaiter(void 0, void 0, void 0, function () {
                    var imageBuffer, mockFile, uploadResult, error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                // Skip if the "image" is already a URL
                                if (base64Image.startsWith('http')) {
                                    return [2 /*return*/, base64Image];
                                }
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                imageBuffer = Buffer.from(base64Image, 'base64');
                                mockFile = {
                                    fieldname: 'image',
                                    originalname: referenceId + "-product-image-" + index + ".jpg",
                                    encoding: '7bit',
                                    mimetype: 'image/jpeg',
                                    buffer: imageBuffer,
                                    size: imageBuffer.length,
                                    stream: new (require('stream').Readable)(),
                                    destination: '',
                                    filename: '',
                                    path: ''
                                };
                                return [4 /*yield*/, media_service_1.uploadMedia(mockFile, referenceId, 'product_image')];
                            case 2:
                                uploadResult = _a.sent();
                                return [2 /*return*/, uploadResult.cloudinaryResult.secure_url];
                            case 3:
                                error_1 = _a.sent();
                                console.error("Error uploading product image at index " + index + ":", error_1);
                                // Return null or an empty string to signify failure for this image
                                return [2 /*return*/, null];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); });
                return [4 /*yield*/, Promise.all(uploadPromises)];
            case 1:
                results = _a.sent();
                // Filter out any null results from failed uploads
                return [2 /*return*/, results.filter(function (url) { return url !== null; })];
        }
    });
}); };
/**
 * Creates a new vendor-specific product, verifying ownership and handling image uploads.
 * @param payload - The data for creating the vendor product.
 * @param ownerId - The ID of the user (vendor owner) making the request.
 * @returns The created vendor product with its relations.
 */
exports.createVendorProduct = function (payload, ownerId) { return __awaiter(void 0, void 0, Promise, function () {
    var vendor, images, productData, processedImageUrls, uuidv4, vendorProductId, finalPayload;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, vendorModel.getVendorById(payload.vendorId)];
            case 1:
                vendor = _a.sent();
                if (!vendor || vendor.userId !== ownerId) {
                    throw new Error('Unauthorized: You do not own this vendor.');
                }
                images = payload.images, productData = __rest(payload, ["images"]);
                processedImageUrls = [];
                return [4 /*yield*/, Promise.resolve().then(function () { return require('uuid'); })];
            case 2:
                uuidv4 = (_a.sent()).v4;
                vendorProductId = uuidv4();
                if (!(images && images.length > 0)) return [3 /*break*/, 4];
                return [4 /*yield*/, uploadImages(images, vendorProductId)];
            case 3:
                processedImageUrls = _a.sent();
                _a.label = 4;
            case 4:
                finalPayload = __assign(__assign({}, productData), { id: vendorProductId, images: processedImageUrls });
                return [2 /*return*/, productModel.createVendorProduct(finalPayload)];
        }
    });
}); };
// Keep other service functions from the original file if they exist.
// For this example, I'm only adding the createVendorProduct service.
// The following are placeholders for other functions from your controller.
exports.createProduct = function (payload) { return productModel.createProduct(payload); };
exports.getVendorProductById = function (id) { return productModel.getVendorProductById(id); };
/**
 * Creates a vendor product from a barcode, handling image uploads.
 * If the base product doesn't exist, it's created.
 * @param ownerId - The ID of the user (vendor owner) making the request.
 * @param payload - The data for creating the vendor product, including barcode and images.
 * @returns The created vendor product with its relations.
 */
exports.createVendorProductWithBarcode = function (payload, ownerId) { return __awaiter(void 0, void 0, Promise, function () {
    var vendor, images, barcode, productData, productId, existingProduct, newProduct, uuidv4, vendorProductId, processedImageUrls, vendorProductPayload;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, vendorModel.getVendorById(payload.vendorId)];
            case 1:
                vendor = _a.sent();
                if (!vendor || vendor.userId !== ownerId) {
                    throw new Error('Unauthorized: You do not own this vendor.');
                }
                images = payload.images, barcode = payload.barcode, productData = __rest(payload, ["images", "barcode"]);
                return [4 /*yield*/, productModel.getProductByBarcode(payload.barcode)];
            case 2:
                existingProduct = _a.sent();
                if (!!existingProduct) return [3 /*break*/, 4];
                return [4 /*yield*/, productModel.createProduct({
                        barcode: payload.barcode,
                        name: payload.name || 'Default Product Name',
                        description: payload.description,
                        images: [],
                        attributes: payload.attributes,
                        categoryIds: payload.categoryIds || [],
                        tagIds: payload.tagIds || []
                    })];
            case 3:
                newProduct = _a.sent();
                productId = newProduct.id;
                return [3 /*break*/, 5];
            case 4:
                productId = existingProduct.id;
                _a.label = 5;
            case 5: return [4 /*yield*/, Promise.resolve().then(function () { return require('uuid'); })];
            case 6:
                uuidv4 = (_a.sent()).v4;
                vendorProductId = uuidv4();
                processedImageUrls = [];
                if (!(images && images.length > 0)) return [3 /*break*/, 8];
                return [4 /*yield*/, uploadImages(images, vendorProductId)];
            case 7:
                processedImageUrls = _a.sent();
                _a.label = 8;
            case 8:
                vendorProductPayload = __assign(__assign({}, productData), { id: vendorProductId, productId: productId, images: processedImageUrls });
                return [2 /*return*/, productModel.createVendorProduct(vendorProductPayload)];
        }
    });
}); };
/**
 * Retrieves all vendor products across all stores owned by a specific vendor user.
 * @param ownerId - The ID of the vendor owner.
 * @param vendorId - Optional. The ID of a specific store to filter by.
 * @param pagination - Pagination options.
 * @returns A list of all vendor products.
 */
exports.getMyVendorProductsService = function (ownerId, vendorId, pagination) { return __awaiter(void 0, void 0, void 0, function () {
    var vendor;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!vendorId) return [3 /*break*/, 2];
                return [4 /*yield*/, vendorModel.getVendorById(vendorId)];
            case 1:
                vendor = _a.sent();
                if (!vendor || vendor.userId !== ownerId) {
                    throw new Error('Forbidden: You do not own this store or the store does not exist.');
                }
                _a.label = 2;
            case 2: 
            // Now, call the model with the owner's ID and the validated (or undefined) vendorId.
            return [2 /*return*/, productModel.getVendorProductsByOwnerId(ownerId, vendorId, pagination)];
        }
    });
}); };
exports.getProductByBarcode = function (barcode) { return productModel.getProductByBarcode(barcode); };
exports.getVendorProductByBarcode = function (barcode, vendorId) { return productModel.getVendorProductByBarcode(barcode, vendorId); };
exports.getProductsByTagIds = function (tagIds) { return productModel.getProductsByTagIds(tagIds); };
exports.getVendorProductsByTagIds = function (tagIds) { return productModel.getVendorProductsByTagIds(tagIds); };
exports.updateProductBase = function (payload) { return productModel.updateProductBase(payload); };
exports.updateVendorProduct = function (payload) { return productModel.updateVendorProduct(payload); };
exports.getAllProducts = function () { return productModel.getAllProducts(); };
exports.getAllVendorProducts = function (filters, pagination) { return productModel.getAllVendorProducts(filters, pagination); };
exports.getVendorProductsByCategory = function (vendorId, categoryId) { return productModel.getVendorProductsByCategory(vendorId, categoryId); };
exports.getVendorProductsByUser = function (userId) { return productModel.getVendorProductsByUserId(userId); };
exports.deleteProduct = function (id) { return productModel.deleteProduct(id); };
exports.getTrendingVendorProductsService = function (filters, pagination) { return productModel.getTrendingVendorProducts(filters, pagination); };
/**
 * Deletes a vendor-specific product, ensuring the user has ownership.
 * @param vendorProductId The ID of the vendor product to delete.
 * @param requestingUserId The ID of the user making the request.
 * @param requestingUserRole The role of the user making the request.
 * @param staffVendorId The vendor ID from the staff member's token.
 * @returns The deleted vendor product.
 */
exports.deleteVendorProduct = function (vendorProductId, requestingUserId, requestingUserRole, staffVendorId) { return __awaiter(void 0, void 0, Promise, function () {
    var productToDelete;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, productModel.getVendorProductById(vendorProductId)];
            case 1:
                productToDelete = _a.sent();
                if (!productToDelete) {
                    throw new Error('Vendor product not found.');
                }
                if (requestingUserRole === client_1.Role.vendor) {
                    if (productToDelete.vendor.userId !== requestingUserId) {
                        throw new Error('Forbidden: You do not own the store this product belongs to.');
                    }
                }
                else if (requestingUserRole === client_1.Role.store_admin) {
                    if (productToDelete.vendorId !== staffVendorId) {
                        throw new Error('Forbidden: You can only delete products from your assigned store.');
                    }
                }
                else {
                    throw new Error('Forbidden: You do not have permission to delete this product.');
                }
                return [2 /*return*/, productModel.deleteVendorProduct(vendorProductId)];
        }
    });
}); };
/**
 * Transfers a vendor product from a source store to multiple target stores.
 * @param ownerId The ID of the vendor owner making the request.
 * @param sourceVendorProductIds An array of product listing IDs to copy.
 * @param targetVendorIds An array of store IDs to copy the product to.
 * @returns An object summarizing the transferred and skipped products.
 */
exports.transferVendorProductsService = function (ownerId, sourceVendorProductIds, targetVendorIds) { return __awaiter(void 0, void 0, void 0, function () {
    var ownedVendors, ownedVendorIds, _i, targetVendorIds_1, targetId, sourceProducts, sourceProductMap, _a, sourceVendorProductIds_1, sourceId, product, results, successfulTransfers, skippedTransfers, _b, sourceProducts_1, sourceProduct, result;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, vendorModel.getVendorsByUserId(ownerId)];
            case 1:
                ownedVendors = _c.sent();
                ownedVendorIds = new Set(ownedVendors.map(function (v) { return v.id; }));
                for (_i = 0, targetVendorIds_1 = targetVendorIds; _i < targetVendorIds_1.length; _i++) {
                    targetId = targetVendorIds_1[_i];
                    if (!ownedVendorIds.has(targetId)) {
                        throw new Error("Forbidden: You do not own the target store with ID " + targetId + ".");
                    }
                }
                return [4 /*yield*/, productModel.getVendorProductsByIds(sourceVendorProductIds)];
            case 2:
                sourceProducts = _c.sent();
                sourceProductMap = new Map(sourceProducts.map(function (p) { return [p.id, p]; }));
                for (_a = 0, sourceVendorProductIds_1 = sourceVendorProductIds; _a < sourceVendorProductIds_1.length; _a++) {
                    sourceId = sourceVendorProductIds_1[_a];
                    product = sourceProductMap.get(sourceId);
                    if (!product) {
                        throw new Error("Source product with ID " + sourceId + " not found.");
                    }
                    if (product.vendor.userId !== ownerId) {
                        throw new Error("Forbidden: You do not own the source product with ID " + sourceId + ".");
                    }
                }
                results = [];
                successfulTransfers = 0;
                skippedTransfers = 0;
                _b = 0, sourceProducts_1 = sourceProducts;
                _c.label = 3;
            case 3:
                if (!(_b < sourceProducts_1.length)) return [3 /*break*/, 6];
                sourceProduct = sourceProducts_1[_b];
                return [4 /*yield*/, productModel.transferVendorProducts(sourceProduct, targetVendorIds)];
            case 4:
                result = _c.sent();
                successfulTransfers += result.transferred.length;
                skippedTransfers += result.skipped.length;
                results.push({
                    sourceVendorProductId: sourceProduct.id,
                    transferredTo: result.transferred,
                    skippedFor: result.skipped
                });
                _c.label = 5;
            case 5:
                _b++;
                return [3 /*break*/, 3];
            case 6: 
            // Optional: Invalidate cache or trigger re-indexing for the new products if needed.
            return [2 /*return*/, {
                    successfulTransfers: successfulTransfers,
                    skippedTransfers: skippedTransfers,
                    details: results
                }];
        }
    });
}); };
