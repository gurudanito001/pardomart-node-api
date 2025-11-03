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
exports.transferVendorProductsController = exports.getMyVendorProductsController = exports.getTrendingVendorProducts = exports.deleteVendorProduct = exports.updateProductStatusController = exports.deleteProduct = exports.getVendorProductsByUserController = exports.getVendorProductsByCategory = exports.getAllVendorProducts = exports.adminGetAllProductsController = exports.getAllProducts = exports.updateVendorProduct = exports.updateProductBase = exports.getVendorProductsByTagIds = exports.getProductsByTagIds = exports.getVendorProductByBarcode = exports.getProductByBarcode = exports.createVendorProductWithBarcode = exports.getVendorProductById = exports.getVendorProductsForProductController = exports.createVendorProduct = exports.getProductOverviewController = exports.createProduct = void 0;
var productService = require("../services/product.service");
var client_1 = require("@prisma/client");
/**
 * @swagger
 * /product:
 *   post:
 *     summary: Create a base product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     description: Creates a new base product in the system. This is the generic version of a product, not tied to a specific vendor.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductPayload'
 *     responses:
 *       201:
 *         description: The created product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductWithRelations'
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         barcode: { type: string }
 *         name: { type: string }
 *         description: { type: string, nullable: true }
 *         images: { type: array, items: { type: string, format: uri } }
 *         weight: { type: number, format: float, nullable: true }
 *         weightUnit: { type: string, nullable: true }
 *         attributes: { type: object, nullable: true }
 *         meta: { type: object, nullable: true }
 *         categoryIds: { type: array, items: { type: string } }
 *         isAlcohol: { type: boolean }
 *         isAgeRestricted: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     CategorySummary:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         name: { type: string }
 *     TagSummary:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         name: { type: string }
 *     ProductWithRelations:
 *       allOf:
 *         - $ref: '#/components/schemas/Product'
 *         - type: object
 *           properties:
 *             categories:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CategorySummary'
 *             tags:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TagSummary'
 *     VendorProduct:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         vendorId: { type: string, format: uuid }
 *         productId: { type: string, format: uuid }
 *         price: { type: number, format: float }
 *         name: { type: string }
 *         description: { type: string, nullable: true }
 *         discountedPrice: { type: number, format: float, nullable: true }
 *         images: { type: array, items: { type: string, format: uri } }
 *         weight: { type: number, format: float, nullable: true }
 *         weightUnit: { type: string, nullable: true }
 *         isAvailable: { type: boolean }
 *         isAlcohol: { type: boolean }
 *         isAgeRestricted: { type: boolean }
 *         attributes: { type: object, nullable: true }
 *         categoryIds: { type: array, items: { type: string } }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     VendorProductWithRelations:
 *       allOf:
 *         - $ref: '#/components/schemas/VendorProduct'
 *         - type: object
 *           properties:
 *             product:
 *               $ref: '#/components/schemas/Product'
 *             categories:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CategorySummary'
 *             tags:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TagSummary'
 *     CreateProductPayload:
 *       type: object
 *       required: [barcode, name, categoryIds]
 *       properties:
 *         barcode: { type: string }
 *         name: { type: string }
 *         description: { type: string, nullable: true }
 *         images: { type: array, items: { type: string, format: uri } }
 *         attributes: { type: object, nullable: true }
 *         meta: { type: object, nullable: true }
 *         categoryIds: { type: array, items: { type: string, format: uuid }, description: "Array of category IDs to associate with the product." }
 *         tagIds: { type: array, items: { type: string, format: uuid }, description: "Array of tag IDs to associate with the product." }
 *         isAlcohol: { type: boolean, default: false }
 *         isAgeRestricted: { type: boolean, default: false }
 *     CreateVendorProductPayload:
 *       type: object
 *       required: [vendorId, productId, price, name, categoryIds]
 *       properties:
 *         vendorId: { type: string, format: uuid }
 *         productId: { type: string, format: uuid }
 *         price: { type: number, format: float }
 *         name: { type: string, description: "The name for the vendor-specific product, which can override the base product name." }
 *         description: { type: string, nullable: true }
 *         images: { type: array, items: { type: string }, description: "Array of image URLs or base64 encoded strings." }
 *         categoryIds: { type: array, items: { type: string, format: uuid } }
 *         tagIds: { type: array, items: { type: string, format: uuid } }
 *     CreateVendorProductWithBarcodePayload:
 *       type: object
 *       required: [vendorId, barcode, price, name, categoryIds]
 *       properties:
 *         vendorId: { type: string, format: uuid }
 *         barcode: { type: string }
 *         price: { type: number, format: float }
 *         name: { type: string }
 *         description: { type: string, nullable: true }
 *         images: { type: array, items: { type: string }, description: "Array of image URLs or base64 encoded strings." }
 *         categoryIds: { type: array, items: { type: string, format: uuid } }
 *         tagIds: { type: array, items: { type: string, format: uuid } }
 *         discountedPrice: { type: number, format: float, nullable: true }
 *         isAvailable: { type: boolean, default: true }
 *     UpdateProductBasePayload:
 *       allOf:
 *         - $ref: '#/components/schemas/VendorProduct'
 *         - type: object
 *           properties:
 *             orderCount:
 *               type: integer
 *               description: "The number of times this product has been ordered."
 *     ProductOverview:
 *       type: object
 *       properties:
 *         totalProducts:
 *           type: integer
 *           description: "The total number of base products in the system."
 *         totalVendorProducts:
 *           type: integer
 *           description: "The total number of unique product listings across all vendors."
 */
