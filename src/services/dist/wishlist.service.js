"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.removeFromWishlistService = exports.getWishlistService = exports.addToWishlistService = exports.WishlistError = void 0;
var wishlistModel = require("../models/wishlist.model");
var productModel = require("../models/product.model");
var WishlistError = /** @class */ (function (_super) {
    __extends(WishlistError, _super);
    function WishlistError(message, statusCode) {
        if (statusCode === void 0) { statusCode = 400; }
        var _this = _super.call(this, message) || this;
        _this.name = 'WishlistError';
        _this.statusCode = statusCode;
        return _this;
    }
    return WishlistError;
}(Error));
exports.WishlistError = WishlistError;
/**
 * Adds a product to a user's wishlist after validation.
 * @param userId - The ID of the user.
 * @param vendorProductId - The ID of the vendor product to add.
 * @returns The created wishlist item.
 */
exports.addToWishlistService = function (userId, vendorProductId) { return __awaiter(void 0, void 0, Promise, function () {
    var product, existingItem;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, productModel.getVendorProductById(vendorProductId)];
            case 1:
                product = _a.sent();
                if (!product) {
                    throw new WishlistError('Product not found.', 404);
                }
                return [4 /*yield*/, wishlistModel.findWishlistItem(userId, vendorProductId)];
            case 2:
                existingItem = _a.sent();
                if (existingItem) {
                    throw new WishlistError('Product is already in your wishlist.', 409);
                }
                // 3. Add to wishlist
                return [2 /*return*/, wishlistModel.addToWishlist(userId, vendorProductId)];
        }
    });
}); };
/**
 * Retrieves all items in a user's wishlist.
 * @param userId - The ID of the user.
 * @returns A list of wishlist items.
 */
exports.getWishlistService = function (userId) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, wishlistModel.getWishlistByUserId(userId)];
    });
}); };
/**
 * Removes an item from a user's wishlist after authorization.
 * @param userId - The ID of the user making the request.
 * @param wishlistItemId - The ID of the wishlist item to remove.
 * @returns The removed wishlist item.
 */
exports.removeFromWishlistService = function (userId, wishlistItemId) { return __awaiter(void 0, void 0, Promise, function () {
    var wishlistItem;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, wishlistModel.getWishlistItemById(wishlistItemId)];
            case 1:
                wishlistItem = _a.sent();
                if (!wishlistItem) {
                    throw new WishlistError('Wishlist item not found.', 404);
                }
                if (wishlistItem.userId !== userId) {
                    throw new WishlistError('You are not authorized to remove this item.', 403);
                }
                // 2. Remove from wishlist
                return [2 /*return*/, wishlistModel.removeFromWishlist(wishlistItemId)];
        }
    });
}); };
