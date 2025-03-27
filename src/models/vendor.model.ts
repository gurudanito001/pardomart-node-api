// models/vendor.model.ts
import { PrismaClient, Vendor } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateVendorPayload {
  userId: string;
  name: string;
  tagline?: string;
  details?: string;
  image?: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  meta?: any;
}



export interface UpdateVendorPayload {
  name?: string;
  tagline?: string;
  details?: string;
  image?: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  isVerified?: boolean;
  meta?: any;
}

export const createVendor = async (payload: CreateVendorPayload): Promise<Vendor> => {
  return prisma.vendor.create({
    data: {
      ...payload
    }
  });
};

export const getVendorById = async (id: string): Promise<Vendor | null> => {
  return prisma.vendor.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });
};

export const getAllVendors = async (): Promise<Vendor[]> => {

  return prisma.vendor.findMany({
    include: {
      user: true,
    },
  });
};

export const getVendorsByUserId = async (userId: string): Promise<Vendor[]> => {
  return prisma.vendor.findMany({
    where: { userId },
    include: {
      user: true,
    },
  });
};

export const updateVendor = async (id: string, payload: UpdateVendorPayload): Promise<Vendor> => {

  return prisma.vendor.update({
    where: { id },
    data: {
      ...payload
    },
  });
};

export const deleteVendor = async (id: string): Promise<Vendor> => {
  return prisma.vendor.delete({
    where: { id }
  });
};

