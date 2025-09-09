import { Request, Response } from 'express';
import * as wishlistService from '../services/wishlist.service';
import { WishlistError } from '../services/wishlist.service';

// This interface is a placeholder for your actual authenticated request type.
// It assumes an authentication middleware adds a `user` object to the request.
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * @swagger
 * /wishlist:
 *   post:
 *     summary: Add a product to the wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToWishlistPayload'
 *     responses:
 *       201:
 *         description: The item added to the wishlist.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Product not found.
 *       409:
 *         description: Product already in wishlist.
 */
export const addToWishlistController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { vendorProductId } = req.body;
    if (!vendorProductId) {
      return res.status(400).json({ error: 'vendorProductId is required.' });
    }

    const wishlistItem = await wishlistService.addToWishlistService(userId, vendorProductId);
    res.status(201).json(wishlistItem);
  } catch (error) {
    if (error instanceof WishlistError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: Get the user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of items in the user's wishlist.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WishlistItem'
 */
export const getWishlistController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const wishlist = await wishlistService.getWishlistService(userId);
    res.status(200).json(wishlist);
  } catch (error) {
    console.error('Error getting wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /wishlist/{id}:
 *   delete:
 *     summary: Remove an item from the wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the wishlist item to remove.
 *     responses:
 *       200:
 *         description: The removed item.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Wishlist item not found.
 */
export const removeFromWishlistController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const removedItem = await wishlistService.removeFromWishlistService(userId, id);
    res.status(200).json(removedItem);
  } catch (error) {
    if (error instanceof WishlistError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};