/**
 * @swagger
 * /product/admin/overview:
 *   get:
 *     summary: Get an overview of product data (Admin)
 *     tags: [Product, Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves aggregate data about products, such as the total number of base products and vendor product listings.
 *     responses:
 *       200:
 *         description: The product overview data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductOverview'
 */
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
                if (error_1 instanceof client_1.Prisma.PrismaClientKnownRequestError && error_1.code === 'P2002') {
                    return [2 /*return*/, res.status(409).json({ error: 'A product with this barcode already exists.' })];
                }
                console.error('Error creating product:', error_1);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getProductOverviewController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var overview, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, productService.getProductOverviewService()];
            case 1:
                overview = _a.sent();
                res.status(200).json(overview);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error getting product overview:', error_2);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /product/vendor:
 *   post:
 *     summary: Create a vendor-specific product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     description: Creates a product listing for a specific vendor.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVendorProductPayload'
 *     responses:
 *       201:
 *         description: The created vendor product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorProductWithRelations'
 */
exports.createVendorProduct = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var ownerId, vendorProduct, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                ownerId = req.userId;
                return [4 /*yield*/, productService.createVendorProduct(req.body, ownerId)];
            case 1:
                vendorProduct = _a.sent();
                res.status(201).json(vendorProduct);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                if (error_3 instanceof client_1.Prisma.PrismaClientKnownRequestError && error_3.code === 'P2002') {
                    return [2 /*return*/, res.status(409).json({ error: 'This product is already listed by this vendor.' })];
                }
                console.error('Error creating vendor product:', error_3);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /product/admin/{productId}/vendor-products:
 *   get:
 *     summary: Get all vendor products for a specific base product (Admin)
 *     tags: [Product, Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves a paginated list of all vendor-specific listings for a given base product ID.
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The ID of the base product.
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number for pagination.
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 20 }
 *         description: Number of items per page.
 *     responses:
 *       200:
 *         description: A paginated list of vendor products.
 *       404:
 *         description: Base product not found.
 */
exports.getVendorProductsForProductController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var productId, page, size, result, error_4;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                productId = req.params.productId;
                page = ((_a = req.query.page) === null || _a === void 0 ? void 0 : _a.toString()) || "1";
                size = ((_b = req.query.size) === null || _b === void 0 ? void 0 : _b.toString()) || "20";
                return [4 /*yield*/, productService.getVendorProductsForProductService(productId, { page: page, size: size })];
            case 1:
                result = _c.sent();
                res.status(200).json(result);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _c.sent();
                if (error_4.message.includes('not found')) {
                    return [2 /*return*/, res.status(404).json({ error: error_4.message })];
                }
                console.error('Error in getVendorProductsForProductController:', error_4);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /product/vendor/{id}:
 *   get:
 *     summary: Get a vendor-specific product by its ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the vendor product to find.
 *     responses:
 *       200:
 *         description: The found vendor product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorProductWithRelations'
 *       404:
 *         description: Vendor product not found.
 */
