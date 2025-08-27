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