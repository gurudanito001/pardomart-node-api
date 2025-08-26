

import * as cartItemModel from '../models/cartItem.model'; // Adjust the path if needed
import { CartItem } from '@prisma/client';

// --- CartItem Service Functions ---
export const createCartItemService = async (payload: cartItemModel.CreateCartItemPayload): Promise<CartItem> => {
  return cartItemModel.createCartItem(payload);
};

export const getCartItemByIdService = async (id: string): Promise<cartItemModel.CartItemWithCart | null> => {
  return cartItemModel.getCartItemById(id);
};

export const updateCartItemService = async (
  id: string,
  payload: cartItemModel.UpdateCartItemPayload
): Promise<CartItem> => {
  return cartItemModel.updateCartItem(id, payload);
};

export const deleteCartItemService = async (id: string): Promise<CartItem> => {
  return cartItemModel.deleteCartItem(id);
};