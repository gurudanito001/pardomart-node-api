// services/vendorOpeningHours.service.ts
import * as vendorOpeningHoursModel from '../models/vendorOpeningHours.model';
import { VendorOpeningHours } from '@prisma/client';

export const createVendorOpeningHours = async (payload: vendorOpeningHoursModel.CreateVendorOpeningHoursPayload): Promise<VendorOpeningHours> => {
  return vendorOpeningHoursModel.createVendorOpeningHours(payload);
};

export const getVendorOpeningHoursById = async (id: string): Promise<VendorOpeningHours | null> => {
  return vendorOpeningHoursModel.getVendorOpeningHoursById(id);
};

export const getVendorOpeningHoursByVendorIdAndDay = async (vendorId: string, day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"): Promise<VendorOpeningHours | null> => {
  return vendorOpeningHoursModel.getVendorOpeningHoursByVendorIdAndDay(vendorId, day);
};

export const getAllVendorOpeningHours = async (vendorId: string): Promise<VendorOpeningHours[]> => {
  return vendorOpeningHoursModel.getAllVendorOpeningHours(vendorId);
};

export const updateVendorOpeningHours = async (payload: vendorOpeningHoursModel.UpdateVendorOpeningHoursPayload): Promise<VendorOpeningHours> => {
  return vendorOpeningHoursModel.updateVendorOpeningHours(payload);
};

export const deleteVendorOpeningHours = async (id: string): Promise<VendorOpeningHours> => {
  return vendorOpeningHoursModel.deleteVendorOpeningHours(id);
};