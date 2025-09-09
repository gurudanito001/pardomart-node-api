import express from 'express';
import {
  createRatingController,
  getRatingsController,
  getRatingByIdController,
  updateRatingController,
  deleteRatingController,
  getAggregateRatingController,
} from '../controllers/rating.controllers';

// This is a placeholder for actual authentication middleware.
// In a real application, this would verify a JWT or session and attach the user to the request.
const isAuthenticated = (req: any, res: any, next: express.NextFunction) => {
  // For demonstration, we'll mock a user.
  // Replace this with your actual authentication logic.
  if (!req.user) {
    req.user = { id: 'a-mock-customer-id', role: 'customer' };
  }
  next();
};

// This is a placeholder for role-based authorization middleware.
const isCustomer = (req: any, res: any, next: express.NextFunction) => {
  if (req.user && req.user.role === 'customer') {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden: Customer access required.' });
};

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rating
 *   description: API for managing ratings for orders, vendors, shoppers, and deliverers.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RatingType:
 *       type: string
 *       enum: [VENDOR, SHOPPER, DELIVERER]
 *
 *     CreateRatingPayload:
 *       type: object
 *       required:
 *         - orderId
 *         - type
 *         - rating
 *       properties:
 *         orderId:
 *           type: string
 *           format: uuid
 *           description: The ID of the order being rated.
 *         type:
 *           $ref: '#/components/schemas/RatingType'
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: The rating score from 1 to 5.
 *         comment:
 *           type: string
 *           description: An optional comment for the rating.
 *
 *     UpdateRatingPayload:
 *       type: object
 *       properties:
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: The new rating score from 1 to 5.
 *         comment:
 *           type: string
 *           description: The new comment for the rating.
 *
 *     Rating:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         orderId:
 *           type: string
 *           format: uuid
 *         raterId:
 *           type: string
 *           format: uuid
 *         ratedVendorId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         ratedUserId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         rating:
 *           type: integer
 *         comment:
 *           type: string
 *           nullable: true
 *         type:
 *           $ref: '#/components/schemas/RatingType'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     RatingWithRelations:
 *       allOf:
 *         - $ref: '#/components/schemas/Rating'
 *         - type: object
 *           properties:
 *             rater:
 *               type: object
 *               properties:
 *                 id: { type: string, format: uuid }
 *                 name: { type: string }
 */

router.post('/', isAuthenticated, isCustomer, createRatingController);
router.get('/', getRatingsController);
router.get('/aggregate', getAggregateRatingController);
router.get('/:id', getRatingByIdController);
router.patch('/:id', isAuthenticated, isCustomer, updateRatingController);
router.delete('/:id', isAuthenticated, isCustomer, deleteRatingController);

export default router;