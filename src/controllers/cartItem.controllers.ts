import { Request, Response } from 'express';
import { getCartItemByIdService, updateCartItemService, deleteCartItemService } from '../services/cartItem.service';
import { Prisma } from '@prisma/client';

import { AuthenticatedRequest } from './vendor.controller';

/**
 * @swagger
 * /cartItem/{id}:
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
export const getCartItemByIdController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const cartItem = await getCartItemByIdService(req.params.id);

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Authorization check: Ensure the user owns the cart item
    const itemOwnerId = cartItem.cart?.userId;
    if (itemOwnerId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to access this item.' });
    }

    res.json(cartItem);
  } catch (error: any) {
    console.error('Error in getCartItemByIdController:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /cartItem/{id}:
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
export const updateCartItemController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const cartItemId = req.params.id;

    // Authorization: Check if the user owns the cart item before updating
    const itemToUpdate = await getCartItemByIdService(cartItemId);
    if (!itemToUpdate) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    const itemOwnerId = itemToUpdate.cart?.userId ;
    if (itemOwnerId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to update this item.' });
    }

    const updatedCartItem = await updateCartItemService(cartItemId, req.body);
    res.json(updatedCartItem);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /cartItem/{id}:
 *   delete:
 *     summary: Delete a cart item by its ID
 *     tags: [CartItem]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the cart item to delete.
 *     responses:
 *       200:
 *         description: The deleted cart item.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItem'
 *       500:
 *         description: Internal server error.
 */
export const deleteCartItemController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const cartItemId = req.params.id;

    // Authorization: Check if the user owns the cart item before deleting
    const itemToDelete = await getCartItemByIdService(cartItemId);
    if (!itemToDelete) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    const itemOwnerId = itemToDelete.cart?.userId 
    if (itemOwnerId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to delete this item.' });
    }

    const deletedCartItem = await deleteCartItemService(cartItemId);
    res.json(deletedCartItem);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};