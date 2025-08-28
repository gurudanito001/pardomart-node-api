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
exports.searchByCategoryController = exports.searchByStoreController = exports.searchByProductController = void 0;
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
 */
exports.searchByProductController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, search, latitude, longitude, userSearchTerm, userLatitude, userLongitude, result, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.query, search = _a.search, latitude = _a.latitude, longitude = _a.longitude;
                // Input validation
                if (!search) {
                    return [2 /*return*/, res.status(400).json({ error: 'Search Term is required' })];
                }
                if (!latitude || !longitude) {
                    return [2 /*return*/, res.status(400).json({ error: 'Latitude and Longitude are required' })];
                }
                userSearchTerm = search.toString();
                userLatitude = parseFloat(latitude);
                userLongitude = parseFloat(longitude);
                if (isNaN(userLatitude) || isNaN(userLongitude)) {
                    return [2 /*return*/, res.status(400).json({ error: 'Invalid latitude or longitude values' })];
                }
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
                if (!search) {
                    return [2 /*return*/, res.status(400).json({ error: 'Search Term is required' })];
                }
                if (!latitude || !longitude) {
                    return [2 /*return*/, res.status(400).json({ error: 'Latitude and Longitude are required' })];
                }
                userSearchTerm = search.toString();
                userLatitude = parseFloat(latitude);
                userLongitude = parseFloat(longitude);
                if (isNaN(userLatitude) || isNaN(userLongitude)) {
                    return [2 /*return*/, res.status(400).json({ error: 'Invalid latitude or longitude values' })];
                }
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
                if (!search) {
                    return [2 /*return*/, res.status(400).json({ error: 'Search Term is required' })];
                }
                if (!latitude || !longitude) {
                    return [2 /*return*/, res.status(400).json({ error: 'Latitude and Longitude are required' })];
                }
                userSearchTerm = search.toString();
                userLatitude = parseFloat(latitude);
                userLongitude = parseFloat(longitude);
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
