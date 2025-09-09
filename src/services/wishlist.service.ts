import { WishlistItem } from '@prisma/client';
import * as wishlistModel from '../models/wishlist.model';
import * as productModel from '../models/product.model';

export class WishlistError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'WishlistError';
    this.statusCode = statusCode;
  }
}

/**
 * Adds a product to a user's wishlist after validation.
 * @param userId - The ID of the user.
 * @param vendorProductId - The ID of the vendor product to add.
 * @returns The created wishlist item.
 */
export const addToWishlistService = async (userId: string, vendorProductId: string): Promise<WishlistItem> => {
  // 1. Check if product exists
  const product = await productModel.getVendorProductById(vendorProductId);
  if (!product) {
    throw new WishlistError('Product not found.', 404);
  }

  // 2. Check if item is already in wishlist
  const existingItem = await wishlistModel.findWishlistItem(userId, vendorProductId);
  if (existingItem) {
    throw new WishlistError('Product is already in your wishlist.', 409);
  }

  // 3. Add to wishlist
  return wishlistModel.addToWishlist(userId, vendorProductId);
};

/**
 * Retrieves all items in a user's wishlist.
 * @param userId - The ID of the user.
 * @returns A list of wishlist items.
 */
export const getWishlistService = async (userId: string): Promise<WishlistItem[]> => {
  return wishlistModel.getWishlistByUserId(userId);
};

/**
 * Removes an item from a user's wishlist after authorization.
 * @param userId - The ID of the user making the request.
 * @param wishlistItemId - The ID of the wishlist item to remove.
 * @returns The removed wishlist item.
 */
export const removeFromWishlistService = async (userId: string, wishlistItemId: string): Promise<WishlistItem> => {
  // 1. Check if wishlist item exists and belongs to the user
  const wishlistItem = await wishlistModel.getWishlistItemById(wishlistItemId);
  if (!wishlistItem) {
    throw new WishlistError('Wishlist item not found.', 404);
  }
  if (wishlistItem.userId !== userId) {
    throw new WishlistError('You are not authorized to remove this item.', 403);
  }

  // 2. Remove from wishlist
  return wishlistModel.removeFromWishlist(wishlistItemId);
};