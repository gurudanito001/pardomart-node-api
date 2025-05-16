import { Request, Response } from 'express';
import { getCartItemByIdService, updateCartItemService, deleteCartItemService } from '../services/cartItem.service';





export const getCartItemByIdController = async (req: Request, res: Response) => {
  try {
    const cartItem = await getCartItemByIdService(req.params.id);
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    res.json(cartItem);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const updateCartItemController = async (req: Request, res: Response) => {
  try {
    const cartItem = await updateCartItemService(req.params.id, req.body);
    res.json(cartItem);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const deleteCartItemController = async (req: Request, res: Response) => {
  try {
    const cartItem = await deleteCartItemService(req.params.id);
    res.json(cartItem);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};