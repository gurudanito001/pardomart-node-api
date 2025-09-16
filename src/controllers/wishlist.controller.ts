import { Request, Response } from 'express';
import * as wishlistService from '../services/wishlist.service';
import { WishlistError } from '../services/wishlist.service';

// It assumes an authentication middleware adds a `userId` property to the request.
interface AuthenticatedRequest extends Request {
  userId?: string;
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
 *             $ref: '#/components/schemas/CreateWishlistItemPayload'
 *     responses:
 *       201:
 *         description: The item added to the wishlist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WishlistItem'
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Product not found.
 *       409:
 *         description: Product already in wishlist.
 * components:
 *   schemas:
 *     CreateWishlistItemPayload:
 *       type: object
 *       required:
 *         - vendorProductId
 *       properties:
 *         vendorProductId:
 *           type: string
 *           format: uuid
 *           description: The ID of the vendor product to add to the wishlist.
 *     WishlistItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         vendorProductId:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     WishlistItemWithRelations:
 *       allOf:
 *         - $ref: '#/components/schemas/WishlistItem'
 *         - type: object
 *           properties:
 *             vendorProduct:
 *               $ref: '#/components/schemas/VendorProductWithRelations'
 *     VendorSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *     Product:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         barcode: { type: string }
 *         name: { type: string }
 *         description: { type: string, nullable: true }
 *         images: { type: array, items: { type: string, format: uri } }
 *         weight: { type: number, format: float, nullable: true }
 *         weightUnit: { type: string, nullable: true }
 *         attributes: { type: object, nullable: true }
 *         meta: { type: object, nullable: true }
 *         categoryIds: { type: array, items: { type: string } }
 *         isAlcohol: { type: boolean }
 *         isAgeRestricted: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     VendorProduct:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         vendorId: { type: string, format: uuid }
 *         productId: { type: string, format: uuid }
 *         price: { type: number, format: float }
 *         name: { type: string }
 *         description: { type: string, nullable: true }
 *         discountedPrice: { type: number, format: float, nullable: true }
 *         images: { type: array, items: { type: string, format: uri } }
 *         weight: { type: number, format: float, nullable: true }
 *         weightUnit: { type: string, nullable: true }
 *         isAvailable: { type: boolean }
 *         isAlcohol: { type: boolean }
 *         isAgeRestricted: { type: boolean }
 *         attributes: { type: object, nullable: true }
 *         categoryIds: { type: array, items: { type: string } }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     VendorProductWithRelations:
 *       allOf:
 *         - $ref: '#/components/schemas/VendorProduct'
 *         - type: object
 *           properties:
 *             product:
 *               $ref: '#/components/schemas/Product'
 *             vendor:
 *               $ref: '#/components/schemas/VendorSummary'
 */
export const addToWishlistController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const { vendorProductId } = req.body;

    const wishlistItem = await wishlistService.addToWishlistService(userId, vendorProductId as string);
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
 *                 $ref: '#/components/schemas/WishlistItemWithRelations'
 *       401:
 *         description: Unauthorized.
 */
export const getWishlistController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WishlistItem'
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Wishlist item not found.
 */
export const removeFromWishlistController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const { id } = req.params;
    const removedItem = await wishlistService.removeFromWishlistService(userId, id as string);
    res.status(200).json(removedItem);
  } catch (error) {
    if (error instanceof WishlistError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};