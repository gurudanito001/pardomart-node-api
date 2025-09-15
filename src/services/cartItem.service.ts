import * as cartItemModel from '../models/cartItem.model'; // Adjust the path if needed
import { CartItem, Prisma } from '@prisma/client';
import { CartError } from './cart.service';

// --- CartItem Service Functions ---
export const createCartItemService = async (
  payload: cartItemModel.CreateCartItemPayload
): Promise<CartItem> => {
  return cartItemModel.createCartItem(payload);
};

export const getCartItemByIdService = async (id: string): Promise<cartItemModel.CartItemWithCart | null> => {
  return cartItemModel.getCartItemById(id);
};

export const getCartItemByCartIdAndVendorProductIdService = async (
  cartId: string,
  vendorProductId: string
): Promise<CartItem | null> => {
  return cartItemModel.getCartItemByCartIdAndVendorProductId(cartId, vendorProductId);
};

export const updateCartItemService = async (
  id: string,
  payload: cartItemModel.UpdateCartItemPayload
): Promise<CartItem> => {
  const { quantity } = payload;
  if (quantity === undefined) {
    throw new CartError('Quantity is required for update.');
  }
  if (quantity < 1) {
    // If quantity is 0 or less, it should be a delete operation.
    // The controller should handle this and call deleteCartItemService instead.
    throw new CartError('Quantity must be a positive number.');
  }

  const cartItem = await getCartItemByIdService(id);
  if (!cartItem?.vendorProduct) {
    throw new CartError('Cart item or associated product not found.', 404);
  }
  return cartItemModel.updateCartItem(id, { quantity });
};

export const deleteCartItemService = async (id: string): Promise<CartItem> => {
  return cartItemModel.deleteCartItem(id);
};