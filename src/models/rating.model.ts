import { PrismaClient, Prisma, Rating, RatingType } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateRatingPayload {
  orderId: string;
  raterId: string;
  rating: number;
  comment?: string;
  type: RatingType;
  ratedVendorId?: string;
  ratedUserId?: string;
}

export interface UpdateRatingPayload {
  rating?: number;
  comment?: string;
}

export interface GetRatingsFilters {
  orderId?: string;
  raterId?: string;
  ratedVendorId?: string;
  ratedUserId?: string;
  type?: RatingType;
}

/**
 * Creates a new rating in the database.
 * @param payload - The data for the new rating.
 * @param tx - Optional Prisma transaction client.
 * @returns The created rating.
 */
export const createRating = async (payload: CreateRatingPayload, tx?: Prisma.TransactionClient): Promise<Rating> => {
  const db = tx || prisma;
  return db.rating.create({
    data: payload,
  });
};

/**
 * Retrieves a rating by its unique ID.
 * @param id - The ID of the rating to retrieve.
 * @returns The rating object or null if not found.
 */
export const getRatingById = async (id: string): Promise<Rating | null> => {
  return prisma.rating.findUnique({
    where: { id },
  });
};

/**
 * Retrieves a list of ratings based on filters.
 * @param filters - The filtering criteria.
 * @returns An array of rating objects.
 */
export const getRatings = async (filters: GetRatingsFilters): Promise<Rating[]> => {
  return prisma.rating.findMany({
    where: filters,
    include: {
      rater: { select: { id: true, name: true } },
      ratedUser: { select: { id: true, name: true } },
      ratedVendor: { select: { id: true, name: true } },
    },
  });
};

/**
 * Updates an existing rating.
 * @param id - The ID of the rating to update.
 * @param payload - The data to update.
 * @returns The updated rating.
 */
export const updateRating = async (id: string, payload: UpdateRatingPayload): Promise<Rating> => {
  return prisma.rating.update({
    where: { id },
    data: payload,
  });
};

/**
 * Deletes a rating from the database.
 * @param id - The ID of the rating to delete.
 * @returns The deleted rating.
 */
export const deleteRating = async (id: string): Promise<Rating> => {
  return prisma.rating.delete({
    where: { id },
  });
};

/**
 * Calculates the aggregate rating (average and count) for a vendor or a user (shopper/deliverer).
 * @param filters - Must contain either `ratedVendorId` or `ratedUserId`.
 * @returns An object with the average rating and total number of ratings.
 */
export const getAggregateRating = async (filters: { ratedVendorId?: string; ratedUserId?: string }): Promise<{ average: number; count: number }> => {
  const { _avg, _count } = await prisma.rating.aggregate({
    where: filters,
    _avg: { rating: true },
    _count: { _all: true },
  });

  return { average: _avg.rating || 0, count: _count._all };
};