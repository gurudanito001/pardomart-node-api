"use strict";
exports.__esModule = true;
var express_1 = require("express");
var wishlist_controller_1 = require("../controllers/wishlist.controller");
// This is a placeholder for actual authentication middleware.
// In a real application, this would verify a JWT or session and attach the user to the request.
var isAuthenticated = function (req, res, next) {
    // For demonstration, we'll mock a user.
    // Replace this with your actual authentication logic.
    if (!req.user) {
        // Using a consistent mock user ID for testing purposes
        req.user = { id: 'a-mock-customer-id', role: 'customer' };
    }
    next();
};
var router = express_1["default"].Router();
/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: API for managing user wishlists.
 */
/**
 * @swagger
 * components:
 *   schemas:
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
 *         vendorProduct:
 *           $ref: '#/components/schemas/VendorProductWithRelations'
 *
 *     AddToWishlistPayload:
 *       type: object
 *       required:
 *         - vendorProductId
 *       properties:
 *         vendorProductId:
 *           type: string
 *           format: uuid
 *           description: The ID of the vendor product to add to the wishlist.
 */
router.post('/', isAuthenticated, wishlist_controller_1.addToWishlistController);
router.get('/', isAuthenticated, wishlist_controller_1.getWishlistController);
router["delete"]('/:id', isAuthenticated, wishlist_controller_1.removeFromWishlistController);
exports["default"] = router;
