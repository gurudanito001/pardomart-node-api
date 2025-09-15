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
exports.searchStoreProductsController = exports.searchByCategoryIdController = exports.searchByCategoryController = exports.searchByStoreController = exports.searchByProductController = void 0;
var generalSearch_service_1 = require("../services/generalSearch.service");
/**
 * @swagger
 * /generalSearch/product:
 *   get:
 *     summary: Find stores that sell a specific product
 *     tags: [General Search]
 *     description: Searches for a product by name and returns a list of stores that sell it, sorted by proximity to the user. Each store result includes other products they sell.
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the product to search for.
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current latitude.
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current longitude.
 *     responses:
 *       200:
 *         description: A list of stores selling the product, sorted by distance.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoresByProductResult'
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 * components:
 *   schemas:
 *     VendorProduct:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         vendorId:
 *           type: string
 *           format: uuid
 *         productId:
 *           type: string
 *           format: uuid
 *         price:
 *           type: number
 *           format: float
 *         name:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         discountedPrice:
 *           type: number
 *           format: float
 *           nullable: true
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *         weight:
 *           type: number
 *           format: float
 *           nullable: true
 *         weightUnit:
 *           type: string
 *           nullable: true
 *         isAvailable:
 *           type: boolean
 *         isAlcohol:
 *           type: boolean
 *         isAgeRestricted:
 *           type: boolean
 *         attributes:
 *           type: object
 *           nullable: true
 *         categoryIds:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Vendor:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           nullable: true
 *         tagline:
 *           type: string
 *           nullable: true
 *         details:
 *           type: string
 *           nullable: true
 *         image:
 *           type: string
 *           format: uri
 *           nullable: true
 *         address:
 *           type: string
 *           nullable: true
 *         longitude:
 *           type: number
 *           format: float
 *           nullable: true
 *         latitude:
 *           type: number
 *           format: float
 *           nullable: true
 *         timezone:
 *           type: string
 *           nullable: true
 *         isVerified:
 *           type: boolean
 *         meta:
 *           type: object
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     VendorWithExtras:
 *       allOf:
 *         - $ref: '#/components/schemas/Vendor'
 *         - type: object
 *           properties:
 *             distance:
 *               type: number
 *               format: float
 *               description: Distance to the vendor from the user's location in kilometers.
 *             rating:
 *               type: object
 *               properties:
 *                 average:
 *                   type: number
 *                   format: float
 *                   description: The average rating score.
 *                 count:
 *                   type: integer
 *                   description: The total number of ratings.
 *     StoreWithProducts:
 *       type: object
 *       properties:
 *         vendor:
 *           $ref: '#/components/schemas/VendorWithExtras'
 *         products:
 *           type: array
 *           description: A sample of products from the store that match the search criteria (if applicable).
 *           items:
 *             $ref: '#/components/schemas/VendorProduct'
 *         totalProducts:
 *           type: integer
 *           description: The total number of products in the store that match the search criteria (if applicable).
 *     StoresByProductResult:
 *       type: object
 *       properties:
 *         stores:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/StoreWithProducts'
 */
