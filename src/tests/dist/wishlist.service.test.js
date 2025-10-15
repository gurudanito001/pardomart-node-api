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
var wishlistService = require("../services/wishlist.service");
var wishlistModel = require("../models/wishlist.model");
var productModel = require("../models/product.model");
var wishlist_service_1 = require("../services/wishlist.service");
// Mock the model files to isolate the service for testing
jest.mock('../models/wishlist.model');
jest.mock('../models/product.model');
describe('Wishlist Service', function () {
    // Create typed mocks of the imported models
    var mockWishlistModel = wishlistModel;
    var mockProductModel = productModel;
    var userId = 'user-123';
    var vendorProductId = 'vp-abc';
    var wishlistItemId = 'wishlist-item-xyz';
    // Reset mocks before each test to ensure a clean state
    beforeEach(function () {
        jest.clearAllMocks();
    });
    describe('addToWishlistService', function () {
        it('should add a product to the wishlist successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockProduct, mockWishlistItem, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockProduct = {
                            id: vendorProductId,
                            product: { id: 'prod-123' },
                            vendor: { id: 'vendor-123', userId: 'vendor-user-123' }
                        };
                        mockWishlistItem = { id: wishlistItemId, userId: userId, vendorProductId: vendorProductId };
                        mockProductModel.getVendorProductById.mockResolvedValue(mockProduct);
                        mockWishlistModel.findWishlistItem.mockResolvedValue(null);
                        mockWishlistModel.addToWishlist.mockResolvedValue(mockWishlistItem);
                        return [4 /*yield*/, wishlistService.addToWishlistService(userId, vendorProductId)];
                    case 1:
                        result = _a.sent();
                        expect(mockProductModel.getVendorProductById).toHaveBeenCalledWith(vendorProductId);
                        expect(mockWishlistModel.findWishlistItem).toHaveBeenCalledWith(userId, vendorProductId);
                        expect(mockWishlistModel.addToWishlist).toHaveBeenCalledWith(userId, vendorProductId);
                        expect(result).toEqual(mockWishlistItem);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw a 404 error if the product does not exist', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockProductModel.getVendorProductById.mockResolvedValue(null);
                        return [4 /*yield*/, expect(wishlistService.addToWishlistService(userId, vendorProductId))
                                .rejects.toThrow(new wishlist_service_1.WishlistError('Product not found.', 404))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw a 409 error if the product is already in the wishlist', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockProduct, existingWishlistItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockProduct = {
                            id: vendorProductId,
                            product: { id: 'prod-123' },
                            vendor: { id: 'vendor-123', userId: 'vendor-user-123' }
                        };
                        existingWishlistItem = { id: wishlistItemId, userId: userId, vendorProductId: vendorProductId };
                        mockProductModel.getVendorProductById.mockResolvedValue(mockProduct);
                        mockWishlistModel.findWishlistItem.mockResolvedValue(existingWishlistItem);
                        return [4 /*yield*/, expect(wishlistService.addToWishlistService(userId, vendorProductId))
                                .rejects.toThrow(new wishlist_service_1.WishlistError('Product is already in your wishlist.', 409))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getWishlistService', function () {
        it('should return the user\'s wishlist', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockWishlist, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockWishlist = [{ id: wishlistItemId, userId: userId, vendorProductId: vendorProductId }];
                        mockWishlistModel.getWishlistByUserId.mockResolvedValue(mockWishlist);
                        return [4 /*yield*/, wishlistService.getWishlistService(userId)];
                    case 1:
                        result = _a.sent();
                        expect(mockWishlistModel.getWishlistByUserId).toHaveBeenCalledWith(userId);
                        expect(result).toEqual(mockWishlist);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('removeFromWishlistService', function () {
        var mockWishlistItem = { id: wishlistItemId, userId: userId, vendorProductId: vendorProductId };
        it('should remove an item from the wishlist successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockWishlistModel.getWishlistItemById.mockResolvedValue(mockWishlistItem);
                        mockWishlistModel.removeFromWishlist.mockResolvedValue(mockWishlistItem);
                        return [4 /*yield*/, wishlistService.removeFromWishlistService(userId, wishlistItemId)];
                    case 1:
                        result = _a.sent();
                        expect(mockWishlistModel.getWishlistItemById).toHaveBeenCalledWith(wishlistItemId);
                        expect(mockWishlistModel.removeFromWishlist).toHaveBeenCalledWith(wishlistItemId);
                        expect(result).toEqual(mockWishlistItem);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw a 404 error if the wishlist item is not found', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockWishlistModel.getWishlistItemById.mockResolvedValue(null);
                        return [4 /*yield*/, expect(wishlistService.removeFromWishlistService(userId, wishlistItemId))
                                .rejects.toThrow(new wishlist_service_1.WishlistError('Wishlist item not found.', 404))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw a 403 error if the user is not authorized to remove the item', function () { return __awaiter(void 0, void 0, void 0, function () {
            var anotherUsersItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        anotherUsersItem = __assign(__assign({}, mockWishlistItem), { userId: 'another-user-id' });
                        mockWishlistModel.getWishlistItemById.mockResolvedValue(anotherUsersItem);
                        return [4 /*yield*/, expect(wishlistService.removeFromWishlistService(userId, wishlistItemId))
                                .rejects.toThrow(new wishlist_service_1.WishlistError('You are not authorized to remove this item.', 403))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
