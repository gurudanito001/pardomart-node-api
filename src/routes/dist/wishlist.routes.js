"use strict";
exports.__esModule = true;
var express_1 = require("express");
var wishlistController = require("../controllers/wishlist.controller");
var validation_middleware_1 = require("../middlewares/validation.middleware");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = express_1.Router();
// All routes in this file are protected and require authentication
router.use(auth_middleware_1.authenticate);
// Add an item to the user's wishlist
router.post('/', validation_middleware_1.validate(validation_middleware_1.validateAddToWishlist), wishlistController.addToWishlistController);
// Get all items from the user's wishlist
router.get('/', wishlistController.getWishlistController);
// Remove an item from the user's wishlist by its ID
router["delete"]('/:id', validation_middleware_1.validate(validation_middleware_1.validateRemoveFromWishlist), wishlistController.removeFromWishlistController);
exports["default"] = router;
