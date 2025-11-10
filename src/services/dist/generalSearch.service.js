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
exports.searchByCategoryService = exports.searchStoreService = exports.searchStoreProductsService = exports.searchByCategoryIdService = exports.searchProductsService = void 0;
var generalSearch_model_1 = require("../models/generalSearch.model");
var rating_service_1 = require("./rating.service");
// Helper to attach ratings to a list of stores
var attachRatingsToStores = function (stores) { return __awaiter(void 0, void 0, Promise, function () {
    var vendorIds, ratingsMap;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!stores || stores.length === 0) {
                    return [2 /*return*/, []];
                }
                vendorIds = stores.map(function (store) { return store.vendor.id; });
                return [4 /*yield*/, rating_service_1.getAggregateRatingsForVendorsService(vendorIds)];
            case 1:
                ratingsMap = _a.sent();
                return [2 /*return*/, stores.map(function (store) { return (__assign(__assign({}, store), { vendor: __assign(__assign({}, store.vendor), { rating: ratingsMap.get(store.vendor.id) || { average: 5, count: 0 } }) })); })];
        }
    });
}); };
// Service Function
exports.searchProductsService = function (searchTerm, userLatitude, userLongitude) { return __awaiter(void 0, void 0, void 0, function () {
    var searchResult, storesWithRatings, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, generalSearch_model_1.searchByProductName(searchTerm, userLatitude, userLongitude)];
            case 1:
                searchResult = _a.sent();
                return [4 /*yield*/, attachRatingsToStores(searchResult.stores)];
            case 2:
                storesWithRatings = _a.sent();
                return [2 /*return*/, { stores: storesWithRatings }];
            case 3:
                error_1 = _a.sent();
                // Handle errors (e.g., logging, specific error types)
                console.error('Error searching by product name:', error_1);
                throw error_1; // Re-throw to be caught by the controller
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.searchByCategoryIdService = function (categoryId, latitude, longitude) { return __awaiter(void 0, void 0, void 0, function () {
    var searchResult, storesWithRatings, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, generalSearch_model_1.searchByCategoryId(categoryId, latitude, longitude)];
            case 1:
                searchResult = _a.sent();
                return [4 /*yield*/, attachRatingsToStores(searchResult.stores)];
            case 2:
                storesWithRatings = _a.sent();
                return [2 /*return*/, { stores: storesWithRatings }];
            case 3:
                error_2 = _a.sent();
                console.error('Error searching by category id:', error_2);
                throw error_2; // Re-throw to be caught by the controller
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.searchStoreProductsService = function (storeId, searchTerm, categoryId) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, generalSearch_model_1.searchStoreProducts(storeId, searchTerm, categoryId)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, result];
            case 2:
                error_3 = _a.sent();
                // Handle errors (e.g., logging, specific error types)
                console.error('Error in searchStoreProductsService:', error_3);
                throw error_3; // Re-throw to be caught by the controller
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.searchStoreService = function (searchTerm, userLatitude, userLongitude) { return __awaiter(void 0, void 0, void 0, function () {
    var searchResult, storesWithRatings, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, generalSearch_model_1.searchByStoreName(searchTerm, userLatitude, userLongitude)];
            case 1:
                searchResult = _a.sent();
                return [4 /*yield*/, attachRatingsToStores(searchResult.stores)];
            case 2:
                storesWithRatings = _a.sent();
                return [2 /*return*/, { stores: storesWithRatings }];
            case 3:
                error_4 = _a.sent();
                // Handle errors (e.g., logging, specific error types)
                console.error('Error searching by store name:', error_4);
                throw error_4; // Re-throw to be caught by the controller
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.searchByCategoryService = function (searchTerm, latitude, longitude) { return __awaiter(void 0, void 0, void 0, function () {
    var searchResult, storesWithRatings, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, generalSearch_model_1.searchByCategoryName(searchTerm, latitude, longitude)];
            case 1:
                searchResult = _a.sent();
                return [4 /*yield*/, attachRatingsToStores(searchResult.stores)];
            case 2:
                storesWithRatings = _a.sent();
                return [2 /*return*/, { stores: storesWithRatings }];
            case 3:
                error_5 = _a.sent();
                // Handle errors (e.g., logging, specific error types)
                console.error('Error searching by category name:', error_5);
                throw error_5; // Re-throw to be caught by the controller
            case 4: return [2 /*return*/];
        }
    });
}); };