exports.getVendorProductById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, vendorProduct, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, productService.getVendorProductById(id)];
            case 1:
                vendorProduct = _a.sent();
                if (!vendorProduct) {
                    return [2 /*return*/, res.status(404).json({ error: 'Vendor product not found' })];
                }
                res.json(vendorProduct);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error("Error in getVendorProductById: " + error_5);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /product/vendor/barcode:
 *   post:
 *     summary: Create a vendor product via barcode scan
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     description: Creates a vendor product by scanning a barcode. If the base product doesn't exist, it's created first.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVendorProductWithBarcodePayload'
 *     responses:
 *       201:
 *         description: The created vendor product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorProductWithRelations'
 *       409:
 *         description: Conflict - This product is already listed by this vendor.
 */
exports.createVendorProductWithBarcode = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var ownerId, vendorProduct, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                ownerId = req.userId;
                return [4 /*yield*/, productService.createVendorProductWithBarcode(req.body, ownerId)];
            case 1:
                vendorProduct = _a.sent();
                res.status(201).json(vendorProduct);
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                if (error_6 instanceof client_1.Prisma.PrismaClientKnownRequestError && (error_6 === null || error_6 === void 0 ? void 0 : error_6.code) === 'P2002') {
                    // Construct a user-friendly error message
                    return [2 /*return*/, res.status(409).json({
                            error: 'This product is already listed by this vendor for the given barcode.'
                        })];
                }
                if (error_6.message.startsWith('Unauthorized')) {
                    return [2 /*return*/, res.status(403).json({ error: error_6.message })];
                }
                console.error('Error creating vendor product with barcode:', error_6);
                res.status(500).json({ error: error_6.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /product/barcode:
 *   get:
 *     summary: Get a base product by its barcode
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *         description: The barcode of the product to find.
 *     responses:
 *       200:
 *         description: The found product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductWithRelations'
 *       400:
 *         description: Barcode is required.
 *       404:
 *         description: Product not found.
 */
exports.getProductByBarcode = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var barcode, product, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                barcode = req.query.barcode;
                return [4 /*yield*/, productService.getProductByBarcode(barcode)];
            case 1:
                product = _a.sent();
                if (!product) {
                    return [2 /*return*/, res.status(404).json({ error: 'Product not found' })];
                }
                res.json(product);
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                console.error('Error getting product by barcode:', error_7);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /product/vendor/barcode:
 *   get:
 *     summary: Get a vendor-specific product by barcode
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *         description: The barcode of the product.
 *       - in: query
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the vendor.
 *     responses:
 *       200:
 *         description: The found vendor product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorProductWithRelations'
 *       400:
 *         description: Barcode and vendorId are required.
 *       404:
 *         description: Vendor product not found.
 */
exports.getVendorProductByBarcode = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, barcode, vendorId, vendorProduct, error_8;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, barcode = _a.barcode, vendorId = _a.vendorId;
                return [4 /*yield*/, productService.getVendorProductByBarcode(barcode, vendorId)];
            case 1:
                vendorProduct = _b.sent();
                if (!vendorProduct) {
                    return [2 /*return*/, res.status(404).json({ error: 'Vendor product not found' })];
                }
                res.json(vendorProduct);
                return [3 /*break*/, 3];
            case 2:
                error_8 = _b.sent();
                console.error('Error getting vendor product by barcode:', error_8);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /product/tags/ids:
 *   get:
 *     summary: Get base products by tag IDs
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: tagIds
 *         required: true
 *         style: form
 *         explode: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *         description: An array of tag IDs to filter products by.
 *     responses:
 *       200:
 *         description: A list of products matching the tag IDs.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductWithRelations'
 *       400:
 *         description: tagIds query parameter is required.
 */
exports.getProductsByTagIds = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var products, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, productService.getProductsByTagIds(req.query.tagIds)];
            case 1:
                products = _a.sent();
                res.json(products);
                return [3 /*break*/, 3];
            case 2:
                error_9 = _a.sent();
                console.error('Error getting products by tag IDs:', error_9);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /product/vendor/tags/ids:
 *   get:
 *     summary: Get vendor products by tag IDs
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: tagIds
 *         required: true
 *         style: form
 *         explode: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *         description: An array of tag IDs to filter vendor products by.
 *     responses:
 *       200:
 *         description: A list of vendor products matching the tag IDs.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VendorProductWithRelations'
 *       400:
 *         description: tagIds query parameter is required.
 */
exports.getVendorProductsByTagIds = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, tagIds, vendorId, vendorProducts, error_10;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, tagIds = _a.tagIds, vendorId = _a.vendorId;
                return [4 /*yield*/, productService.getVendorProductsByTagIds(tagIds)];
            case 1:
                vendorProducts = _b.sent();
                res.json(vendorProducts);
                return [3 /*break*/, 3];
            case 2:
                error_10 = _b.sent();
                console.error('Error getting vendor products by tag IDs:', error_10);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /product/{id}:
 *   patch:
 *     summary: Update a base product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the base product to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProductBasePayload'
 *     responses:
 *       200:
 *         description: The updated product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductWithRelations'
 *       404:
 *         description: Product not found.
 */
exports.updateProductBase = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var product, error_11;
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
                error_11 = _a.sent();
                if (error_11 instanceof client_1.Prisma.PrismaClientKnownRequestError && error_11.code === 'P2025') {
                    return [2 /*return*/, res.status(404).json({ error: 'Product not found.' })];
                }
                console.error('Error updating product base:', error_11);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /product/vendor/{id}:
 *   patch:
 *     summary: Update a vendor-specific product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the vendor product to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateVendorProductPayload'
 *     responses:
 *       200:
 *         description: The updated vendor product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorProductWithRelations'
 *       404:
 *         description: Vendor product not found.
 */
exports.updateVendorProduct = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var vendorProduct, error_12;
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
                error_12 = _a.sent();
                if (error_12 instanceof client_1.Prisma.PrismaClientKnownRequestError && error_12.code === 'P2025') {
                    return [2 /*return*/, res.status(404).json({ error: 'Vendor product not found.' })];
                }
                console.error('Error updating vendor product:', error_12);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /product:
 *   get:
 *     summary: Get all base products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: A list of all base products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductWithRelations'
 */
exports.getAllProducts = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var products, error_13;
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
                error_13 = _a.sent();
                console.error('Error getting all products:', error_13);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /product/admin/all:
 *   get:
 *     summary: Get all base products with filtering and pagination (Admin)
 *     tags: [Product, Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves a paginated list of all base products in the system. Each product includes a count of how many vendors are selling it.
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *         description: Filter by product name (case-insensitive contains).
 *       - in: query
 *         name: categoryId
 *         schema: { type: string, format: uuid }
 *         description: Filter by a specific category ID.
 *       - in: query
 *         name: isAlcohol
 *         schema: { type: boolean }
 *         description: Filter for products that are alcoholic.
 *       - in: query
 *         name: isAgeRestricted
 *         schema: { type: boolean }
 *         description: Filter for products that are age-restricted.
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number for pagination.
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 20 }
 *         description: Number of items per page.
 *     responses:
 *       200:
 *         description: A paginated list of base products.
 */
exports.adminGetAllProductsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, categoryId, isAlcohol, isAgeRestricted, page, size, parseBoolean, filters, result, error_14;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                _a = req.query, name = _a.name, categoryId = _a.categoryId, isAlcohol = _a.isAlcohol, isAgeRestricted = _a.isAgeRestricted;
                page = ((_b = req.query.page) === null || _b === void 0 ? void 0 : _b.toString()) || "1";
                size = ((_c = req.query.size) === null || _c === void 0 ? void 0 : _c.toString()) || "20";
                parseBoolean = function (value) {
                    if (value === 'true')
                        return true;
                    if (value === 'false')
                        return false;
                    return undefined;
                };
                filters = {
                    name: name,
                    categoryId: categoryId,
                    isAlcohol: parseBoolean(isAlcohol),
                    isAgeRestricted: parseBoolean(isAgeRestricted)
                };
                return [4 /*yield*/, productService.adminGetAllProductsService(filters, { page: page, take: size })];
            case 1:
                result = _d.sent();
                res.status(200).json(result);
                return [3 /*break*/, 3];
            case 2:
                error_14 = _d.sent();
                console.error('Error in adminGetAllProductsController:', error_14);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /product/vendor:
 *   get:
 *     summary: Get all vendor products with filtering and pagination
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *         description: Filter by product name (case-insensitive contains).
 *       - in: query
 *         name: vendorId
 *         schema: { type: string, format: uuid }
 *         description: Filter by vendor ID.
 *       - in: query
 *         name: productId
 *         schema: { type: string, format: uuid }
 *         description: Filter by base product ID.
 *       - in: query
 *         name: categoryIds
 *         style: form
 *         explode: true
 *         schema: { type: array, items: { type: string, format: uuid } }
 *         description: Filter by an array of category IDs.
 *       - in: query
 *         name: tagIds
 *         style: form
 *         explode: true
 *         schema: { type: array, items: { type: 'string', format: 'uuid' } }
 *         description: Filter by an array of tag IDs.
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number for pagination.
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 20 }
 *         description: Number of items per page.
 *     responses:
 *       200:
 *         description: A paginated list of vendor products.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedVendorProducts'
 */
