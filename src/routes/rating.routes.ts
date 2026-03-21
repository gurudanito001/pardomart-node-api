import express from 'express';
import {
  createRatingController,
  getRatingsController,
  getRatingByIdController,
  updateRatingController,
  deleteRatingController,
  getAggregateRatingController,
} from '../controllers/rating.controllers';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rating
 *   description: API for managing ratings for products, orders, vendors, shoppers, and deliverers.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RatingType:
 *       type: string
 *       enum: [VENDOR, SHOPPER, DELIVERER, PRODUCT, ORDER, USER]
 *
 *     CreateRatingPayload:
 *       type: object
 *       required:
 *         - type
 *         - rating
 *       properties:
 *         orderId:
 *           type: string
 *           format: uuid
 *           description: The ID of the order being rated (Optional depending on the rating type).
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
 *         ratedVendorId:
 *           type: string
 *           format: uuid
 *           description: Required if type is VENDOR.
 *         ratedUserId:
 *           type: string
 *           format: uuid
 *           description: Required if type is SHOPPER, DELIVERER, or USER.
 *         ratedProductId:
 *           type: string
 *           format: uuid
 *           description: Required if type is PRODUCT.
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
 *         ratedProductId:
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

router.post('/', authenticate, authorize([Role.customer]), createRatingController);
router.get('/', getRatingsController);
router.get('/aggregate', getAggregateRatingController);
router.get('/:id', getRatingByIdController);
router.patch('/:id', authenticate, authorize([Role.customer]), updateRatingController);
router.delete('/:id', authenticate, authorize([Role.customer]), deleteRatingController);

export default router;