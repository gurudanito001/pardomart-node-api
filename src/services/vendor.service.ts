// services/vendor.service.ts
import * as vendorModel from '../models/vendor.model';
import { Vendor } from '@prisma/client';



export const createVendor = async (payload: vendorModel.CreateVendorPayload): Promise<Vendor> => {
  return vendorModel.createVendor(payload);
};

export const getVendorById = async (id: string): Promise<Vendor | null> => {
  return vendorModel.getVendorById(id);
};

export const getAllVendors = async (): Promise<Vendor[]> => {
  return vendorModel.getAllVendors();
};

export const updateVendor = async (id: string, payload: vendorModel.UpdateVendorPayload): Promise<Vendor> => {
  return vendorModel.updateVendor(id, payload);
};

export const deleteVendor = async (id: string): Promise<Vendor> => {
  return vendorModel.deleteVendor(id);
};

export const getVendorsByUserId = async (userId: string): Promise<Vendor[]> => {
  return vendorModel.getVendorsByUserId(userId);
};