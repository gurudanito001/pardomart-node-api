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
exports.getTrendingVendorProductsService = exports.deleteVendorProduct = exports.deleteProduct = exports.getVendorProductsByUser = exports.getVendorProductsByCategory = exports.getAllVendorProducts = exports.getAllProducts = exports.updateVendorProduct = exports.updateProductBase = exports.getVendorProductsByTagIds = exports.getProductsByTagIds = exports.getVendorProductByBarcode = exports.getProductByBarcode = exports.createVendorProductWithBarcode = exports.getVendorProductById = exports.createProduct = exports.createVendorProduct = void 0;
var productModel = require("../models/product.model");
var vendorModel = require("../models/vendor.model");
var media_service_1 = require("./media.service");
var uuid_1 = require("uuid");
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
                                return [2 /*return*/, uploadResult.secure_url];
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
    var vendor, images, productData, processedImageUrls, vendorProductId, finalPayload;
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
                vendorProductId = uuid_1.v4();
                if (!(images && images.length > 0)) return [3 /*break*/, 3];
                return [4 /*yield*/, uploadImages(images, vendorProductId)];
            case 2:
                processedImageUrls = _a.sent();
                _a.label = 3;
            case 3:
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
    var vendor, images, barcode, productData, productId, existingProduct, newProduct, vendorProductId, processedImageUrls, vendorProductPayload;
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
            case 5:
                vendorProductId = uuid_1.v4();
                processedImageUrls = [];
                if (!(images && images.length > 0)) return [3 /*break*/, 7];
                return [4 /*yield*/, uploadImages(images, vendorProductId)];
            case 6:
                processedImageUrls = _a.sent();
                _a.label = 7;
            case 7:
                vendorProductPayload = __assign(__assign({}, productData), { id: vendorProductId, productId: productId, images: processedImageUrls });
                return [2 /*return*/, productModel.createVendorProduct(vendorProductPayload)];
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
exports.deleteVendorProduct = function (id) { return productModel.deleteVendorProduct(id); };
exports.getTrendingVendorProductsService = function (filters, pagination) { return productModel.getTrendingVendorProducts(filters, pagination); };
