import { Request, Response } from 'express';
import * as ratingService from '../services/rating.service';
import { RatingError } from '../services/rating.service';
import { CreateRatingPayload, GetRatingsFilters, UpdateRatingPayload } from '../models/rating.model';
import { RatingType } from '@prisma/client';
import { errorLogService } from '../services/errorLog.service';

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
 *     description: Allows a customer to submit a rating. The rating can be for a VENDOR, USER (e.g. SHOPPER, DELIVERER), PRODUCT, or ORDER.
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
 *         description: Bad request (e.g., invalid rating value).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Entity not found.
 *       409:
 *         description: Conflict.
 * components:
 *   schemas:
 *     RatingType:
 *       type: string
 *       enum: [VENDOR, SHOPPER, DELIVERER, PRODUCT, ORDER, USER]
 *     UserSummary:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         name: { type: string, nullable: true }
 *     VendorSummary:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         name: { type: string }
 *     Rating:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         orderId: { type: string, format: uuid, nullable: true }
 *         raterId: { type: string, format: uuid }
 *         ratedVendorId: { type: string, format: uuid, nullable: true }
 *         ratedUserId: { type: string, format: uuid, nullable: true }
 *         ratedProductId: { type: string, format: uuid, nullable: true }
 *         rating: { type: integer, minimum: 1, maximum: 5 }
 *         comment: { type: string, nullable: true }
 *         type: { $ref: '#/components/schemas/RatingType' }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     RatingWithRelations:
 *       allOf:
 *         - $ref: '#/components/schemas/Rating'
 *         - type: object
 *           properties:
 *             rater:
 *               $ref: '#/components/schemas/UserSummary'
 *             ratedUser:
 *               $ref: '#/components/schemas/UserSummary'
 *               nullable: true
 *             ratedVendor:
 *               $ref: '#/components/schemas/VendorSummary'
 *               nullable: true
 *             ratedProduct:
 *               type: object
 *               properties:
 *                 id: { type: string, format: uuid }
 *                 name: { type: string }
 *               nullable: true
 *     CreateRatingPayload:
 *       type: object
 *       required: [rating, type]
 *       properties:
 *         orderId: { type: string, format: uuid, nullable: true }
 *         rating: { type: integer, minimum: 1, maximum: 5, description: "The rating score from 1 to 5." }
 *         comment: { type: string, nullable: true }
 *         type: { $ref: '#/components/schemas/RatingType' }
 *         ratedVendorId: { type: string, format: uuid, description: "Required if type is VENDOR." }
 *         ratedUserId: { type: string, format: uuid, description: "Required if type is SHOPPER or DELIVERER." }
 *         ratedProductId: { type: string, format: uuid, description: "Required if type is PRODUCT." }
 *     UpdateRatingPayload:
 *       type: object
 *       properties:
 *         rating: { type: integer, minimum: 1, maximum: 5 }
 *         comment: { type: string, nullable: true }
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
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to create rating',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: req.user?.id as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'CREATE_RATING_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    if (error instanceof RatingError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
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
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to update rating',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: req.user?.id as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'UPDATE_RATING_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    if (error instanceof RatingError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
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
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to delete rating',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: req.user?.id as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'DELETE_RATING_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    if (error instanceof RatingError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
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
 *         name: ratedProductId
 *         schema: { type: string, format: uuid }
 *         description: Filter ratings for a specific product.
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
    const { orderId, raterId, ratedVendorId, ratedUserId, ratedProductId, type } = req.query;
    const filters: GetRatingsFilters = {
      orderId: orderId as string | undefined,
      raterId: raterId as string | undefined,
      ratedVendorId: ratedVendorId as string | undefined,
      ratedUserId: ratedUserId as string | undefined,
      ratedProductId: ratedProductId as string | undefined,
      type: type as RatingType | undefined,
    };

    Object.keys(filters).forEach(key => {
      if (filters[key as keyof GetRatingsFilters] === undefined) {
        delete filters[key as keyof GetRatingsFilters];
      }
    });

    const ratings = await ratingService.getRatingsService(filters);
    res.json(ratings);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to get ratings',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).user?.id as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'GET_RATINGS_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /ratings/aggregate:
 *   get:
 *     summary: Get aggregate rating for a vendor or user
 *     tags: [Rating]
 *     description: Calculates the average rating and total count of ratings for a specific vendor, user, product, etc.
 *     parameters:
 *       - in: query
 *         name: ratedVendorId
 *         schema: { type: string, format: uuid }
 *         description: The ID of the vendor to get aggregate ratings for.
 *       - in: query
 *         name: ratedUserId
 *         schema: { type: string, format: uuid }
 *         description: The ID of the user (shopper/deliverer) to get aggregate ratings for.
 *       - in: query
 *         name: ratedProductId
 *         schema: { type: string, format: uuid }
 *         description: The ID of the product to get aggregate ratings for.
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
 *         description: Bad request (e.g., no target ID is provided).
 */
export const getAggregateRatingController = async (req: Request, res: Response) => {
  try {
    const { ratedVendorId, ratedUserId, ratedProductId } = req.query;
    const filters = {
      ratedVendorId: ratedVendorId as string | undefined,
      ratedUserId: ratedUserId as string | undefined,
      ratedProductId: ratedProductId as string | undefined,
    };

    const aggregate = await ratingService.getAggregateRatingService(filters);
    res.json(aggregate);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to get aggregate rating',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).user?.id as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'GET_AGGREGATE_RATING_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    if (error instanceof RatingError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
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
 *               $ref: '#/components/schemas/Rating'
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
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to get rating by ID',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).user?.id as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'GET_RATING_BY_ID_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    res.status(500).json({ error: 'Internal server error' });
  }
};