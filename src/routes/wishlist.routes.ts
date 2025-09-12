import { Router } from 'express';
import * as wishlistController from '../controllers/wishlist.controller';
import {
  validate,
  validateAddToWishlist,
  validateRemoveFromWishlist,
} from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All routes in this file are protected and require authentication
router.use(authenticate);

// Add an item to the user's wishlist
router.post('/', validate(validateAddToWishlist), wishlistController.addToWishlistController);

// Get all items from the user's wishlist
router.get('/me', wishlistController.getWishlistController);

// Remove an item from the user's wishlist by its ID
router.delete('/:id', validate(validateRemoveFromWishlist), wishlistController.removeFromWishlistController);

export default router;
