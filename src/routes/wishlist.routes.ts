import express from 'express';
import {
  addToWishlistController,
  getWishlistController,
  removeFromWishlistController,
} from '../controllers/wishlist.controller';

// This is a placeholder for actual authentication middleware.
// In a real application, this would verify a JWT or session and attach the user to the request.
const isAuthenticated = (req: any, res: any, next: express.NextFunction) => {
  // For demonstration, we'll mock a user.
  // Replace this with your actual authentication logic.
  if (!req.user) {
    // Using a consistent mock user ID for testing purposes
    req.user = { id: 'a-mock-customer-id', role: 'customer' };
  }
  next();
};

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: API for managing user wishlists.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     WishlistItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         vendorProductId:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         vendorProduct:
 *           $ref: '#/components/schemas/VendorProductWithRelations'
 *
 *     AddToWishlistPayload:
 *       type: object
 *       required:
 *         - vendorProductId
 *       properties:
 *         vendorProductId:
 *           type: string
 *           format: uuid
 *           description: The ID of the vendor product to add to the wishlist.
 */

router.post('/', isAuthenticated, addToWishlistController);
router.get('/', isAuthenticated, getWishlistController);
router.delete('/:id', isAuthenticated, removeFromWishlistController);

export default router;