import { Rating, RatingType, OrderStatus, Prisma, PrismaClient } from '@prisma/client';
import * as ratingModel from '../models/rating.model';
import * as orderModel from '../models/order.model';

const prisma = new PrismaClient();

export class RatingError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'RatingError';
    this.statusCode = statusCode;
  }
}

/**
 * Creates a new rating for an order.
 * It performs several validations before creating the rating.
 * @param raterId - The ID of the user submitting the rating.
 * @param payload - The rating data.
 * @returns The created rating.
 */
export const createRatingService = async (
  raterId: string,
  payload: Omit<ratingModel.CreateRatingPayload, 'raterId'>
): Promise<Rating> => {
  const { orderId, type, rating } = payload;

  // 1. Validate the order
  const order = await orderModel.getOrderById(orderId);
  if (!order) {
    throw new RatingError('Order not found.', 404);
  }
  if (order.userId !== raterId) {
    throw new RatingError('You are not authorized to rate this order.', 403);
  }
  if (order.orderStatus !== OrderStatus.delivered) {
    throw new RatingError('Order must be delivered before it can be rated.', 400);
  }

  // 2. Validate rating value
  if (rating < 1 || rating > 5) {
    throw new RatingError('Rating must be between 1 and 5.', 400);
  }

  // 3. Prepare rating data based on type
  const ratingData: ratingModel.CreateRatingPayload = { ...payload, raterId };

  switch (type) {
    case RatingType.VENDOR:
      ratingData.ratedVendorId = order.vendorId;
      break;
    case RatingType.SHOPPER:
      if (!order.shopperId) throw new RatingError('This order does not have an assigned shopper to rate.', 400);
      ratingData.ratedUserId = order.shopperId;
      break;
    case RatingType.DELIVERER:
      if (!order.deliveryPersonId) throw new RatingError('This order does not have an assigned deliverer to rate.', 400);
      ratingData.ratedUserId = order.deliveryPersonId;
      break;
    default:
      throw new RatingError('Invalid rating type specified.', 400);
  }

  // 4. Use a transaction to ensure we don't create a duplicate rating
  try {
    return await prisma.$transaction(async (tx) => {
      const existingRating = await tx.rating.findUnique({
        where: { orderId_type: { orderId, type } },
      });

      if (existingRating) {
        throw new RatingError(`A ${type.toLowerCase()} rating for this order already exists.`, 409);
      }

      return ratingModel.createRating(ratingData, tx);
    });
  } catch (error) {
    if (error instanceof RatingError) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new RatingError(`A ${type.toLowerCase()} rating for this order already exists.`, 409);
    }
    console.error('Error creating rating:', error);
    throw new RatingError('Could not create rating.', 500);
  }
};

/**
 * Retrieves a rating by its ID.
 * @param id - The ID of the rating.
 * @returns The rating object or null.
 */
export const getRatingByIdService = async (id: string): Promise<Rating | null> => {
  return ratingModel.getRatingById(id);
};

/**
 * Retrieves a list of ratings based on filters.
 * @param filters - The filtering criteria.
 * @returns An array of rating objects.
 */
export const getRatingsService = async (filters: ratingModel.GetRatingsFilters): Promise<Rating[]> => {
  return ratingModel.getRatings(filters);
};

/**
 * Updates a rating.
 * @param id - The ID of the rating to update.
 * @param raterId - The ID of the user attempting to update, for authorization.
 * @param payload - The data to update.
 * @returns The updated rating.
 */
export const updateRatingService = async (id: string, raterId: string, payload: ratingModel.UpdateRatingPayload): Promise<Rating> => {
  const rating = await ratingModel.getRatingById(id);
  if (!rating) throw new RatingError('Rating not found.', 404);
  if (rating.raterId !== raterId) throw new RatingError('You are not authorized to update this rating.', 403);
  return ratingModel.updateRating(id, payload);
};

/**
 * Deletes a rating.
 * @param id - The ID of the rating to delete.
 * @param raterId - The ID of the user attempting to delete, for authorization.
 * @returns The deleted rating.
 */
export const deleteRatingService = async (id: string, raterId: string): Promise<Rating> => {
  const rating = await ratingModel.getRatingById(id);
  if (!rating) throw new RatingError('Rating not found.', 404);
  if (rating.raterId !== raterId) throw new RatingError('You are not authorized to delete this rating.', 403);
  return ratingModel.deleteRating(id);
};

/**
 * Gets the aggregate rating for a vendor or user.
 * @param filters - Must contain either `ratedVendorId` or `ratedUserId`.
 * @returns An object with average rating and total count.
 */
export const getAggregateRatingService = async (filters: { ratedVendorId?: string; ratedUserId?: string }): Promise<{ average: number; count: number }> => {
  if (!filters.ratedVendorId && !filters.ratedUserId) {
    throw new RatingError('A vendor ID or user ID must be provided to get aggregate ratings.', 400);
  }
  return ratingModel.getAggregateRating(filters);
};