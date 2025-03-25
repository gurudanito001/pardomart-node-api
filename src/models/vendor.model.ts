// models/vendor.model.ts
import { PrismaClient, Vendor, Category } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateVendorPayload {
  name?: string;
  tagline?: string;
  details?: string;
  meta?: any;
  mediaurls?: any;
  minimumOrder?: number;
  deliveryFee?: number;
  area?: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  userId: string;
  categories?: string[];
}

interface UpdateVendorPayload {
  id: string;
  name?: string;
  tagline?: string;
  details?: string;
  meta?: any;
  mediaurls?: any;
  minimumOrder?: number;
  deliveryFee?: number;
  area?: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  categories?: string[];
  isVerified?: boolean;
  ratings?: number;
  ratingsCount?: number;
  favouriteCount?: number;
  isFavourite?: boolean;
}

export const createVendor = async (payload: CreateVendorPayload): Promise<Vendor> => {
  const categoryIds = payload.categories ? payload.categories.map((id) => ({ id })) : [];
  return prisma.vendor.create({
    data: {
      ...payload,
      categories: {
        connect: categoryIds,
      },
    },
    include: {
      categories: true,
    },
  });
};

export const getVendorById = async (id: string): Promise<Vendor | null> => {
  return prisma.vendor.findUnique({
    where: { id },
    include: {
      categories: true,
      user: true,
    },
  });
};

export const getAllVendors = async (userId?: string): Promise<Vendor[]> => {
  const whereClause = userId ? { userId: userId } : {};

  return prisma.vendor.findMany({
    where: whereClause,
    include: {
      categories: true,
      user: true,
    },
  });
};

export const updateVendor = async (payload: UpdateVendorPayload): Promise<Vendor> => {
  const categoryIds = payload.categories ? payload.categories.map((id) => ({ id })) : [];

  return prisma.vendor.update({
    where: { id: payload.id },
    data: {
      ...payload,
      categories: {
        set: categoryIds,
      },
    },
    include: {
      categories: true,
      user: true,
    },
  });
};

export const deleteVendor = async (id: string): Promise<Vendor> => {
  return prisma.vendor.delete({
    where: { id },
    include: {
      categories: true,
      user: true,
    },
  });
};

export const getVendorsByUserId = async (userId: string): Promise<Vendor[]> => {
  return prisma.vendor.findMany({
    where: { userId },
    include: {
      categories: true,
      user: true,
    },
  });
};