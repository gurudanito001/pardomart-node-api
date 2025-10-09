// services/vendor.service.ts
import * as vendorModel from '../models/vendor.model';
import { Vendor } from '@prisma/client';
import { getAggregateRatingService, getAggregateRatingsForVendorsService } from './rating.service';


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
  return vendorModel.createVendor(payload);
};

export const getVendorById = async (id: string, latitude?: string, longitude?: string): Promise<(vendorModel.VendorWithRelations & { distance?: number; productCount?: number; documentCount?: number }) | null> => {
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