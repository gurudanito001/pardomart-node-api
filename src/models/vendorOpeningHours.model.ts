// models/vendorOpeningHours.model.ts
import { PrismaClient, VendorOpeningHours } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateVendorOpeningHoursPayload {
  vendorId: string;
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  open?: string;
  close?: string;
}

export interface UpdateVendorOpeningHoursPayload {
  id: string;
  open?: string;
  close?: string;
}

export const createVendorOpeningHours = async (payload: CreateVendorOpeningHoursPayload): Promise<VendorOpeningHours> => {
  return prisma.vendorOpeningHours.create({
    data: payload,
  });
};

export const getVendorOpeningHoursById = async (id: string): Promise<VendorOpeningHours | null> => {
  return prisma.vendorOpeningHours.findUnique({
    where: { id },
  });
};

export const getVendorOpeningHoursByVendorIdAndDay = async (vendorId: string, day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"): Promise<VendorOpeningHours | null> => {
  return prisma.vendorOpeningHours.findFirst({
    where: {
      vendorId: vendorId,
      day: day,
    },
  });
};

export const getAllVendorOpeningHours = async (vendorId: string): Promise<VendorOpeningHours[]> => {
  return prisma.vendorOpeningHours.findMany({
    where:{vendorId}});
};

export const updateVendorOpeningHours = async (payload: UpdateVendorOpeningHoursPayload): Promise<VendorOpeningHours> => {
  return prisma.vendorOpeningHours.update({
    where: { id: payload.id },
    data: payload,
  });
};

export const deleteVendorOpeningHours = async (id: string): Promise<VendorOpeningHours> => {
  return prisma.vendorOpeningHours.delete({
    where: { id },
  });
};