exports.getAllVendorProducts = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, vendorId, categoryIds, tagIds, productId, page, take, vendorProducts, error_15;
    var _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _a = req.query, name = _a.name, vendorId = _a.vendorId, categoryIds = _a.categoryIds, tagIds = _a.tagIds, productId = _a.productId;
                page = ((_c = (_b = req === null || req === void 0 ? void 0 : req.query) === null || _b === void 0 ? void 0 : _b.page) === null || _c === void 0 ? void 0 : _c.toString()) || "1";
                take = ((_e = (_d = req === null || req === void 0 ? void 0 : req.query) === null || _d === void 0 ? void 0 : _d.size) === null || _e === void 0 ? void 0 : _e.toString()) || "20";
                _f.label = 1;
            case 1:
                _f.trys.push([1, 3, , 4]);
                return [4 /*yield*/, productService.getAllVendorProducts({ name: name, vendorId: vendorId, categoryIds: categoryIds, tagIds: tagIds, productId: productId }, { page: page, take: take })];
            case 2:
                vendorProducts = _f.sent();
                res.json(vendorProducts);
                return [3 /*break*/, 4];
            case 3:
                error_15 = _f.sent();
                console.error('Error getting vendor products:', error_15);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /product/vendor/category:
 *   get:
 *     summary: Get vendor products by category
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The ID of the vendor.
 *       - in: query
 *         name: categoryId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The ID of the category.
 *     responses:
 *       200:
 *         description: A list of vendor products in the specified category.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VendorProductWithRelations'
 *       400:
 *         description: Vendor ID and Category ID are required.
 */
