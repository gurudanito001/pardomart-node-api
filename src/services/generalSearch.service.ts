import {  searchByProductName, searchByStoreName, searchByCategoryName, searchStoreProducts, searchByCategoryId } from '../models/generalSearch.model';


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

export const searchByCategoryIdService = async (
  categoryId: string,
  latitude: number,
  longitude: number
) => {
  try {
    const result = await searchByCategoryId(categoryId, latitude, longitude);
    return result;
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