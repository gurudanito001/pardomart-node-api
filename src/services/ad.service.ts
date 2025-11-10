// src/services/ad.service.ts
import { Ad, Prisma } from '@prisma/client';
import * as adModel from '../models/ad.model';
import { uploadMedia } from './media.service';

export class AdError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'AdError';
    this.statusCode = statusCode;
  }
}

export interface CreateAdServicePayload extends Omit<adModel.CreateAdPayload, 'imageUrl'> {
  imageFile?: Express.Multer.File;
}

export interface UpdateAdServicePayload extends Omit<adModel.UpdateAdPayload, 'imageUrl'> {
  imageFile?: Express.Multer.File;
}

/**
 * Creates a new ad, handling image upload.
 * @param payload - The ad data and image file.
 * @returns The created ad.
 */
export const createAdService = async (payload: CreateAdServicePayload): Promise<Ad> => {
  const { imageFile, ...adData } = payload;

  if (!imageFile) {
    throw new AdError('An image file is required to create an ad.');
  }

  // Upload image to Cloudinary
  const uploadResult = await uploadMedia(imageFile, adData.vendorId, 'ad_image');

  const finalPayload: adModel.CreateAdPayload = {
    ...adData,
    imageUrl: uploadResult.cloudinaryResult.secure_url,
  };

  return adModel.createAd(finalPayload);
};

/**
 * Retrieves a list of ads based on filters.
 * @param filters - The filtering criteria.
 * @returns An array of ad objects.
 */
export const listAdsService = async (filters: adModel.ListAdsFilters): Promise<Ad[]> => {
  return adModel.listAds(filters);
};

/**
 * Retrieves an ad by its ID.
 * @param id - The ID of the ad.
 * @returns The ad object or null.
 */
export const getAdByIdService = async (id: string): Promise<Ad | null> => {
  return adModel.getAdById(id);
};

/**
 * Updates an ad, handling optional new image upload.
 * @param id - The ID of the ad to update.
 * @param payload - The data to update.
 * @returns The updated ad.
 */
export const updateAdService = async (id: string, payload: UpdateAdServicePayload): Promise<Ad> => {
  const { imageFile, ...updateData } = payload;

  const ad = await adModel.getAdById(id);
  if (!ad) {
    throw new AdError('Ad not found.', 404);
  }

  let finalUpdateData: Partial<adModel.UpdateAdPayload> = { ...updateData };

  if (imageFile) {
    const uploadResult = await uploadMedia(imageFile, ad.vendorId, 'ad_image');
    finalUpdateData = {
      ...finalUpdateData,
      imageUrl: uploadResult.cloudinaryResult.secure_url,
    };
  }

  return adModel.updateAd(id, finalUpdateData as adModel.UpdateAdPayload);
};

/**
 * Deletes an ad.
 * @param id - The ID of the ad to delete.
 * @returns The deleted ad.
 */
export const deleteAdService = async (id: string): Promise<Ad> => {
  const ad = await adModel.getAdById(id);
  if (!ad) {
    throw new AdError('Ad not found.', 404);
  }
  // Note: Deleting the record in the DB is enough.
  // We don't need to delete the image from Cloudinary unless required for storage management.
  return adModel.deleteAd(id);
};