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
  const orderId = payload.orderId?.trim() || undefined;
  const ratedProductId = payload.ratedProductId?.trim() || undefined;
  const ratedUserId = payload.ratedUserId?.trim() || undefined;
  const ratedVendorId = payload.ratedVendorId?.trim() || undefined;
  const { type, rating, comment } = payload;

  let order = null;

  // 1. Fetch and validate the order if provided
  if (orderId) {
    order = await orderModel.getOrderById(orderId);
    if (!order) {
      throw new RatingError('Order not found.', 404);
    }
    if (order.userId !== raterId) {
      throw new RatingError('You are not authorized to rate this order.', 403);
    }
    if (order.orderStatus !== OrderStatus.delivered && order.orderStatus !== OrderStatus.picked_up_by_customer) {
      throw new RatingError('Order must be completed before it can be rated.', 400);
    }
  }

  // 2. Validate rating value
  if (rating < 1 || rating > 5) {
    throw new RatingError('Rating must be between 1 and 5.', 400);
  }

  // 3. Prepare rating data based on type
  const ratingData: ratingModel.CreateRatingPayload = { 
    raterId, 
    type, 
    rating, 
    comment,
    ...(orderId ? { orderId } : {}),
    ...(ratedProductId ? { ratedProductId } : {}),
    ...(ratedUserId ? { ratedUserId } : {}),
    ...(ratedVendorId ? { ratedVendorId } : {})
  };

  switch (type) {
    case RatingType.VENDOR:
      if (!ratedVendorId && !orderId) throw new RatingError('Vendor ID or Order ID is required to rate a vendor.', 400);
      ratingData.ratedVendorId = order ? order.vendorId : ratedVendorId;
      break;
    case RatingType.SHOPPER:
      if (!orderId) throw new RatingError('Order ID is required to rate a shopper.', 400);
      if (!order?.shopperId) throw new RatingError('This order does not have an assigned shopper to rate.', 400);
      ratingData.ratedUserId = order.shopperId;
      break;
    case RatingType.DELIVERER:
      if (!orderId) throw new RatingError('Order ID is required to rate a deliverer.', 400);
      if (!order?.deliveryPersonId) throw new RatingError('This order does not have an assigned deliverer to rate.', 400);
      ratingData.ratedUserId = order.deliveryPersonId;
      break;
    case RatingType.PRODUCT:
      if (!ratedProductId) throw new RatingError('Product ID is required for a product rating.', 400);
      ratingData.ratedProductId = ratedProductId;
      // Verify product was in order if orderId is provided
      if (order) {
         const hasProduct = order.orderItems.some(item => 
            item.vendorProductId === ratedProductId || 
            item.vendorProduct?.productId === ratedProductId ||
            item.chosenReplacementId === ratedProductId ||
            item.chosenReplacement?.productId === ratedProductId
         );
         if (!hasProduct) throw new RatingError('This product was not part of the specified order.', 400);
      }
      break;
    case RatingType.ORDER:
      if (!orderId) throw new RatingError('Order ID is required for an order rating.', 400);
      ratingData.orderId = orderId;
      break;
    case RatingType.USER:
      if (!ratedUserId) throw new RatingError('User ID is required for a generic user rating.', 400);
      ratingData.ratedUserId = ratedUserId;
      break;
    default:
      throw new RatingError('Invalid rating type specified.', 400);
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // 4. Check for duplicate ratings using contextual properties
      const existingRating = await tx.rating.findFirst({
        where: { 
          raterId,
          type,
          ...(ratingData.orderId ? { orderId: ratingData.orderId } : {}),
          ...(ratingData.ratedVendorId ? { ratedVendorId: ratingData.ratedVendorId } : {}),
          ...(ratingData.ratedProductId ? { ratedProductId: ratingData.ratedProductId } : {}),
          ...(ratingData.ratedUserId ? { ratedUserId: ratingData.ratedUserId } : {})
        },
      });

      if (existingRating) {
        // Update the existing rating instead of throwing an error
        return ratingModel.updateRating(existingRating.id, {
          rating: ratingData.rating,
          comment: ratingData.comment,
        }, tx);
      }

      return ratingModel.createRating(ratingData, tx);
    });
  } catch (error) {
    if (error instanceof RatingError) throw error;
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
export const getAggregateRatingService = async (filters: { ratedVendorId?: string; ratedUserId?: string; ratedProductId?: string }): Promise<{ average: number; count: number }> => {
  if (!filters.ratedVendorId && !filters.ratedUserId && !filters.ratedProductId) {
    throw new RatingError('A vendor ID, user ID, or product ID must be provided to get aggregate ratings.', 400);
  }
  return ratingModel.getAggregateRating(filters);
};

/**
 * Gets aggregate ratings for a list of vendor IDs.
 * @param vendorIds - An array of vendor IDs.
 * @returns A Map where keys are vendor IDs and values are their aggregate rating.
 */
export const getAggregateRatingsForVendorsService = async (vendorIds: string[]): Promise<Map<string, { average: number; count: number }>> => {
  if (vendorIds.length === 0) return new Map();
  return ratingModel.getAggregateRatingsForVendors(vendorIds);
};

/**
 * Gets aggregate ratings for a list of product IDs.
 * @param productIds - An array of product IDs.
 * @returns A Map where keys are product IDs and values are their aggregate rating.
 */
export const getAggregateRatingsForProductsService = async (productIds: string[]): Promise<Map<string, { average: number; count: number }>> => {
  if (productIds.length === 0) return new Map();
  return ratingModel.getAggregateRatingsForProducts(productIds);
};