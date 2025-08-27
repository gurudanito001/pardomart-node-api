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
exports.deleteCartItemController = exports.updateCartItemController = exports.getCartItemByIdController = exports.addItemToCartController = void 0;
var cartItem_service_1 = require("../services/cartItem.service");
var cartService = require("../services/cart.service");
var client_1 = require("@prisma/client");
var cart_service_1 = require("../services/cart.service");
/**
 * @swagger
 * /cart-items:
 *   post:
 *     summary: Add or update an item in the cart.
 *     description: >
 *       Adds an item to the appropriate vendor's cart. If a cart for that vendor
 *       doesn't exist, it's created. If the item is already in the cart,
 *       its quantity is updated to the new value provided.
 *     tags: [CartItem]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vendorProductId
 *               - quantity
 *             properties:
 *               vendorProductId:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Item added or updated successfully. Returns the updated cart.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Bad request (e.g., product not found, not enough stock).
 *       401:
 *         description: User not authenticated.
 */
exports.addItemToCartController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, vendorProductId, quantity, updatedCart, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = req.userId;
                _a = req.body, vendorProductId = _a.vendorProductId, quantity = _a.quantity;
                if (!vendorProductId || typeof quantity !== 'number') {
                    return [2 /*return*/, res.status(400).json({ error: 'vendorProductId and a valid quantity are required.' })];
                }
                return [4 /*yield*/, cartService.addItemToCartService(userId, { vendorProductId: vendorProductId, quantity: quantity })];
            case 1:
                updatedCart = _b.sent();
                res.status(201).json(updatedCart);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                if (error_1 instanceof cart_service_1.CartError) {
                    return [2 /*return*/, res.status(error_1.statusCode).json({ error: error_1.message })];
                }
                console.error('Error in addItemToCartController:', error_1);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /cart-items/{id}:
 *   get:
 *     summary: Get a single cart item by its ID
 *     tags: [CartItem]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the cart item.
 *     responses:
 *       200:
 *         description: The requested cart item.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItem'
 *       404:
 *         description: Cart item not found.
 *       500:
 *         description: Internal server error.
 */
exports.getCartItemByIdController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, cartItem, itemOwnerId, error_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = req.userId;
                return [4 /*yield*/, cartItem_service_1.getCartItemByIdService(req.params.id)];
            case 1:
                cartItem = _b.sent();
                if (!cartItem) {
                    return [2 /*return*/, res.status(404).json({ error: 'Cart item not found' })];
                }
                itemOwnerId = (_a = cartItem.cart) === null || _a === void 0 ? void 0 : _a.userId;
                if (itemOwnerId !== userId) {
                    return [2 /*return*/, res.status(403).json({ error: 'Forbidden: You do not have permission to access this item.' })];
                }
                res.json(cartItem);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _b.sent();
                console.error('Error in getCartItemByIdController:', error_2);
                res.status(500).json({ error: error_2.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /cart-items/{id}:
 *   put:
 *     summary: Update a cart item's quantity
 *     tags: [CartItem]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the cart item to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartItemPayload'
 *     responses:
 *       200:
 *         description: The updated cart item.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItem'
 *       500:
 *         description: Internal server error.
 */
exports.updateCartItemController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, cartItemId, quantity, itemToUpdate, itemOwnerId, deletedItem, updatedCartItem, error_3;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                userId = req.userId;
                cartItemId = req.params.id;
                quantity = req.body.quantity;
                if (typeof quantity !== 'number') {
                    return [2 /*return*/, res.status(400).json({ error: 'A valid quantity is required.' })];
                }
                return [4 /*yield*/, cartItem_service_1.getCartItemByIdService(cartItemId)];
            case 1:
                itemToUpdate = _b.sent();
                if (!itemToUpdate) {
                    return [2 /*return*/, res.status(404).json({ error: 'Cart item not found' })];
                }
                itemOwnerId = (_a = itemToUpdate.cart) === null || _a === void 0 ? void 0 : _a.userId;
                if (itemOwnerId !== userId) {
                    return [2 /*return*/, res.status(403).json({ error: 'Forbidden: You do not have permission to update this item.' })];
                }
                if (!(quantity <= 0)) return [3 /*break*/, 3];
                return [4 /*yield*/, cartItem_service_1.deleteCartItemService(cartItemId)];
            case 2:
                deletedItem = _b.sent();
                return [2 /*return*/, res.status(200).json(deletedItem)];
            case 3: return [4 /*yield*/, cartItem_service_1.updateCartItemService(cartItemId, { quantity: quantity })];
            case 4:
                updatedCartItem = _b.sent();
                res.json(updatedCartItem);
                return [3 /*break*/, 6];
            case 5:
                error_3 = _b.sent();
                if (error_3 instanceof client_1.Prisma.PrismaClientKnownRequestError && error_3.code === 'P2025') {
                    return [2 /*return*/, res.status(404).json({ error: 'Cart item not found' })];
                }
                if (error_3 instanceof cart_service_1.CartError) {
                    return [2 /*return*/, res.status(error_3.statusCode).json({ error: error_3.message })];
                }
                res.status(500).json({ error: error_3.message || 'Internal server error' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /cart-items/{id}:
 *   delete:
 *     summary: Delete a cart item by its ID
 *     tags: [CartItem]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the cart item to delete.
 *     responses:
 *       200:
 *         description: The deleted cart item.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItem'
 *       500:
 *         description: Internal server error.
 */
exports.deleteCartItemController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, cartItemId, itemToDelete, itemOwnerId, deletedCartItem, error_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                userId = req.userId;
                cartItemId = req.params.id;
                return [4 /*yield*/, cartItem_service_1.getCartItemByIdService(cartItemId)];
            case 1:
                itemToDelete = _b.sent();
                if (!itemToDelete) {
                    return [2 /*return*/, res.status(404).json({ error: 'Cart item not found' })];
                }
                itemOwnerId = (_a = itemToDelete.cart) === null || _a === void 0 ? void 0 : _a.userId;
                if (itemOwnerId !== userId) {
                    return [2 /*return*/, res.status(403).json({ error: 'Forbidden: You do not have permission to delete this item.' })];
                }
                return [4 /*yield*/, cartItem_service_1.deleteCartItemService(cartItemId)];
            case 2:
                deletedCartItem = _b.sent();
                res.json(deletedCartItem);
                return [3 /*break*/, 4];
            case 3:
                error_4 = _b.sent();
                if (error_4 instanceof client_1.Prisma.PrismaClientKnownRequestError && error_4.code === 'P2025') {
                    return [2 /*return*/, res.status(404).json({ error: 'Cart item not found' })];
                }
                res.status(500).json({ error: error_4.message || 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
