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
exports.deleteVendorProduct = exports.getVendorProductById = exports.getAllVendorProducts = exports.createVendorProductWithBarcode = exports.createVendorProduct = void 0;
var productService = require("../services/product.service");
/**
 * @swagger
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
 *         isAlcohol: { type: boolean }
 *         isAgeRestricted: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *
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
 *         stock: { type: integer, nullable: true }
 *         isAvailable: { type: boolean }
 *         isAlcohol: { type: boolean }
 *         isAgeRestricted: { type: boolean }
 *         attributes: { type: object, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *
 *     CreateVendorProductPayload:
 *       type: object
 *       required: [vendorId, productId, price, name, categoryIds]
 *       properties:
 *         vendorId: { type: string, format: uuid }
 *         productId: { type: string, format: uuid }
 *         price: { type: number, format: float }
 *         name: { type: string }
 *         description: { type: string, nullable: true }
 *         discountedPrice: { type: number, format: float, nullable: true }
 *         images: { type: array, items: { type: string, description: "Can be a URL or a base64 encoded string" } }
 *         isAvailable: { type: boolean, default: true }
 *         categoryIds: { type: array, items: { type: string, format: uuid } }
 *         tagIds: { type: array, items: { type: string, format: uuid }, nullable: true }
 *
 *     CreateVendorProductWithBarcodePayload:
 *       type: object
 *       required: [vendorId, barcode, price, name]
 *       properties:
 *         vendorId: { type: string, format: uuid }
 *         barcode: { type: string }
 *         price: { type: number, format: float }
 *         name: { type: string }
 *         description: { type: string, nullable: true }
 *         images: { type: array, items: { type: string, description: "Can be a URL or a base64 encoded string" } }
 *         categoryIds: { type: array, items: { type: string, format: uuid }, nullable: true }
 *         tagIds: { type: array, items: { type: string, format: uuid }, nullable: true }
 *
 *     PaginatedVendorProducts:
 *       type: object
 *       properties:
 *         page: { type: integer }
 *         totalPages: { type: integer }
 *         pageSize: { type: integer }
 *         totalCount: { type: integer }
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/VendorProduct'
 */
/**
 * @swagger
 * /products/vendor-product:
 *   post:
 *     summary: Create a new vendor product
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Creates a new product specific to a vendor.
 *       The user making the request must be the owner of the vendor.
 *       Images can be provided as base64 strings, which will be uploaded.
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
 *               $ref: '#/components/schemas/VendorProduct'
 *       401:
 *         description: Unauthorized if the user does not own the vendor.
 *       500:
 *         description: Internal server error.
 */
exports.createVendorProduct = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var ownerId, product, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                ownerId = req.userId;
                return [4 /*yield*/, productService.createVendorProduct(req.body, ownerId)];
            case 1:
                product = _a.sent();
                res.status(201).json(product);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error creating vendor product:', error_1);
                if (error_1.message.includes('Unauthorized')) {
                    return [2 /*return*/, res.status(401).json({ error: error_1.message })];
                }
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /products/vendor-product/barcode:
 *   post:
 *     summary: Create a vendor product from a barcode
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Creates a vendor-specific product by its barcode.
 *       If a base product with the given barcode does not exist, it will be created.
 *       The user making the request must be the owner of the vendor.
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
 *               $ref: '#/components/schemas/VendorProduct'
 *       401:
 *         description: Unauthorized if the user does not own the vendor.
 *       500:
 *         description: Internal server error.
 */
exports.createVendorProductWithBarcode = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var ownerId, product, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                ownerId = req.userId;
                return [4 /*yield*/, productService.createVendorProductWithBarcode(req.body, ownerId)];
            case 1:
                product = _a.sent();
                res.status(201).json(product);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error creating vendor product with barcode:', error_2);
                if (error_2.message.includes('Unauthorized')) {
                    return [2 /*return*/, res.status(401).json({ error: error_2.message })];
                }
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /products/vendor-products:
 *   get:
 *     summary: Get a paginated list of vendor products
 *     tags: [Product]
 *     description: Retrieves a list of vendor products. Can be filtered by various criteria.
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *         description: Filter by product name (case-insensitive search).
 *       - in: query
 *         name: vendorId
 *         schema: { type: string, format: uuid }
 *         description: Filter by a specific vendor ID.
 *       - in: query
 *         name: categoryIds
 *         schema: { type: array, items: { type: string, format: uuid } }
 *         style: form
 *         explode: false
 *         description: Filter by one or more category IDs.
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
 *       500:
 *         description: Internal server error.
 */
exports.getAllVendorProducts = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, size, filters, pagination, result, error_3;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                _a = req.query, _b = _a.page, page = _b === void 0 ? '1' : _b, _c = _a.size, size = _c === void 0 ? '20' : _c, filters = __rest(_a, ["page", "size"]);
                pagination = { page: page, take: size };
                return [4 /*yield*/, productService.getAllVendorProducts(filters, pagination)];
            case 1:
                result = _d.sent();
                res.status(200).json(result);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _d.sent();
                console.error('Error getting all vendor products:', error_3);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /products/vendor-product/{id}:
 *   get:
 *     summary: Get a vendor product by ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The ID of the vendor product to retrieve.
 *     responses:
 *       200:
 *         description: The requested vendor product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorProduct'
 *       404:
 *         description: Vendor product not found.
 *       500:
 *         description: Internal server error.
 */
exports.getVendorProductById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, product, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, productService.getVendorProductById(id)];
            case 1:
                product = _a.sent();
                if (!product) {
                    return [2 /*return*/, res.status(404).json({ error: 'Vendor product not found' })];
                }
                res.status(200).json(product);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Error getting vendor product by ID:', error_4);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /products/vendor-product/{id}:
 *   delete:
 *     summary: Delete a vendor product
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
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Vendor product not found.
 *       500:
 *         description: Internal server error.
 */
exports.deleteVendorProduct = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, product, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, productService.deleteVendorProduct(id)];
            case 1:
                product = _a.sent();
                res.status(200).json(product);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Error deleting vendor product:', error_5);
                if ((error_5 === null || error_5 === void 0 ? void 0 : error_5.code) === 'P2025') {
                    return [2 /*return*/, res.status(404).json({ error: 'Vendor product not found' })];
                }
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
// ... other product controller functions would go here ...
