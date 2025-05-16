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
exports.deleteCartController = exports.getCartByUserIdController = exports.addToCartController = void 0;
var cart_service_1 = require("../services/cart.service");
var cartItem_model_1 = require("../models/cartItem.model");
var cartItem_service_1 = require("../services/cartItem.service");
// --- Cart Controller Functions ---
/**
 * Controller for creating a new cart.
 * @param req - The Express request object.
 * @param res - The Express response object.
 */
exports.addToCartController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, cartItemData, cart, existingItem, updatedCart, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 11, , 12]);
                userId = req.userId;
                if (!userId) {
                    return [2 /*return*/, res.status(400).json({ error: 'User ID is required to create a cart.' })];
                }
                cartItemData = req.body;
                //  2. Validate the cart item data
                if (!cartItemData || !cartItemData.vendorProductId || typeof cartItemData.quantity !== "number" || cartItemData.quantity < 1) {
                    res.status(400).json({ error: 'Invalid cart item data.' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, cart_service_1.getCartByUserIdService(userId)];
            case 1:
                cart = _a.sent();
                if (!!cart) return [3 /*break*/, 4];
                return [4 /*yield*/, cart_service_1.createCartService(userId)];
            case 2:
                // if no existing cart, create cart and create new cart Item
                cart = _a.sent();
                return [4 /*yield*/, cartItem_model_1.createCartItem({ cartId: cart === null || cart === void 0 ? void 0 : cart.id, vendorProductId: cartItemData.vendorProductId, quantity: cartItemData.quantity })];
            case 3:
                _a.sent();
                return [3 /*break*/, 9];
            case 4: return [4 /*yield*/, cartItem_model_1.getCartItemByCartId(cart.id, cartItemData.vendorProductId)];
            case 5:
                existingItem = _a.sent();
                if (!existingItem) return [3 /*break*/, 7];
                return [4 /*yield*/, cartItem_service_1.updateCartItemService(existingItem.id, { quantity: cartItemData.quantity })];
            case 6:
                _a.sent();
                return [3 /*break*/, 9];
            case 7: return [4 /*yield*/, cartItem_model_1.createCartItem({ cartId: cart === null || cart === void 0 ? void 0 : cart.id, vendorProductId: cartItemData.vendorProductId, quantity: cartItemData.quantity })];
            case 8:
                _a.sent();
                _a.label = 9;
            case 9: return [4 /*yield*/, cart_service_1.getCartByIdService(cart.id)];
            case 10:
                updatedCart = _a.sent();
                res.status(201).json(updatedCart);
                return [3 /*break*/, 12];
            case 11:
                error_1 = _a.sent();
                res.status(500).json({ error: error_1.message || 'Internal server error' });
                return [3 /*break*/, 12];
            case 12: return [2 /*return*/];
        }
    });
}); };
/**
  * Controller for getting a user's cart.
  * @param req - The Express request object.
  * @param res - The Express response object.
  */
exports.getCartByUserIdController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, cart, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                if (!userId) {
                    return [2 /*return*/, res.status(400).json({ error: 'User ID is required.' })];
                }
                return [4 /*yield*/, cart_service_1.getCartByUserIdService(userId)];
            case 1:
                cart = _a.sent();
                if (!cart) {
                    return [2 /*return*/, res.status(404).json({ error: 'Cart not found for this user' })];
                }
                res.json(cart);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                res.status(500).json({ error: error_2.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Controller for deleting a cart.
 * @param req - The Express request object.
 * @param res - The Express response object.
 */
exports.deleteCartController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cart, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, cart_service_1.deleteCartService(req.params.id)];
            case 1:
                cart = _a.sent();
                res.json(cart);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                res.status(500).json({ error: error_3.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
