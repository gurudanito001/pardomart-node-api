// services/vendor.service.ts
import * as vendorModel from '../models/vendor.model';
import { Vendor } from '@prisma/client';
import { uploadMedia } from './media.service';
import { getAggregateRatingService, getAggregateRatingsForVendorsService } from './rating.service';
import { prisma } from '../config/prisma';


interface VendorWithDistance extends Vendor {
  distance: number;
}

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const createVendor = async (payload: vendorModel.CreateVendorPayload): Promise<Vendor> => {
  const { image, ...vendorData } = payload;

  // Use a transaction to ensure both vendor and wallet are created or neither.
  const newVendor = await prisma.$transaction(async (tx) => {
    // 1. Create the Vendor using the existing model function, but within the transaction
    const vendor = await vendorModel.createVendor(vendorData, tx);

    // 2. Create a Wallet and link it to the new Vendor
    await tx.wallet.create({
      data: {
        vendorId: vendor.id,
      },
    });

    return vendor;
  });

  // 3. Handle image upload outside the main transaction.
  // If this fails, the vendor and wallet still exist, which is acceptable.
  if (image) {
    try {
      const imageBuffer = Buffer.from(image, 'base64');
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: `${newVendor.id}-store-image.jpg`,
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: imageBuffer,
        size: imageBuffer.length,
        stream: new (require('stream').Readable)(),
        destination: '',
        filename: '',
        path: '',
      };

      const uploadResult = await uploadMedia(mockFile, newVendor.id, 'store_image');

      // Update the vendor with the final image URL
      return vendorModel.updateVendor(newVendor.id, { image: uploadResult.cloudinaryResult.secure_url });
    } catch (error) {
      console.error('Error uploading vendor image after creation:', error);
      // The vendor was created, but image upload failed. Return the vendor without the image.
    }
  }

  // 4. Fetch and return the complete vendor data with relations.
  // This ensures the final object is consistent, whether the image was uploaded or not.
  return (await getVendorById(newVendor.id)) as Vendor;
};

export const getVendorById = async (id: string, latitude?: string, longitude?: string): Promise<(vendorModel.VendorWithRelations & { distance?: number; productCount?: number; documentCount?: number; rating?: { average: number; count: number; } }) | null> => {
  const vendor = await vendorModel.getVendorById(id);

  if (!vendor) {
    return null;
  }

  // Use Promise.all to fetch rating and document count concurrently
  const [rating, documentCount] = await Promise.all([
    getAggregateRatingService({ ratedVendorId: vendor.id }),
    vendorModel.getVendorDocumentCount(vendor.id),
  ]);

  // Extract product count from the vendor object
  const productCount = (vendor as any)._count?.vendorProducts ?? 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _count, ...vendorData } = vendor;

  // Start with the vendor data (which includes relations like user, openingHours)
  const result: any = {
    ...vendorData,
    rating: rating || { average: 0, count: 0 },
    productCount,
    documentCount,
  };

  // Now, calculate distance if coordinates are provided
  if (latitude && longitude && result.latitude && result.longitude) {
    const customerLatitude = parseFloat(latitude);
    const customerLongitude = parseFloat(longitude);

    if (!isNaN(customerLatitude) && !isNaN(customerLongitude)) {
      const distance = calculateDistance(
        customerLatitude,
        customerLongitude,
        result.latitude,
        result.longitude
      );
      result.distance = parseFloat(distance.toFixed(2));
    }
  }

  return result;
};