exports.getVendorProductsByCategory = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, vendorId, categoryId, vendorProducts, error_16;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, vendorId = _a.vendorId, categoryId = _a.categoryId;
                return [4 /*yield*/, productService.getVendorProductsByCategory(vendorId, categoryId)];
            case 1:
                vendorProducts = _b.sent();
                res.json(vendorProducts);
                return [3 /*break*/, 3];
            case 2:
                error_16 = _b.sent();
                console.error('Error getting vendor products by category:', error_16);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /product/user/{userId}:
 *   get:
 *     summary: Get all products from all vendors belonging to a user
 *     tags: [Product, User]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves a list of all vendor-specific products from all stores owned by a particular user. This can be used by an admin or the user themselves.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The ID of the user whose vendor products are to be fetched.
 *     responses:
 *       200:
 *         description: A list of vendor products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VendorProduct'
 */
exports.getVendorProductsByUserController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, authenticatedUserId, authenticatedUserRole, products, error_17;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.params.userId;
                authenticatedUserId = req.userId;
                authenticatedUserRole = req.userRole;
                // Authorization: Allow access only to the user themselves or an admin.
                if (authenticatedUserRole !== 'admin' && authenticatedUserId !== userId) {
                    return [2 /*return*/, res.status(403).json({ error: 'Forbidden: You are not authorized to access this resource.' })];
                }
                return [4 /*yield*/, productService.getVendorProductsByUser(userId)];
            case 1:
                products = _a.sent();
                res.status(200).json(products);
                return [3 /*break*/, 3];
            case 2:
                error_17 = _a.sent();
                console.error('Error getting vendor products by user:', error_17);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /product/{id}:
 *   delete:
 *     summary: Delete a base product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The ID of the base product to delete.
 *     responses:
 *       200:
 *         description: The deleted product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found.
 */
