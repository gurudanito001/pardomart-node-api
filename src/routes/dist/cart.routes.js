"use strict";
exports.__esModule = true;
var express_1 = require("express");
var cart_controllers_1 = require("../controllers/cart.controllers");
var auth_middleware_1 = require("../middlewares/auth.middleware");
// --- Cart Routes ---
var router = express_1.Router();
router.get('/getCartBy/user', auth_middleware_1.authenticate, cart_controllers_1.getCartByUserIdController); // New route to get cart by user ID
router.post('/add', auth_middleware_1.authenticate, cart_controllers_1.addToCartController);
router["delete"]('/:id', cart_controllers_1.deleteCartController);
exports["default"] = router;
