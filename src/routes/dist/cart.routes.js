"use strict";
exports.__esModule = true;
var express_1 = require("express");
var cart_controller_1 = require("../controllers/cart.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = express_1.Router();
// All cart routes should be authenticated
router.use(auth_middleware_1.authenticate);
/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get all carts for the current user
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of the user's carts, one for each vendor.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cart'
 */
router.get('/', cart_controller_1.getCartsController);
/**
 * @swagger
 * /cart/{cartId}:
 *   delete:
 *     summary: Delete an entire cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema: { type: 'string', format: 'uuid' }
 *     responses:
 *       200:
 *         description: The deleted cart.
 */
router["delete"]('/:cartId', cart_controller_1.deleteCartController);
exports["default"] = router;
