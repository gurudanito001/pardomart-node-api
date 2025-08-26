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
exports.removeCartItemController = exports.updateCartItemQuantityController = exports.addItemToCartController = exports.getCartController = void 0;
var cartService = require("../services/cart.service");
exports.getCartController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, cart, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                return [4 /*yield*/, cartService.getCartByUserIdService(userId)];
            case 1:
                cart = _a.sent();
                res.status(200).json(cart || { userId: userId, items: [] }); // Return empty cart if none exists
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error in getCartController:', error_1);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.addItemToCartController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, vendorProductId, quantity, result, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = req.userId;
                _a = req.body, vendorProductId = _a.vendorProductId, quantity = _a.quantity;
                if (!vendorProductId || !quantity) {
                    return [2 /*return*/, res.status(400).json({ error: 'vendorProductId and quantity are required.' })];
                }
                return [4 /*yield*/, cartService.addItemToCartService(userId, { vendorProductId: vendorProductId, quantity: quantity })];
            case 1:
                result = _b.sent();
                res.status(201).json(result);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _b.sent();
                if (error_2.name === 'CartError') {
                    return [2 /*return*/, res.status(400).json({ error: error_2.message })];
                }
                console.error('Error in addItemToCartController:', error_2);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
// Stubs for other controllers you would add
exports.updateCartItemQuantityController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // Logic to update item quantity would go here
        res.status(501).json({ message: 'Not implemented' });
        return [2 /*return*/];
    });
}); };
exports.removeCartItemController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // Logic to remove an item would go here
        res.status(501).json({ message: 'Not implemented' });
        return [2 /*return*/];
    });
}); };
