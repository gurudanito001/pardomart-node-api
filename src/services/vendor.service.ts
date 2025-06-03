// services/vendor.service.ts
import * as vendorModel from '../models/vendor.model';
import { Vendor } from '@prisma/client';

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

export const getVendorById = async (id: string): Promise<vendorModel.VendorWithRelations | null> => {
  return vendorModel.getVendorById(id);
};


export const getAllVendors = async (filters: vendorModel.getVendorsFilters, pagination: {page: string, take: string}) => {
  const vendors = await vendorModel.getAllVendors(filters, pagination);
  //console.log("All vendors", vendors)
  if(filters.latitude && filters.longitude){
    const customerLatitude = parseFloat(filters.latitude);
    const customerLongitude = parseFloat(filters.longitude);

     if (!isNaN(customerLatitude) && !isNaN(customerLongitude)) {
       const vendorsWithDistance: VendorWithDistance[] = vendors.data.map((vendor) => {
         const distance = calculateDistance(
           customerLatitude,
           customerLongitude,
           vendor.latitude!,
           vendor.longitude!
         );
         return { ...vendor, distance };
       });

        // Sort vendors by distance in ascending order
        vendorsWithDistance.sort((a, b) => a.distance - b.distance);
        console.log(vendorsWithDistance);
        return {
            data: vendorsWithDistance,
            total: vendors.totalCount, // Ensure you return total from the original query
            page: parseInt(pagination.page),
            pageSize: parseInt(pagination.take),
            totalPages: Math.ceil(vendors.totalCount / parseInt(pagination.take)),
        };
    }
  }
  
  return vendors
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