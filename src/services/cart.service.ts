
import * as cartModel from '../models/cart.model'; // Adjust the path if needed
import * as cartItemModel from '../models/cartItem.model';
import { PrismaClient, Cart, CartItem } from '@prisma/client';
import { getVendorProductById } from './product.service';

// Custom error class for better error handling in the controller
export class CartError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'CartError';
    this.statusCode = statusCode;
  }
}

const prisma = new PrismaClient();

// --- Cart Service Functions ---

/**
 * Creates a new cart for a user.
 * @param userId - The ID of the user.
 * @param vendorId - The ID of the vendor.
 * @returns The newly created cart.
 */
export const createCartService = async (userId: string, vendorId: string): Promise<Cart> => {
  return cartModel.createCart({ userId, vendorId });
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
 * Retrieves all carts for a specific user.
 * @param userId - The ID of the user whose cart is to be retrieved.
 * @returns An array of the user's carts.
 */
export const getCartsByUserIdService = async (userId: string): Promise<Cart[]> => {
  return cartModel.getCartsByUserId(userId);
};

export const getCartByUserIdAndVendorIdService = async (userId: string, vendorId: string): Promise<Cart | null> => {
  return cartModel.getCartByUserIdAndVendorId(userId, vendorId);
};

/**
 * Deletes a cart by its ID.
 * @param id - The ID of the cart to delete.
 * @returns The deleted cart.
 */
export const deleteCartService = async (id: string): Promise<Cart> => {
  return cartModel.deleteCart(id);
};

interface AddItemPayload {
  vendorProductId: string;
  quantity: number;
}

/**
 * Adds or updates an item in the correct vendor-specific cart for a user.
 * @param userId The ID of the user.
 * @param payload The item and quantity to add.
 * @returns The updated cart.
 */
export const addItemToCartService = async (userId: string, payload: AddItemPayload): Promise<Cart | null> => {
  const { vendorProductId, quantity } = payload;

  if (typeof quantity !== 'number' || quantity < 1) {
    throw new CartError('Quantity must be a positive integer.');
  }

  // 1. Get vendor product to find the vendorId and check availability
  const vendorProduct = await getVendorProductById(vendorProductId);
  if (!vendorProduct) {
    throw new CartError('Product not found.', 404);
  }
  if (!vendorProduct.isAvailable) {
    throw new CartError('Product is currently not available.');
  }
  const { vendorId } = vendorProduct;

  // 2. Find or create a cart for the specific user-vendor pair
  let cart = await getCartByUserIdAndVendorIdService(userId, vendorId);
  if (!cart) {
    cart = await createCartService(userId, vendorId);
  }

  if (!cart) {
    // This should not happen if createCartService is correct
    throw new CartError('Could not find or create a cart.', 500);
  }

  // 3. Check if item already exists in the cart
  const existingItem = await cartItemModel.getCartItemByCartIdAndVendorProductId(cart.id, vendorProductId);

  if (existingItem) {
    // 4a. If item exists, update its quantity.
    await cartItemModel.updateCartItem(existingItem.id, { quantity });
  } else {
    // 4b. If item does not exist, create a new cart item
    await cartItemModel.createCartItem({
      cartId: cart.id,
      vendorProductId,
      quantity,
    });
  }

  // 5. Return the fully updated cart
  return getCartByIdService(cart.id);
};

export const clearCartService = async (cartId: string): Promise<Cart | null> => {
    const cart = await getCartByIdService(cartId);
    if (!cart) {
        throw new CartError('Cart not found', 404);
    }
    await prisma.cartItem.deleteMany({ where: { cartId } });
    return getCartByIdService(cartId);
};
