import { Request, Response } from 'express';
import { getCartItemByIdService, updateCartItemService, deleteCartItemService } from '../services/cartItem.service';
import * as cartService from '../services/cart.service';
import { Prisma } from '@prisma/client';
import { CartError } from '../services/cart.service';

import { AuthenticatedRequest } from './vendor.controller';

/**
 * @swagger
 * /cart-items:
 *   post:
 *     summary: Add or update an item in the cart.
 *     description: >
 *       Adds an item to the appropriate vendor's cart. If a cart for that vendor
 *       doesn't exist, it's created. If the item is already in the cart,
 *       its quantity is updated to the new value provided.
 *     tags: [CartItem]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddCartItemPayload'
 *     responses:
 *       201:
 *         description: Item added or updated successfully. Returns the updated cart.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Bad request (e.g., product not found, not enough stock).
 *       401:
 *         description: User not authenticated.
 */
export const addItemToCartController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const { vendorProductId, quantity } = req.body;

    if (!vendorProductId || typeof quantity !== 'number') {
      return res.status(400).json({ error: 'vendorProductId and a valid quantity are required.' });
    }

    const updatedCart = await cartService.addItemToCartService(userId, { vendorProductId, quantity });
    res.status(201).json(updatedCart);
  } catch (error: any) {
    if (error instanceof CartError) {
        return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Error in addItemToCartController:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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
export const updateCartItemController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id: cartItemId } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number') {
      return res.status(400).json({ error: 'A valid quantity is required.' });
    }

    // Authorization: Check if the user owns the cart item before updating
    const itemToUpdate = await getCartItemByIdService(cartItemId);
    if (!itemToUpdate) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    const itemOwnerId = itemToUpdate.cart?.userId;
    if (itemOwnerId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to update this item.' });
    }

    if (quantity <= 0) {
      const deletedItem = await deleteCartItemService(cartItemId);
      return res.status(200).json(deletedItem);
    }

    const updatedCartItem = await updateCartItemService(cartItemId, { quantity });
    res.json(updatedCartItem);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    if (error instanceof CartError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /cart-items/{id}:
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
    const { id: cartItemId } = req.params;

    // Authorization: Check if the user owns the cart item before deleting
    const itemToDelete = await getCartItemByIdService(cartItemId);
    if (!itemToDelete) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    const itemOwnerId = itemToDelete.cart?.userId;
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