export const getAllVendors = async (filters: vendorModel.getVendorsFilters, pagination: {page: string, take: string}) => {
  const vendorsResult = await vendorModel.getAllVendors(filters, pagination); // This already handles filtering by userId if present in filters

  if (vendorsResult.data.length === 0) {
    return vendorsResult;
  }

  const vendorIds = vendorsResult.data.map((v: any) => v.id);
  const ratingsMap = await getAggregateRatingsForVendorsService(vendorIds);

  let vendorsWithExtras = vendorsResult.data.map((vendor: any) => {
    const cartItemCount = vendor.carts?.[0]?._count?.items || 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { carts, ...vendorWithoutCarts } = vendor;
    const rating = ratingsMap.get(vendor.id) || { average: 0, count: 0 };
    return { ...vendorWithoutCarts, cartItemCount, rating };
  });

  if(filters.latitude && filters.longitude){
    const customerLatitude = parseFloat(filters.latitude);
    const customerLongitude = parseFloat(filters.longitude);

    if (!isNaN(customerLatitude) && !isNaN(customerLongitude)) {
      vendorsWithExtras = vendorsWithExtras.map((vendor: any) => {
        const distance = calculateDistance(
          customerLatitude,
          customerLongitude,
          vendor.latitude!,
          vendor.longitude!
        );
        return { ...vendor, distance };
      });

      // Sort vendors by distance in ascending order
      vendorsWithExtras.sort((a: any, b: any) => a.distance - b.distance);
    }
  }
  
  return { ...vendorsResult, data: vendorsWithExtras };
};

export const updateVendor = async (id: string, payload: vendorModel.UpdateVendorPayload): Promise<Vendor> => {
  return vendorModel.updateVendor(id, payload);
};

export const deleteVendor = async (id: string): Promise<Vendor> => {
  return vendorModel.deleteVendor(id);
};

export const getVendorsByUserId = async (userId: string): Promise<Vendor[]> => {
  const vendors = await vendorModel.getVendorsByUserId(userId);

  if (vendors.length === 0) {
    return [];
  }

  const vendorIds = vendors.map(v => v.id);
  const ratingsMap = await getAggregateRatingsForVendorsService(vendorIds);

  const vendorsWithRatings = vendors.map(vendor => ({
    ...vendor,
    rating: ratingsMap.get(vendor.id) || { average: 0, count: 0 },
  }));

  return vendorsWithRatings;
};

/**
 * Retrieves all vendors for a user and includes the count of associated products.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to an array of vendors with their product counts.
 */
export const getVendorsByUserIdWithProductCount = (userId: string) => {
  return vendorModel.getVendorsByUserIdWithProductCount(userId);
};

/**
 * Retrieves the count of documents for a given list of vendor IDs.
 * @param vendorIds - An array of vendor IDs.
 * @returns A promise that resolves to an array of objects containing vendor ID and document count.
 */
export const getVendorDocumentCounts = (vendorIds: string[]) => {
  return vendorModel.getVendorDocumentCounts(vendorIds);
};

/**
 * Publishes a vendor's store, making it visible to the public.
 *
 * @param vendorId The ID of the vendor to publish.
 * @param userId The ID of the user attempting to publish the store.
 * @returns The updated vendor object.
 * @throws Error if the vendor is not found or if the user is not authorized.
 */
export const publishVendor = async (vendorId: string, userId: string): Promise<Vendor> => {
  // 1. Authorization: Verify the user owns the vendor.
  const vendor = await vendorModel.getVendorById(vendorId);
  if (!vendor) {
    throw new Error('Vendor not found');
  }

  if (vendor.userId !== userId) {
    throw new Error('Forbidden: You do not have permission to publish this store.');
  }

  // 2. Perform the update.
  return vendorModel.updateVendor(vendorId, {
    isPublished: true,
  });
};

/**
 * Approves a vendor's store, marking it as verified.
 * This is typically an admin-only action.
 *
 * @param vendorId The ID of the vendor to approve.
 * @returns The updated vendor object.
 * @throws Error if the vendor is not found.
 */
export const approveVendor = async (vendorId: string): Promise<Vendor> => {
  // 1. Verify the vendor exists before attempting to update.
  const vendor = await vendorModel.getVendorById(vendorId);
  if (!vendor) {
    throw new Error('Vendor not found');
  }

  // 2. Perform the update.
  return vendorModel.updateVendor(vendorId, {
    isVerified: true,
  });
};