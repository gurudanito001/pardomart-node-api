"use strict";
exports.__esModule = true;
var express_1 = require("express");
var cart_controller_1 = require("../controllers/cart.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = express_1.Router();
// All cart routes should be authenticated
router.use(auth_middleware_1.authenticate);
router.get('/', cart_controller_1.getCartsController);
router.get('/:cartId', cart_controller_1.getCartByIdController);
router["delete"]('/:cartId', cart_controller_1.deleteCartController);
exports["default"] = router;
