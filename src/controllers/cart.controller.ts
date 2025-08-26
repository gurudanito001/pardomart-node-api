import { Response } from 'express';
import * as cartService from '../services/cart.service';
import { AuthenticatedRequest } from './vendor.controller';

export const getCartController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const cart = await cartService.getCartByUserIdService(userId);
    res.status(200).json(cart || { userId, items: [] }); // Return empty cart if none exists
  } catch (error: any) {
    console.error('Error in getCartController:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addItemToCartController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const { vendorProductId, quantity } = req.body;

    if (!vendorProductId || !quantity) {
      return res.status(400).json({ error: 'vendorProductId and quantity are required.' });
    }

    const result = await cartService.addItemToCartService(userId, { vendorProductId, quantity });
    res.status(201).json(result);
  } catch (error: any) {
    if (error.name === 'CartError') {
        return res.status(400).json({ error: error.message });
    }
    console.error('Error in addItemToCartController:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Stubs for other controllers you would add
export const updateCartItemQuantityController = async (req: AuthenticatedRequest, res: Response) => {
  // Logic to update item quantity would go here
  res.status(501).json({ message: 'Not implemented' });
};

export const removeCartItemController = async (req: AuthenticatedRequest, res: Response) => {
  // Logic to remove an item would go here
  res.status(501).json({ message: 'Not implemented' });
};