exports.searchByProductController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, search, latitude, longitude, userSearchTerm, userLatitude, userLongitude, result, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.query, search = _a.search, latitude = _a.latitude, longitude = _a.longitude;
                userSearchTerm = search;
                userLatitude = latitude;
                userLongitude = longitude;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, generalSearch_service_1.searchProductsService(userSearchTerm, userLatitude, userLongitude)];
            case 2:
                result = _b.sent();
                res.json(result);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                // Handle errors from the service
                res.status(500).json({ error: error_1.message || 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /generalSearch/store:
 *   get:
 *     summary: Find stores by name
 *     tags: [General Search]
 *     description: Searches for a store by name and returns a list of stores, sorted by proximity to the user. Each store result includes products they sell.
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the store to search for.
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current latitude.
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current longitude.
 *     responses:
 *       200:
 *         description: A list of stores matching the search, sorted by distance.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoresByProductResult'
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 */
exports.searchByStoreController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, search, latitude, longitude, userSearchTerm, userLatitude, userLongitude, result, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.query, search = _a.search, latitude = _a.latitude, longitude = _a.longitude;
                userSearchTerm = search;
                userLatitude = latitude;
                userLongitude = longitude;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, generalSearch_service_1.searchStoreService(userSearchTerm, userLatitude, userLongitude)];
            case 2:
                result = _b.sent();
                res.json(result);
                return [3 /*break*/, 4];
            case 3:
                error_2 = _b.sent();
                res.status(500).json({ error: error_2.message || 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /generalSearch/category:
 *   get:
 *     summary: Find stores by category name
 *     tags: [General Search]
 *     description: Searches for a category by name and returns a list of stores that sell products in that category, sorted by proximity to the user.
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the category to search for.
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current latitude.
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current longitude.
 *     responses:
 *       200:
 *         description: A list of stores matching the category search, sorted by distance.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoresByProductResult'
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 */
exports.searchByCategoryController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, search, latitude, longitude, userSearchTerm, userLatitude, userLongitude, result, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.query, search = _a.search, latitude = _a.latitude, longitude = _a.longitude;
                userSearchTerm = search;
                userLatitude = latitude;
                userLongitude = longitude;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, generalSearch_service_1.searchByCategoryService(userSearchTerm, userLatitude, userLongitude)];
            case 2:
                result = _b.sent();
                res.json(result);
                return [3 /*break*/, 4];
            case 3:
                error_3 = _b.sent();
                res.status(500).json({ error: error_3.message || 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /generalSearch/category/{categoryId}:
 *   get:
 *     summary: Find stores by category ID
 *     tags: [General Search]
 *     description: Searches for a category by ID and returns a list of stores that sell products in that category (and its sub-categories), sorted by proximity to the user.
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the category to search for.
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current latitude.
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current longitude.
 *     responses:
 *       200:
 *         description: A list of stores matching the category search, sorted by distance.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoresByProductResult'
 *       400:
 *         description: Bad request due to missing or invalid parameters.
 */
exports.searchByCategoryIdController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var categoryId, _a, latitude, longitude, result, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                categoryId = req.params.categoryId;
                _a = req.query, latitude = _a.latitude, longitude = _a.longitude;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, generalSearch_service_1.searchByCategoryIdService(categoryId, latitude, longitude)];
            case 2:
                result = _b.sent();
                res.json(result);
                return [3 /*break*/, 4];
            case 3:
                error_4 = _b.sent();
                res.status(500).json({ error: error_4.message || 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /generalSearch/storeProducts/{storeId}:
 *   get:
 *     summary: Search for products within a specific store
 *     tags: [General Search]
 *     description: >
 *       Searches for products within a specific store, optionally filtering by a search term and/or category.
 *       If no categoryId is provided, it returns products grouped by their parent category.
 *       If a categoryId is provided, it returns a flat list of products within that category.
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the store (vendor) to search within.
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: The search term to filter products by name.
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the category to filter products by. If provided, results will not be grouped.
 *     responses:
 *       200:
 *         description: A list of products from the store. The structure depends on whether `categoryId` is provided.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   description: "Returned when categoryId is not provided. Products are grouped by parent category."
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       imageUrl:
 *                         type: string
 *                         format: uri
 *                         nullable: true
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       products:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/VendorProduct'
 *                 - type: array
 *                   description: "Returned when categoryId is provided. A flat list of products."
 *                   items:
 *                     $ref: '#/components/schemas/VendorProduct'
 *       400:
 *         description: Bad request due to missing storeId.
 *       404:
 *         description: Store not found.
 *       500:
 *         description: Internal server error.
 */
exports.searchStoreProductsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var storeId, _a, searchTerm, categoryId, result, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                storeId = req.params.storeId;
                _a = req.query, searchTerm = _a.searchTerm, categoryId = _a.categoryId;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, generalSearch_service_1.searchStoreProductsService(storeId, searchTerm, categoryId)];
            case 2:
                result = _b.sent();
                if (result === null) {
                    return [2 /*return*/, res.status(404).json({ error: 'Store not found.' })];
                }
                res.json(result);
                return [3 /*break*/, 4];
            case 3:
                error_5 = _b.sent();
                console.error('Error searching store products:', error_5);
                res.status(500).json({ error: error_5.message || 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
