import { PrismaClient, WishlistItem } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Adds a vendor product to a user's wishlist.
 * @param userId - The ID of the user.
 * @param vendorProductId - The ID of the vendor product.
 * @returns The created wishlist item.
 */
export const addToWishlist = async (userId: string, vendorProductId: string): Promise<WishlistItem> => {
  return prisma.wishlistItem.create({
    data: {
      userId,
      vendorProductId,
    },
  });
};

/**
 * Retrieves all items in a user's wishlist.
 * @param userId - The ID of the user.
 * @returns A list of wishlist items with product details.
 */
export const getWishlistByUserId = async (userId: string): Promise<WishlistItem[]> => {
  return prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      vendorProduct: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Finds a single wishlist item by user and product ID to check for existence.
 * @param userId - The ID of the user.
 * @param vendorProductId - The ID of the vendor product.
 * @returns The wishlist item or null if not found.
 */
export const findWishlistItem = async (userId: string, vendorProductId: string): Promise<WishlistItem | null> => {
  return prisma.wishlistItem.findUnique({
    where: {
      userId_vendorProductId: {
        userId,
        vendorProductId,
      },
    },
  });
};

/**
 * Removes an item from the wishlist by its ID.
 * @param id - The ID of the wishlist item to remove.
 * @returns The deleted wishlist item.
 */
export const removeFromWishlist = async (id: string): Promise<WishlistItem> => {
  return prisma.wishlistItem.delete({
    where: { id },
  });
};

/**
 * Retrieves a wishlist item by its unique ID.
 * @param id - The ID of the wishlist item.
 * @returns The wishlist item or null if not found.
 */
export const getWishlistItemById = async (id: string): Promise<WishlistItem | null> => {
  return prisma.wishlistItem.findUnique({
    where: { id },
  });
};