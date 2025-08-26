import { Router } from 'express';
import {
  getCartController,
  addItemToCartController,
  updateCartItemQuantityController,
  removeCartItemController,
} from '../controllers/cart.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All cart routes should be authenticated
router.use(authenticate);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get the current user's shopping cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user's shopping cart with items.
 */
router.get('/', getCartController);

/**
 * @swagger
 * /cart/items:
 *   post:
 *     summary: Add an item to the shopping cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vendorProductId: { type: 'string', format: 'uuid' }
 *               quantity: { type: 'integer', minimum: 1 }
 *     responses:
 *       201:
 *         description: The added or updated cart item.
 */
router.post('/items', addItemToCartController);

// You would also add PUT /items/{itemId} and DELETE /items/{itemId} here

export default router;