import { Response } from 'express';
import * as cartService from '../services/cart.service';
import { AuthenticatedRequest } from './vendor.controller';
import { CartError } from '../services/cart.service';

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
 *       401:
 *         description: User not authenticated.
 */
export const getCartsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const carts = await cartService.getCartsByUserIdService(userId);
    res.status(200).json(carts || []);
  } catch (error: any) {
    console.error('Error in getCartsController:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /cart/{cartId}:
 *   get:
 *     summary: Get a specific cart by its ID
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the cart to retrieve.
 *     responses:
 *       200:
 *         description: The requested cart object.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       401:
 *         description: User not authenticated.
 *       403:
 *         description: User not authorized to view this cart.
 *       404:
 *         description: Cart not found.
 */
export const getCartByIdController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const { cartId } = req.params;
    const cart = await cartService.getCartByIdService(cartId);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found.' });
    }
    if (cart.userId !== userId) {
      return res.status(403).json({ error: 'You are not authorized to view this cart.' });
    }
    res.status(200).json(cart);
  } catch (error: any) {
    console.error('Error in getCartByIdController:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /cart/{cartId}:
 *   delete:
 *     summary: Delete a cart by its ID
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the cart to delete.
 *     responses:
 *       200:
 *         description: The cart was deleted successfully. Returns the deleted cart object.
 *       404:
 *         description: Cart not found or user does not have permission to delete it.
 *
 */
export const deleteCartController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId as string;
        const { cartId } = req.params;

        const cart = await cartService.getCartByIdService(cartId);
        if (!cart || cart.userId !== userId) {
            return res.status(404).json({ error: 'Cart not found or you do not have permission to delete it.' });
        }

        const deletedCart = await cartService.deleteCartService(cartId);
        res.status(200).json(deletedCart);
    } catch (error: any) {
        console.error('Error in deleteCartController:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};