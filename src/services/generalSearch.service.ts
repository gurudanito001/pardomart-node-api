import { getVendorsCategoriesAndProducts, getVendorCategoriesWithProducts, getCategoryDetailsWithRelatedData, getStoresByProductId } from '../models/generalSearch.model';
import { CategoryDetailsWithRelatedData } from '../models/generalSearch.model';



export const getVendorsCategoriesAndProductsService = async (
  search: string,
  latitude: number,
  longitude: number
) => {
  try {
    const results = await getVendorsCategoriesAndProducts(search, latitude, longitude);
    return results;
  } catch (error) {
    // Handle errors appropriately (e.g., log, rethrow with a specific error type)
    console.error('Error in generalSearchService:', error);
    throw error;
  }
};


// Service Function
export const getVendorCategoriesWithProductsService = async (vendorId: string) => {
  try {
    const result = await getVendorCategoriesWithProducts(vendorId);
    return result;
  } catch (error) {
    // Handle errors appropriately (e.g., log, rethrow with a specific error type)
    console.error('Error in getVendorCategoriesWithProductsService:', error);
    throw error;
  }
};


// Service Function
export const getCategoryDetailsWithRelatedDataService = async ({
  categoryId,
  page,
  take,
  userLatitude,
  userLongitude,
  vendorId
}: CategoryDetailsWithRelatedData) => {
  try {
    const results = await getCategoryDetailsWithRelatedData({
      categoryId,
      vendorId,
      userLatitude,
      userLongitude,
      page,
      take,
    });
    return results;
  } catch (error: any) {
    // Handle errors appropriately (e.g., log, rethrow with a specific error type)
    console.error('Error in getCategoryDetailsService:', error);
    throw error; // Re-throw the error to be handled by your application's error handling
  }
};


// Service Function
export const getStoresByProductIdService = async (
  searchTerm: string,
  userLatitude: number,
  userLongitude: number
) => {
  try {
    const result = await getStoresByProductId(searchTerm, userLatitude, userLongitude);
    return result;
  } catch (error: any) {
    // Handle errors (e.g., logging, specific error types)
    console.error('Error in getStoresByProductIdService:', error);
    throw error; // Re-throw to be caught by the controller
  }
};