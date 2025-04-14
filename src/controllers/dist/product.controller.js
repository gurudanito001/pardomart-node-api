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
exports.deleteVendorProduct = exports.deleteProduct = exports.getVendorProductsByCategory = exports.getAllVendorProducts = exports.getAllProducts = exports.updateVendorProduct = exports.updateProductBase = exports.getVendorProductsByTagIds = exports.getProductsByTagIds = exports.getVendorProductByBarcode = exports.getProductByBarcode = exports.createVendorProductWithBarcode = exports.createVendorProduct = exports.createProduct = void 0;
var productService = require("../services/product.service");
var client_1 = require("@prisma/client");
exports.createProduct = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var product, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, productService.createProduct(req.body)];
            case 1:
                product = _a.sent();
                res.status(201).json(product);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error creating product:', error_1);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.createVendorProduct = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var vendorProduct, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, productService.createVendorProduct(req.body)];
            case 1:
                vendorProduct = _a.sent();
                res.status(201).json(vendorProduct);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error creating vendor product:', error_2);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.createVendorProductWithBarcode = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var vendorProduct, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, productService.createVendorProductWithBarcode(req.body)];
            case 1:
                vendorProduct = _a.sent();
                res.status(201).json(vendorProduct);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                if (error_3 instanceof client_1.Prisma.PrismaClientKnownRequestError && (error_3 === null || error_3 === void 0 ? void 0 : error_3.code) === 'P2002') {
                    // Construct a user-friendly error message
                    return [2 /*return*/, res.status(409).json({
                            error: 'This product is already listed by this vendor.'
                        })];
                }
                console.error('Error creating vendor product with barcode:', error_3);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getProductByBarcode = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var barcode, product, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                barcode = req.query.barcode;
                if (!barcode) {
                    return [2 /*return*/, res.status(400).json({ error: 'Barcode is required' })];
                }
                return [4 /*yield*/, productService.getProductByBarcode(barcode)];
            case 1:
                product = _a.sent();
                if (!product) {
                    return [2 /*return*/, res.status(404).json({ error: 'Product not found' })];
                }
                res.json(product);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Error getting product by barcode:', error_4);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getVendorProductByBarcode = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, barcode, vendorId, vendorProduct, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, barcode = _a.barcode, vendorId = _a.vendorId;
                if (!barcode || !vendorId) {
                    return [2 /*return*/, res.status(400).json({ error: 'Barcode and vendorId are required' })];
                }
                return [4 /*yield*/, productService.getVendorProductByBarcode(barcode, vendorId)];
            case 1:
                vendorProduct = _b.sent();
                if (!vendorProduct) {
                    return [2 /*return*/, res.status(404).json({ error: 'Vendor product not found' })];
                }
                res.json(vendorProduct);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _b.sent();
                console.error('Error getting vendor product by barcode:', error_5);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getProductsByTagIds = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tagIds, tagIdsArray, products, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                tagIds = req.query.tagIds;
                if (!tagIds || typeof tagIds === 'string') {
                    return [2 /*return*/, res.status(400).json({ error: 'tagIds query parameter is required and must be an array' })];
                }
                tagIdsArray = tagIds.map(String);
                return [4 /*yield*/, productService.getProductsByTagIds(tagIdsArray)];
            case 1:
                products = _a.sent();
                res.json(products);
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Error getting products by tag IDs:', error_6);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getVendorProductsByTagIds = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tagIds, tagIdsArray, vendorProducts, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                tagIds = req.query.tagIds;
                if (!tagIds || typeof tagIds === 'string') {
                    return [2 /*return*/, res.status(400).json({ error: 'tagIds query parameter is required and must be an array' })];
                }
                tagIdsArray = tagIds.map(String);
                return [4 /*yield*/, productService.getVendorProductsByTagIds(tagIdsArray)];
            case 1:
                vendorProducts = _a.sent();
                res.json(vendorProducts);
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                console.error('Error getting vendor products by tag IDs:', error_7);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.updateProductBase = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var product, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, productService.updateProductBase(__assign({ id: req.params.id }, req.body))];
            case 1:
                product = _a.sent();
                res.json(product);
                return [3 /*break*/, 3];
            case 2:
                error_8 = _a.sent();
                console.error('Error updating product base:', error_8);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.updateVendorProduct = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var vendorProduct, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, productService.updateVendorProduct(__assign({ id: req.params.id }, req.body))];
            case 1:
                vendorProduct = _a.sent();
                res.json(vendorProduct);
                return [3 /*break*/, 3];
            case 2:
                error_9 = _a.sent();
                console.error('Error updating vendor product:', error_9);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getAllProducts = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var products, error_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, productService.getAllProducts()];
            case 1:
                products = _a.sent();
                res.json(products);
                return [3 /*break*/, 3];
            case 2:
                error_10 = _a.sent();
                console.error('Error getting all products:', error_10);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getAllVendorProducts = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var vendorId, vendorProducts, error_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                vendorId = req.query.vendorId;
                if (!vendorId) {
                    return [2 /*return*/, res.status(400).json({ error: 'vendorId is required' })];
                }
                return [4 /*yield*/, productService.getAllVendorProducts(vendorId)];
            case 1:
                vendorProducts = _a.sent();
                res.json(vendorProducts);
                return [3 /*break*/, 3];
            case 2:
                error_11 = _a.sent();
                console.error('Error getting vendor products:', error_11);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getVendorProductsByCategory = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, vendorId, categoryId, vendorProducts, error_12;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, vendorId = _a.vendorId, categoryId = _a.categoryId;
                if (!vendorId || !categoryId) {
                    return [2 /*return*/, res.status(400).json({ error: 'Vendor ID and Category ID are required' })];
                }
                return [4 /*yield*/, productService.getVendorProductsByCategory(vendorId, categoryId)];
            case 1:
                vendorProducts = _b.sent();
                res.json(vendorProducts);
                return [3 /*break*/, 3];
            case 2:
                error_12 = _b.sent();
                console.error('Error getting vendor products by category:', error_12);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.deleteProduct = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var product, error_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, productService.deleteProduct(req.params.id)];
            case 1:
                product = _a.sent();
                res.json(product);
                return [3 /*break*/, 3];
            case 2:
                error_13 = _a.sent();
                console.error('Error deleting product:', error_13);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.deleteVendorProduct = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var vendorProduct, error_14;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, productService.deleteVendorProduct(req.params.id)];
            case 1:
                vendorProduct = _a.sent();
                res.json(vendorProduct);
                return [3 /*break*/, 3];
            case 2:
                error_14 = _a.sent();
                console.error('Error deleting vendor product:', error_14);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
