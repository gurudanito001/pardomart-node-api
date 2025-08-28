import {  searchByProductName, searchByStoreName, searchByCategoryName } from '../models/generalSearch.model';


// Service Function
export const searchProductsService = async (
  searchTerm: string,
  userLatitude: number,
  userLongitude: number
) => {
  try {
    const result = await searchByProductName(searchTerm, userLatitude, userLongitude);
    return result;
  } catch (error: any) {
    // Handle errors (e.g., logging, specific error types)
    console.error('Error searching by product name:', error);
    throw error; // Re-throw to be caught by the controller
  }
};

export const searchStoreService = async (
  searchTerm: string,
  userLatitude: number,
  userLongitude: number
) => {
  try {
    const result = await searchByStoreName(searchTerm, userLatitude, userLongitude);
    return result;
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
    const result = await searchByCategoryName(searchTerm, latitude, longitude);
    return result;
  } catch (error: any) {
    // Handle errors (e.g., logging, specific error types)
    console.error('Error searching by category name:', error);
    throw error; // Re-throw to be caught by the controller
  }
};