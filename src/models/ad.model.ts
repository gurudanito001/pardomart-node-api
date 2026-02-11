// src/models/ad.model.ts
import { PrismaClient, Ad, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateAdPayload {
  title: string;
  description?: string;
  imageUrl: string;
  vendorId: string;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateAdPayload {
  title?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date | null;
}

export interface ListAdsFilters {
  isActive?: boolean;
  vendorId?: string;
}

/**
 * Creates a new ad.
 * @param payload - The data for the new ad.
 * @returns The created ad.
 */
export const createAd = async (payload: CreateAdPayload): Promise<Ad> => {
  return prisma.ad.create({
    data: payload,
  });
};

/**
 * Retrieves an ad by its ID.
 * @param id - The ID of the ad.
 * @returns The ad object or null if not found.
 */
export const getAdById = async (id: string): Promise<Ad | null> => {
  return prisma.ad.findUnique({
    where: { id },
    include: { vendor: { select: { id: true, name: true } } },
  });
};

/**
 * Retrieves a list of ads based on filters.
 * @param filters - The filtering criteria.
 * @param pagination - The pagination options.
 * @returns An object containing ads and pagination info.
 */
export const listAds = async (filters: ListAdsFilters, pagination: { page: number; take: number }) => {
  const where: Prisma.AdWhereInput = {};

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
    if (filters.isActive) {
      // If we want only active ads, they must have started and not yet ended.
      where.startDate = { lte: new Date() };
      where.OR = [{ endDate: null }, { endDate: { gte: new Date() } }];
    }
  }

  if (filters.vendorId) {
    where.vendorId = filters.vendorId;
  }

  const skip = (pagination.page - 1) * pagination.take;

  const [ads, total] = await prisma.$transaction([
    prisma.ad.findMany({
      where,
      include: { vendor: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pagination.take,
    }),
    prisma.ad.count({ where }),
  ]);

  return {
    data: ads,
    pagination: {
      total,
      page: pagination.page,
      limit: pagination.take,
      totalPages: Math.ceil(total / pagination.take),
    },
  };
};

/**
 * Updates an existing ad.
 * @param id - The ID of the ad to update.
 * @param payload - The data to update.
 * @returns The updated ad.
 */
export const updateAd = async (id: string, payload: UpdateAdPayload): Promise<Ad> => {
  return prisma.ad.update({
    where: { id },
    data: payload,
  });
};

/**
 * Deletes an ad from the database.
 * @param id - The ID of the ad to delete.
 * @returns The deleted ad.
 */
export const deleteAd = async (id: string): Promise<Ad> => {
  return prisma.ad.delete({
    where: { id },
  });
};