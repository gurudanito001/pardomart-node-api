import { Router } from 'express';
import {
  getCartsController,
  deleteCartController,
} from '../controllers/cart.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All cart routes should be authenticated
router.use(authenticate);

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
router.get('/', getCartsController);

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
router.delete('/:cartId', deleteCartController);

export default router;