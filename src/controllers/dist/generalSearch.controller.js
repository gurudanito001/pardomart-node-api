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
exports.getStoresByProductIdController = exports.getCategoryDetailsWithRelatedDataController = exports.getVendorCategoriesWithProductsController = exports.getVendorsCategoriesAndProductsController = void 0;
var generalSearch_service_1 = require("../services/generalSearch.service");
// Controller Function
exports.getVendorsCategoriesAndProductsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, search, latitude, longitude, latitudeNum, longitudeNum, results, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.query, search = _a.search, latitude = _a.latitude, longitude = _a.longitude;
                // Basic validation of input parameters
                if (!search || typeof search !== 'string') {
                    return [2 /*return*/, res
                            .status(400)
                            .json({ error: 'Search term is required and must be a string' })];
                }
                latitudeNum = Number(latitude);
                longitudeNum = Number(longitude);
                if (!latitude ||
                    isNaN(latitudeNum) ||
                    !longitude ||
                    isNaN(longitudeNum)) {
                    return [2 /*return*/, res
                            .status(400)
                            .json({
                            error: 'Latitude and longitude are required and must be valid numbers'
                        })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, generalSearch_service_1.getVendorsCategoriesAndProductsService(search, latitudeNum, longitudeNum)];
            case 2:
                results = _b.sent();
                res.json(results);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                // Handle errors from the service (e.g., database errors)
                res.status(500).json({ error: error_1.message || 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getVendorCategoriesWithProductsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var vendorId, results, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                vendorId = req.params.vendorId;
                if (!vendorId) {
                    return [2 /*return*/, res.status(400).json({ error: 'Vendor ID is required' })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, generalSearch_service_1.getVendorCategoriesWithProductsService(vendorId)];
            case 2:
                results = _a.sent();
                res.json(results);
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                // Handle errors from the service (e.g., database errors)
                res.status(500).json({ error: error_2.message || 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
// Controller Function
exports.getCategoryDetailsWithRelatedDataController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var categoryId, page, take, vendorId, latitude, longitude, results, error_3;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                categoryId = req.params.categoryId;
                page = parseInt((((_a = req.query.page) === null || _a === void 0 ? void 0 : _a.toString()) || '1'), 10);
                take = parseInt((((_b = req.query.take) === null || _b === void 0 ? void 0 : _b.toString()) || '10'), 10);
                vendorId = (_d = (_c = req === null || req === void 0 ? void 0 : req.query) === null || _c === void 0 ? void 0 : _c.vendorId) === null || _d === void 0 ? void 0 : _d.toString();
                latitude = req.query.latitude ? parseFloat(req.query.latitude.toString()) : undefined;
                longitude = req.query.longitude ? parseFloat(req.query.longitude.toString()) : undefined;
                // Validation
                if (!categoryId) {
                    return [2 /*return*/, res.status(400).json({ error: 'Category ID is required' })];
                }
                if (isNaN(page) || page < 1) {
                    return [2 /*return*/, res.status(400).json({ error: 'Page must be a positive number' })];
                }
                if (isNaN(take) || take < 1) {
                    return [2 /*return*/, res.status(400).json({ error: 'Take must be a positive number' })];
                }
                _e.label = 1;
            case 1:
                _e.trys.push([1, 3, , 4]);
                return [4 /*yield*/, generalSearch_service_1.getCategoryDetailsWithRelatedDataService({
                        categoryId: categoryId,
                        page: page,
                        take: take,
                        userLatitude: latitude,
                        userLongitude: longitude,
                        vendorId: vendorId
                    })];
            case 2:
                results = _e.sent();
                res.json(results);
                return [3 /*break*/, 4];
            case 3:
                error_3 = _e.sent();
                // Handle errors from the service (e.g., database errors)
                res.status(500).json({ error: error_3.message || 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
// Controller Function
exports.getStoresByProductIdController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, search, latitude, longitude, userSearchTerm, userLatitude, userLongitude, result, error_4;
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
                return [4 /*yield*/, generalSearch_service_1.getStoresByProductIdService(userSearchTerm, userLatitude, userLongitude)];
            case 2:
                result = _b.sent();
                res.json(result);
                return [3 /*break*/, 4];
            case 3:
                error_4 = _b.sent();
                // Handle errors from the service
                res.status(500).json({ error: error_4.message || 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
