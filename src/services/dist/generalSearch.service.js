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
exports.getStoresByProductIdService = exports.getCategoryDetailsWithRelatedDataService = exports.getVendorCategoriesWithProductsService = exports.getVendorsCategoriesAndProductsService = void 0;
var generalSearch_model_1 = require("../models/generalSearch.model");
exports.getVendorsCategoriesAndProductsService = function (search, latitude, longitude) { return __awaiter(void 0, void 0, void 0, function () {
    var results, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, generalSearch_model_1.getVendorsCategoriesAndProducts(search, latitude, longitude)];
            case 1:
                results = _a.sent();
                return [2 /*return*/, results];
            case 2:
                error_1 = _a.sent();
                // Handle errors appropriately (e.g., log, rethrow with a specific error type)
                console.error('Error in generalSearchService:', error_1);
                throw error_1;
            case 3: return [2 /*return*/];
        }
    });
}); };
// Service Function
exports.getVendorCategoriesWithProductsService = function (vendorId) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, generalSearch_model_1.getVendorCategoriesWithProducts(vendorId)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, result];
            case 2:
                error_2 = _a.sent();
                // Handle errors appropriately (e.g., log, rethrow with a specific error type)
                console.error('Error in getVendorCategoriesWithProductsService:', error_2);
                throw error_2;
            case 3: return [2 /*return*/];
        }
    });
}); };
// Service Function
exports.getCategoryDetailsWithRelatedDataService = function (_a) {
    var categoryId = _a.categoryId, page = _a.page, take = _a.take, userLatitude = _a.userLatitude, userLongitude = _a.userLongitude, vendorId = _a.vendorId;
    return __awaiter(void 0, void 0, void 0, function () {
        var results, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, generalSearch_model_1.getCategoryDetailsWithRelatedData({
                            categoryId: categoryId,
                            vendorId: vendorId,
                            userLatitude: userLatitude,
                            userLongitude: userLongitude,
                            page: page,
                            take: take
                        })];
                case 1:
                    results = _b.sent();
                    return [2 /*return*/, results];
                case 2:
                    error_3 = _b.sent();
                    // Handle errors appropriately (e.g., log, rethrow with a specific error type)
                    console.error('Error in getCategoryDetailsService:', error_3);
                    throw error_3; // Re-throw the error to be handled by your application's error handling
                case 3: return [2 /*return*/];
            }
        });
    });
};
// Service Function
exports.getStoresByProductIdService = function (productId, userLatitude, userLongitude) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, generalSearch_model_1.getStoresByProductId(productId, userLatitude, userLongitude)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, result];
            case 2:
                error_4 = _a.sent();
                // Handle errors (e.g., logging, specific error types)
                console.error('Error in getStoresByProductIdService:', error_4);
                throw error_4; // Re-throw to be caught by the controller
            case 3: return [2 /*return*/];
        }
    });
}); };
