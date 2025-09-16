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
exports.removeFromWishlistController = exports.getWishlistController = exports.addToWishlistController = void 0;
var wishlistService = require("../services/wishlist.service");
var wishlist_service_1 = require("../services/wishlist.service");
/**
 * @swagger
 * /wishlist:
 *   post:
 *     summary: Add a product to the wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWishlistItemPayload'
 *     responses:
 *       201:
 *         description: The item added to the wishlist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WishlistItem'
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Product not found.
 *       409:
 *         description: Product already in wishlist.
 * components:
 *   schemas:
 *     CreateWishlistItemPayload:
 *       type: object
 *       required:
 *         - vendorProductId
 *       properties:
 *         vendorProductId:
 *           type: string
 *           format: uuid
 *           description: The ID of the vendor product to add to the wishlist.
 *     WishlistItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         vendorProductId:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     WishlistItemWithRelations:
 *       allOf:
 *         - $ref: '#/components/schemas/WishlistItem'
 *         - type: object
 *           properties:
 *             vendorProduct:
 *               $ref: '#/components/schemas/VendorProductWithRelations'
 *     VendorSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *     Product:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         barcode: { type: string }
 *         name: { type: string }
 *         description: { type: string, nullable: true }
 *         images: { type: array, items: { type: string, format: uri } }
 *         weight: { type: number, format: float, nullable: true }
 *         weightUnit: { type: string, nullable: true }
 *         attributes: { type: object, nullable: true }
 *         meta: { type: object, nullable: true }
 *         categoryIds: { type: array, items: { type: string } }
 *         isAlcohol: { type: boolean }
 *         isAgeRestricted: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     VendorProduct:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         vendorId: { type: string, format: uuid }
 *         productId: { type: string, format: uuid }
 *         price: { type: number, format: float }
 *         name: { type: string }
 *         description: { type: string, nullable: true }
 *         discountedPrice: { type: number, format: float, nullable: true }
 *         images: { type: array, items: { type: string, format: uri } }
 *         weight: { type: number, format: float, nullable: true }
 *         weightUnit: { type: string, nullable: true }
 *         isAvailable: { type: boolean }
 *         isAlcohol: { type: boolean }
 *         isAgeRestricted: { type: boolean }
 *         attributes: { type: object, nullable: true }
 *         categoryIds: { type: array, items: { type: string } }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     VendorProductWithRelations:
 *       allOf:
 *         - $ref: '#/components/schemas/VendorProduct'
 *         - type: object
 *           properties:
 *             product:
 *               $ref: '#/components/schemas/Product'
 *             vendor:
 *               $ref: '#/components/schemas/VendorSummary'
 */
exports.addToWishlistController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, vendorProductId, wishlistItem, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                vendorProductId = req.body.vendorProductId;
                return [4 /*yield*/, wishlistService.addToWishlistService(userId, vendorProductId)];
            case 1:
                wishlistItem = _a.sent();
                res.status(201).json(wishlistItem);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                if (error_1 instanceof wishlist_service_1.WishlistError) {
                    return [2 /*return*/, res.status(error_1.statusCode).json({ error: error_1.message })];
                }
                console.error('Error adding to wishlist:', error_1);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: Get the user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of items in the user's wishlist.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WishlistItemWithRelations'
 *       401:
 *         description: Unauthorized.
 */
exports.getWishlistController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, wishlist, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                return [4 /*yield*/, wishlistService.getWishlistService(userId)];
            case 1:
                wishlist = _a.sent();
                res.status(200).json(wishlist);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error getting wishlist:', error_2);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /wishlist/{id}:
 *   delete:
 *     summary: Remove an item from the wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the wishlist item to remove.
 *     responses:
 *       200:
 *         description: The removed item.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WishlistItem'
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Wishlist item not found.
 */
exports.removeFromWishlistController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, id, removedItem, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                id = req.params.id;
                return [4 /*yield*/, wishlistService.removeFromWishlistService(userId, id)];
            case 1:
                removedItem = _a.sent();
                res.status(200).json(removedItem);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                if (error_3 instanceof wishlist_service_1.WishlistError) {
                    return [2 /*return*/, res.status(error_3.statusCode).json({ error: error_3.message })];
                }
                console.error('Error removing from wishlist:', error_3);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
