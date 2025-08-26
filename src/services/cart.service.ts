
import * as cartModel from '../models/cart.model'; // Adjust the path if needed
import * as cartItemModel from '../models/cartItem.model';
import { PrismaClient, Cart } from '@prisma/client';

const prisma = new PrismaClient();

// Custom error class for better error handling in the controller
export class CartError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'CartError';
    this.statusCode = statusCode;
  }
}

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

interface AddItemPayload {
  vendorProductId: string;
  quantity: number;
}

/**
 * Adds an item to a user's shopping cart.
 * If the user has no cart, one is created.
 * If the item is already in the cart, its quantity is updated.
 * @param userId The ID of the user.
 * @param payload The item and quantity to add.
 * @returns The created or updated cart item.
 */
export const addItemToCartService = async (userId: string, payload: AddItemPayload) => {
  const { vendorProductId, quantity } = payload;

  if (quantity <= 0) {
    throw new CartError('Quantity must be a positive number.');
  }

  // 1. Validate product exists and is available
  const vendorProduct = await prisma.vendorProduct.findUnique({ where: { id: vendorProductId } });
  if (!vendorProduct) {
    throw new CartError('Product not found.', 404);
  }
  if (!vendorProduct.isAvailable) {
    throw new CartError('Product is currently not available.');
  }

  // 2. Find or create a cart for the user
  let cart = await getCartByUserIdService(userId);
  if (!cart) {
    cart = await createCartService(userId);
  }

  // 3. Check if item already exists in the cart
  const existingItem = await cartItemModel.getCartItemByCartId(cart.id, vendorProductId);

  if (existingItem) {
    // 4a. If item exists, update its quantity
    const newQuantity = existingItem.quantity + quantity;

    // Check stock for the new total quantity
    if (vendorProduct.stock !== null && vendorProduct.stock < newQuantity) {
      throw new CartError(`Not enough stock. Only ${vendorProduct.stock} items available.`);
    }
    return cartItemModel.updateCartItem(existingItem.id, { quantity: newQuantity });
  } else {
    // 4b. If item does not exist, create a new cart item
    // Check stock for the initial quantity
    if (vendorProduct.stock !== null && vendorProduct.stock < quantity) {
        throw new CartError(`Not enough stock. Only ${vendorProduct.stock} items available.`);
    }
    return cartItemModel.createCartItem({
      cartId: cart.id,
      vendorProductId,
      quantity,
    });
  }
};
