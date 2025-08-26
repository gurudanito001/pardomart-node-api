"use strict";
exports.__esModule = true;
var express_1 = require("express");
var cartItem_controllers_1 = require("../controllers/cartItem.controllers");
var auth_middleware_1 = require("../middlewares/auth.middleware");
// --- CartItem Routes ---
var router = express_1.Router();
router.use(auth_middleware_1.authenticate); // Protect all cart item routes
router.get('/:id', cartItem_controllers_1.getCartItemByIdController);
router.put('/:id', cartItem_controllers_1.updateCartItemController);
router["delete"]('/:id', cartItem_controllers_1.deleteCartItemController);
exports["default"] = router;
