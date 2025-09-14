import {  searchByProductName, searchByStoreName, searchByCategoryName, searchStoreProducts, searchByCategoryId, StoreWithProducts as ModelStoreWithProducts } from '../models/generalSearch.model';
import { getAggregateRatingsForVendorsService } from './rating.service';

type StoreWithRating = ModelStoreWithProducts & {
  vendor: ModelStoreWithProducts['vendor'] & {
    rating?: { average: number; count: number };
  }
}

// Helper to attach ratings to a list of stores
const attachRatingsToStores = async (stores: ModelStoreWithProducts[]): Promise<StoreWithRating[]> => {
  if (!stores || stores.length === 0) {
    return [];
  }
  const vendorIds = stores.map(store => store.vendor.id);
  const ratingsMap = await getAggregateRatingsForVendorsService(vendorIds);

  return stores.map(store => ({
    ...store,
    vendor: {
      ...store.vendor,
      rating: ratingsMap.get(store.vendor.id) || { average: 0, count: 0 },
    },
  }));
};

// Service Function
export const searchProductsService = async (
  searchTerm: string,
  userLatitude: number,
  userLongitude: number
) => {
  try {
    const searchResult = await searchByProductName(searchTerm, userLatitude, userLongitude);
    const storesWithRatings = await attachRatingsToStores(searchResult.stores);
    return { stores: storesWithRatings };
  } catch (error: any) {
    // Handle errors (e.g., logging, specific error types)
    console.error('Error searching by product name:', error);
    throw error; // Re-throw to be caught by the controller
  }
};

export const searchByCategoryIdService = async (
  categoryId: string,
  latitude: number,
  longitude: number
) => {
  try {
    const searchResult = await searchByCategoryId(categoryId, latitude, longitude);
    const storesWithRatings = await attachRatingsToStores(searchResult.stores);
    return { stores: storesWithRatings };
  } catch (error: any) {
    console.error('Error searching by category id:', error);
    throw error; // Re-throw to be caught by the controller
  }
};

export const searchStoreProductsService = async (
  storeId: string,
  searchTerm?: string,
  categoryId?: string
) => {
  try {
    const result = await searchStoreProducts(storeId, searchTerm, categoryId);
    return result;
  } catch (error: any) {
    // Handle errors (e.g., logging, specific error types)
    console.error('Error in searchStoreProductsService:', error);
    throw error; // Re-throw to be caught by the controller
  }
};

export const searchStoreService = async (
  searchTerm: string,
  userLatitude: number,
  userLongitude: number
) => {
  try {
    const searchResult = await searchByStoreName(searchTerm, userLatitude, userLongitude);
    const storesWithRatings = await attachRatingsToStores(searchResult.stores);
    return { stores: storesWithRatings };
  } catch (error: any) {
    // Handle errors (e.g., logging, specific error types)
    console.error('Error searching by store name:', error);
    throw error; // Re-throw to be caught by the controller
  }
};


export const searchByCategoryService = async (
  searchTerm: string, 
  latitude: number, 
  longitude: number
) => {
  try {
    const searchResult = await searchByCategoryName(searchTerm, latitude, longitude);
    const storesWithRatings = await attachRatingsToStores(searchResult.stores);
    return { stores: storesWithRatings };
  } catch (error: any) {
    // Handle errors (e.g., logging, specific error types)
    console.error('Error searching by category name:', error);
    throw error; // Re-throw to be caught by the controller
  }
};