import { Request, Response } from 'express';
import * as ratingService from '../services/rating.service';
import { RatingError } from '../services/rating.service';
import { CreateRatingPayload, GetRatingsFilters, UpdateRatingPayload } from '../models/rating.model';
import { RatingType } from '@prisma/client';

// This interface is a placeholder for your actual authenticated request type.
// It assumes an authentication middleware adds a `user` object to the request.
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * @swagger
 * /ratings:
 *   post:
 *     summary: Create a new rating for an order
 *     tags: [Rating]
 *     security:
 *       - bearerAuth: []
 *     description: Allows a customer to submit a rating for a completed order. The rating can be for a VENDOR, SHOPPER, or DELIVERER. A user can only submit one rating of each type per order.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRatingPayload'
 *     responses:
 *       201:
 *         description: The created rating.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rating'
 *       400:
 *         description: Bad request (e.g., invalid rating value, order not delivered).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not the customer for this order).
 *       404:
 *         description: Order not found.
 *       409:
 *         description: Conflict (a rating of this type already exists for this order).
 */
export const createRatingController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const raterId = req.user?.id;
    if (!raterId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload: Omit<CreateRatingPayload, 'raterId'> = req.body;
    const rating = await ratingService.createRatingService(raterId, payload);
    res.status(201).json(rating);
  } catch (error) {
    if (error instanceof RatingError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Error creating rating:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /ratings/{id}:
 *   patch:
 *     summary: Update a rating
 *     tags: [Rating]
 *     security:
 *       - bearerAuth: []
 *     description: Allows a customer to update their own rating for an order.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the rating to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRatingPayload'
 *     responses:
 *       200:
 *         description: The updated rating.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rating'
 *       400:
 *         description: Bad request (e.g., invalid rating value).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not the original rater).
 *       404:
 *         description: Rating not found.
 */
export const updateRatingController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const raterId = req.user?.id;
    if (!raterId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const payload: UpdateRatingPayload = req.body;

    const updatedRating = await ratingService.updateRatingService(id, raterId, payload);
    res.status(200).json(updatedRating);
  } catch (error) {
    if (error instanceof RatingError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Error updating rating:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /ratings/{id}:
 *   delete:
 *     summary: Delete a rating
 *     tags: [Rating]
 *     security:
 *       - bearerAuth: []
 *     description: Allows a customer to delete their own rating.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the rating to delete.
 *     responses:
 *       200:
 *         description: The deleted rating.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rating'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not the original rater).
 *       404:
 *         description: Rating not found.
 */
export const deleteRatingController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const raterId = req.user?.id;
    if (!raterId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id } = req.params;
    const deletedRating = await ratingService.deleteRatingService(id, raterId);
    res.status(200).json(deletedRating);
  } catch (error) {
    if (error instanceof RatingError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Error deleting rating:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /ratings:
 *   get:
 *     summary: Get a list of ratings
 *     tags: [Rating]
 *     description: Retrieves a list of ratings, with optional filters.
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema: { type: string, format: uuid }
 *         description: Filter ratings by a specific order ID.
 *       - in: query
 *         name: raterId
 *         schema: { type: string, format: uuid }
 *         description: Filter ratings by the user who submitted them.
 *       - in: query
 *         name: ratedVendorId
 *         schema: { type: string, format: uuid }
 *         description: Filter ratings for a specific vendor.
 *       - in: query
 *         name: ratedUserId
 *         schema: { type: string, format: uuid }
 *         description: Filter ratings for a specific user (shopper or deliverer).
 *       - in: query
 *         name: type
 *         schema: { $ref: '#/components/schemas/RatingType' }
 *         description: Filter by the type of rating.
 *     responses:
 *       200:
 *         description: A list of ratings.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RatingWithRelations'
 */
export const getRatingsController = async (req: Request, res: Response) => {
  try {
    const { orderId, raterId, ratedVendorId, ratedUserId, type } = req.query;
    const filters: GetRatingsFilters = {
      orderId: orderId as string | undefined,
      raterId: raterId as string | undefined,
      ratedVendorId: ratedVendorId as string | undefined,
      ratedUserId: ratedUserId as string | undefined,
      type: type as RatingType | undefined,
    };

    Object.keys(filters).forEach(key => {
      if (filters[key as keyof GetRatingsFilters] === undefined) {
        delete filters[key as keyof GetRatingsFilters];
      }
    });

    const ratings = await ratingService.getRatingsService(filters);
    res.json(ratings);
  } catch (error) {
    console.error('Error getting ratings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /ratings/aggregate:
 *   get:
 *     summary: Get aggregate rating for a vendor or user
 *     tags: [Rating]
 *     description: Calculates the average rating and total count of ratings for a specific vendor, shopper, or deliverer.
 *     parameters:
 *       - in: query
 *         name: ratedVendorId
 *         schema: { type: string, format: uuid }
 *         description: The ID of the vendor to get aggregate ratings for.
 *       - in: query
 *         name: ratedUserId
 *         schema: { type: string, format: uuid }
 *         description: The ID of the user (shopper/deliverer) to get aggregate ratings for.
 *     responses:
 *       200:
 *         description: The aggregate rating data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 average:
 *                   type: number
 *                   format: float
 *                   description: The average rating score.
 *                 count:
 *                   type: integer
 *                   description: The total number of ratings.
 *       400:
 *         description: Bad request (e.g., neither ratedVendorId nor ratedUserId is provided).
 */
export const getAggregateRatingController = async (req: Request, res: Response) => {
  try {
    const { ratedVendorId, ratedUserId } = req.query;
    const filters = {
      ratedVendorId: ratedVendorId as string | undefined,
      ratedUserId: ratedUserId as string | undefined,
    };

    const aggregate = await ratingService.getAggregateRatingService(filters);
    res.json(aggregate);
  } catch (error) {
    if (error instanceof RatingError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Error getting aggregate rating:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /ratings/{id}:
 *   get:
 *     summary: Get a single rating by ID
 *     tags: [Rating]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the rating to retrieve.
 *     responses:
 *       200:
 *         description: The requested rating.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RatingWithRelations'
 *       404:
 *         description: Rating not found.
 */
export const getRatingByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rating = await ratingService.getRatingByIdService(id);
    if (!rating) {
      return res.status(404).json({ error: 'Rating not found' });
    }
    res.json(rating);
  } catch (error) {
    console.error('Error getting rating by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};