import { Request, Response } from 'express';
import { createCartService, getCartByIdService, getCartByUserIdService, deleteCartService } from '../services/cart.service';
import { AuthenticatedRequest } from './vendor.controller';
import { CartItem } from '@prisma/client';
import { createCartItem, getCartItemByCartId } from '../models/cartItem.model';
import { updateCartItemService } from '../services/cartItem.service';

// --- Cart Controller Functions ---


/**
 * Controller for creating a new cart.
 * @param req - The Express request object.
 * @param res - The Express response object.
 */
export const addToCartController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    //  1. Extract user ID and cart items from the request
    const userId = req.userId;
     if (!userId) {
      return res.status(400).json({ error: 'User ID is required to create a cart.' });
    }


    const cartItemData: CartItem = req.body;
    //  2. Validate the cart item data
    if (!cartItemData || !cartItemData.vendorProductId || typeof cartItemData.quantity !== "number" || cartItemData.quantity < 1  ) {
      res.status(400).json({ error: 'Invalid cart item data.' });
      return;
    }
    
    //  3. Get or create the user's cart
    let cart = await getCartByUserIdService(userId);
    if (!cart) {
      // if no existing cart, create cart and create new cart Item
      cart = await createCartService(userId);
      await createCartItem({cartId: cart?.id, vendorProductId: cartItemData.vendorProductId, quantity: cartItemData.quantity});
    }else {
      // check if the cart item already exists in this cart, 
      const existingItem = await getCartItemByCartId(cart.id, cartItemData.vendorProductId);
      if(existingItem){
        await updateCartItemService(existingItem.id, {quantity: cartItemData.quantity})
      }else{
        await createCartItem({cartId: cart?.id, vendorProductId: cartItemData.vendorProductId, quantity: cartItemData.quantity});
      }
    }

    const updatedCart = await getCartByIdService(cart.id);
    res.status(201).json(updatedCart);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};



/**
  * Controller for getting a user's cart.
  * @param req - The Express request object.
  * @param res - The Express response object.
  */
export const getCartByUserIdController = async (req: AuthenticatedRequest, res: Response) => {
{
  try {
    //  In a real application, you would get this from the authentication context
    const userId = req.userId;
     if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }
    const cart = await getCartByUserIdService(userId);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found for this user' });
    }
    res.json(cart);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
};



/**
 * Controller for deleting a cart.
 * @param req - The Express request object.
 * @param res - The Express response object.
 */
export const deleteCartController = async (req: Request, res: Response) => {
  try {
    const cart = await deleteCartService(req.params.id);
    res.json(cart);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