exports.deleteProduct = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var product, error_18;
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
                error_18 = _a.sent();
                if (error_18 instanceof client_1.Prisma.PrismaClientKnownRequestError && error_18.code === 'P2025') {
                    return [2 /*return*/, res.status(404).json({ error: 'Product not found.' })];
                }
                console.error('Error deleting product:', error_18);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /product/{id}/status:
 *   patch:
 *     summary: Update a base product's active status (Admin)
 *     tags: [Product, Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Allows an admin to enable or disable a base product by setting its `isActive` flag.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the base product to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 description: Set to `false` to disable the product, `true` to enable it.
 *     responses:
 *       200:
 *         description: The updated product with the new status.
 *       404:
 *         description: Product not found.
 */
exports.updateProductStatusController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, isActive, product;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                isActive = req.body.isActive;
                return [4 /*yield*/, productService.updateProductStatusService(id, isActive)];
            case 1:
                product = _a.sent();
                res.json(product);
                return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /product/vendor/{id}:
 *   delete:
 *     summary: Delete a vendor-specific product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The ID of the vendor product to delete.
 *     responses:
 *       200:
 *         description: The deleted vendor product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorProduct'
 *       404:
 *         description: Vendor product not found.
 */
exports.deleteVendorProduct = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var vendorProductId, requestingUserId, requestingUserRole, staffVendorId, vendorProduct, error_19;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                vendorProductId = req.params.id;
                requestingUserId = req.userId;
                requestingUserRole = req.userRole;
                staffVendorId = req.vendorId;
                return [4 /*yield*/, productService.deleteVendorProduct(vendorProductId, requestingUserId, requestingUserRole, staffVendorId)];
            case 1:
                vendorProduct = _a.sent();
                res.json(vendorProduct);
                return [3 /*break*/, 3];
            case 2:
                error_19 = _a.sent();
                if (error_19.message.includes('Forbidden')) {
                    return [2 /*return*/, res.status(403).json({ error: error_19.message })];
                }
                if (error_19 instanceof client_1.Prisma.PrismaClientKnownRequestError && error_19.code === 'P2025' || error_19.message.includes('not found')) {
                    return [2 /*return*/, res.status(404).json({ error: 'Vendor product not found.' })];
                }
                console.error('Error deleting vendor product:', error_19);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /product/vendor/trending:
 *   get:
 *     summary: Get trending vendor products
 *     tags: [Product, Vendor]
 *     description: Retrieves a list of vendor products that are trending, based on the number of times they have been ordered.
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         schema: { type: string, format: uuid }
 *         description: Optional. Filter trending products by a specific vendor ID.
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number for pagination.
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 5 }
 *         description: Number of items per page.
 *     responses:
 *       200:
 *         description: A paginated list of trending vendor products.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedTrendingVendorProducts'
 */
