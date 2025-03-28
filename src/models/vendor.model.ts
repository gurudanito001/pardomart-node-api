// models/vendor.model.ts
import { PrismaClient, Vendor, Days } from '@prisma/client';


const prisma = new PrismaClient();

export interface CreateVendorPayload {
  userId: string;
  name: string;
  email?: string;
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
  email?: string;
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
  const vendor = await prisma.vendor.create({
    data: {
      ...payload
    }
  });

  // Generate and create VendorOpeningHours records
  const openingHoursData = Object.values(Days).map((day) => ({
    vendorId: vendor?.id,
    day: day,
    open: '09:00', // Default open time
    close: '18:00', // Default close time
  }));

  await prisma.vendorOpeningHours.createMany({
    data: openingHoursData,
  });

  // Fetch the created vendor with opening hours included
  const data = await prisma.vendor.findUnique({
    where: {
      id: vendor.id,
    },
    include: {
      openingHours: true,
    },
  });

  return data as Vendor
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
      openingHours: true
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

