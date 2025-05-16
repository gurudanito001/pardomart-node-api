
import * as cartModel from '../models/cart.model'; // Adjust the path if needed
import { Cart } from '@prisma/client';

// --- Cart Service Functions ---

/**
 * Creates a new cart for a user.
 * @param userId - The ID of the user for whom the cart is created.
 * @returns The newly created cart.
 */
export const createCartService = async (userId: string): Promise<Cart> => {
  return cartModel.createCart({ userId}); // Initialize with empty items
};

/**
 * Retrieves a cart by its ID.
 * @param id - The ID of the cart to retrieve.
 * @returns The cart, or null if not found.
 */
export const getCartByIdService = async (id: string): Promise<Cart | null> => {
  return cartModel.getCartById(id);
};

/**
 * Retrieves the cart for a specific user.
 * @param userId - The ID of the user whose cart is to be retrieved.
 * @returns The user's cart, or null if not found.
 */
export const getCartByUserIdService = async (userId: string): Promise<Cart | null> => {
  return cartModel.getCartByUserId(userId);
};


/**
 * Deletes a cart by its ID.
 * @param id - The ID of the cart to delete.
 * @returns The deleted cart.
 */
export const deleteCartService = async (id: string): Promise<Cart> => {
  return cartModel.deleteCart(id);
};