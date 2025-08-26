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
exports.addItemToCartService = exports.deleteCartService = exports.getCartByUserIdService = exports.getCartByIdService = exports.createCartService = exports.CartError = void 0;
var cartModel = require("../models/cart.model"); // Adjust the path if needed
var cartItemModel = require("../models/cartItem.model");
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
// Custom error class for better error handling in the controller
var CartError = /** @class */ (function (_super) {
    __extends(CartError, _super);
    function CartError(message, statusCode) {
        if (statusCode === void 0) { statusCode = 400; }
        var _this = _super.call(this, message) || this;
        _this.name = 'CartError';
        _this.statusCode = statusCode;
        return _this;
    }
    return CartError;
}(Error));
exports.CartError = CartError;
// --- Cart Service Functions ---
/**
 * Creates a new cart for a user.
 * @param userId - The ID of the user for whom the cart is created.
 * @returns The newly created cart.
 */
exports.createCartService = function (userId) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, cartModel.createCart({ userId: userId })]; // Initialize with empty items
    });
}); };
/**
 * Retrieves a cart by its ID.
 * @param id - The ID of the cart to retrieve.
 * @returns The cart, or null if not found.
 */
exports.getCartByIdService = function (id) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, cartModel.getCartById(id)];
    });
}); };
/**
 * Retrieves the cart for a specific user.
 * @param userId - The ID of the user whose cart is to be retrieved.
 * @returns The user's cart, or null if not found.
 */
exports.getCartByUserIdService = function (userId) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, cartModel.getCartByUserId(userId)];
    });
}); };
/**
 * Deletes a cart by its ID.
 * @param id - The ID of the cart to delete.
 * @returns The deleted cart.
 */
exports.deleteCartService = function (id) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, cartModel.deleteCart(id)];
    });
}); };
/**
 * Adds an item to a user's shopping cart.
 * If the user has no cart, one is created.
 * If the item is already in the cart, its quantity is updated.
 * @param userId The ID of the user.
 * @param payload The item and quantity to add.
 * @returns The created or updated cart item.
 */
exports.addItemToCartService = function (userId, payload) { return __awaiter(void 0, void 0, void 0, function () {
    var vendorProductId, quantity, vendorProduct, cart, existingItem, newQuantity;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                vendorProductId = payload.vendorProductId, quantity = payload.quantity;
                if (quantity <= 0) {
                    throw new CartError('Quantity must be a positive number.');
                }
                return [4 /*yield*/, prisma.vendorProduct.findUnique({ where: { id: vendorProductId } })];
            case 1:
                vendorProduct = _a.sent();
                if (!vendorProduct) {
                    throw new CartError('Product not found.', 404);
                }
                if (!vendorProduct.isAvailable) {
                    throw new CartError('Product is currently not available.');
                }
                return [4 /*yield*/, exports.getCartByUserIdService(userId)];
            case 2:
                cart = _a.sent();
                if (!!cart) return [3 /*break*/, 4];
                return [4 /*yield*/, exports.createCartService(userId)];
            case 3:
                cart = _a.sent();
                _a.label = 4;
            case 4: return [4 /*yield*/, cartItemModel.getCartItemByCartId(cart.id, vendorProductId)];
            case 5:
                existingItem = _a.sent();
                if (existingItem) {
                    newQuantity = existingItem.quantity + quantity;
                    // Check stock for the new total quantity
                    if (vendorProduct.stock !== null && vendorProduct.stock < newQuantity) {
                        throw new CartError("Not enough stock. Only " + vendorProduct.stock + " items available.");
                    }
                    return [2 /*return*/, cartItemModel.updateCartItem(existingItem.id, { quantity: newQuantity })];
                }
                else {
                    // 4b. If item does not exist, create a new cart item
                    // Check stock for the initial quantity
                    if (vendorProduct.stock !== null && vendorProduct.stock < quantity) {
                        throw new CartError("Not enough stock. Only " + vendorProduct.stock + " items available.");
                    }
                    return [2 /*return*/, cartItemModel.createCartItem({
                            cartId: cart.id,
                            vendorProductId: vendorProductId,
                            quantity: quantity
                        })];
                }
                return [2 /*return*/];
        }
    });
}); };
