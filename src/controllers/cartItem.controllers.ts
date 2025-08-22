import { Request, Response } from 'express';
import { getCartItemByIdService, updateCartItemService, deleteCartItemService } from '../services/cartItem.service';

/**
 * @swagger
 * /cart-items/{id}:
 *   get:
 *     summary: Get a single cart item by its ID
 *     tags: [CartItem]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the cart item.
 *     responses:
 *       200:
 *         description: The requested cart item.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItem'
 *       404:
 *         description: Cart item not found.
 *       500:
 *         description: Internal server error.
 */
export const getCartItemByIdController = async (req: Request, res: Response) => {
  try {
    const cartItem = await getCartItemByIdService(req.params.id);
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    res.json(cartItem);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /cart-items/{id}:
 *   put:
 *     summary: Update a cart item's quantity
 *     tags: [CartItem]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the cart item to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartItemPayload'
 *     responses:
 *       200:
 *         description: The updated cart item.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItem'
 *       500:
 *         description: Internal server error.
 */
export const updateCartItemController = async (req: Request, res: Response) => {
  try {
    const cartItem = await updateCartItemService(req.params.id, req.body);
    res.json(cartItem);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const deleteCartItemController = async (req: Request, res: Response) => {
  try {
    const cartItem = await deleteCartItemService(req.params.id);
    res.json(cartItem);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};