exports.getTrendingVendorProducts = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var vendorId, page, take, result, error_20;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                vendorId = req.query.vendorId;
                page = ((_a = req.query.page) === null || _a === void 0 ? void 0 : _a.toString()) || "1";
                take = ((_b = req.query.size) === null || _b === void 0 ? void 0 : _b.toString()) || "5";
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                return [4 /*yield*/, productService.getTrendingVendorProductsService({ vendorId: vendorId }, { page: page, take: take })];
            case 2:
                result = _c.sent();
                res.json(result);
                return [3 /*break*/, 4];
            case 3:
                error_20 = _c.sent();
                console.error('Error getting trending vendor products:', error_20);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /product/vendor/my-products:
 *   get:
 *     summary: Get all products from all stores owned by the authenticated vendor
 *     tags: [Product, Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         schema: { type: string, format: uuid }
 *         description: Optional. Filter products by a specific store ID owned by the vendor.
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number for pagination.
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 20 }
 *         description: Number of items per page.
 *     description: Retrieves a complete list of all vendor-specific products from all stores owned by the authenticated vendor user.
 *     responses:
 *       200:
 *         description: A paginated list of all vendor products.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page: { type: integer }
 *                 totalPages: { type: integer }
 *                 pageSize: { type: integer }
 *                 totalCount: { type: integer }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VendorProductWithRelations'
 *       403:
 *         description: Forbidden. User is not a vendor.
 *       500:
 *         description: Internal server error.
 */
exports.getMyVendorProductsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var ownerId, _a, vendorId, page, size, pagination, products, error_21;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                ownerId = req.userId;
                _a = req.query, vendorId = _a.vendorId, page = _a.page, size = _a.size;
                pagination = { page: page || '1', take: size || '20' };
                return [4 /*yield*/, productService.getMyVendorProductsService(ownerId, vendorId, pagination)];
            case 1:
                products = _b.sent();
                res.status(200).json(products);
                return [3 /*break*/, 3];
            case 2:
                error_21 = _b.sent();
                console.error('Error getting my vendor products:', error_21);
                if (error_21.message.includes('Forbidden')) {
                    return [2 /*return*/, res.status(403).json({ error: error_21.message })];
                }
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /product/vendor/transfer:
 *   post:
 *     summary: Transfer a product listing from one store to others
 *     tags: [Product, Vendor]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Copies a vendor product listing from a source store to one or more target stores owned by the same vendor.
 *       The product will not be transferred to stores where it already exists.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sourceVendorProductIds, targetVendorIds]
 *             properties:
 *               sourceVendorProductIds:
 *                 type: array
 *                 items: { type: string, format: uuid }
 *                 description: An array of vendor product IDs to copy.
 *               targetVendorIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: An array of store IDs to copy the product to.
 *     responses:
 *       200:
 *         description: The result of the transfer operation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 successfulTransfers: { type: integer }
 *                 skippedTransfers: { type: integer }
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sourceVendorProductId: { type: string, format: uuid }
 *                       transferredTo: { type: array, items: { type: string, format: uuid }, description: "List of store IDs the product was successfully transferred to." }
 *                       skippedFor: { type: array, items: { type: string, format: uuid }, description: "List of store IDs where the product already existed." }
 *       403:
 *         description: Forbidden. User does not own the source or target stores.
 *       404:
 *         description: Source product not found.
 */
exports.transferVendorProductsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var ownerId, _a, sourceVendorProductIds, targetVendorIds, result, error_22;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                ownerId = req.userId;
                _a = req.body, sourceVendorProductIds = _a.sourceVendorProductIds, targetVendorIds = _a.targetVendorIds;
                return [4 /*yield*/, productService.transferVendorProductsService(ownerId, sourceVendorProductIds, targetVendorIds)];
            case 1:
                result = _b.sent();
                res.status(200).json(result);
                return [3 /*break*/, 3];
            case 2:
                error_22 = _b.sent();
                if (error_22.message.includes('Forbidden') || error_22.message.includes('Unauthorized')) {
                    return [2 /*return*/, res.status(403).json({ error: error_22.message })];
                }
                if (error_22.message.includes('not found')) {
                    return [2 /*return*/, res.status(404).json({ error: error_22.message })];
                }
                res.status(500).json({ error: 'An unexpected error occurred during product transfer.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
