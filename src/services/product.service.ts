// services/product.service.ts
import * as productModel from '../models/product.model';
import { Product, VendorProduct } from '@prisma/client';

export interface CreateProductPayload {
  barcode: string;
  name: string;
  description?: string;
  images?: string[];
  categoryIds: string[];
  tags?: string[];
  isAlcohol?: boolean;
  isAgeRestricted?: boolean;
}

export interface UpdateProductBasePayload {
  id: string;
  name?: string;
  description?: string;
  images?: string[];
  categoryIds?: string[];
}

export interface CreateVendorProductPayload {
  vendorId: string;
  productId: string;
  price: number;
  name: string;
  description?: string;
  discountedPrice?: number;
  stock?: number;
  isAvailable?: boolean;
  categoryIds: string[];
}

export interface CreateVendorProductWithBarcodePayload {
  vendorId: string;
  barcode: string;
  price: number;
  name: string;
  description?: string;
  categoryIds: string[];
  discountedPrice?: number;
  stock?: number;
  isAvailable?: boolean;
}

export interface UpdateVendorProductPayload {
  id: string;
  price?: number;
  name?: string;
  stock?: number;
  isAvailable?: boolean;
}

export const createProduct = async (payload: CreateProductPayload): Promise<Product> => {
  return productModel.createProduct(payload);
};

export const createVendorProduct = async (payload: CreateVendorProductPayload): Promise<VendorProduct> => {
  return productModel.createVendorProduct(payload);
};

export const createVendorProductWithBarcode = async (
  payload: CreateVendorProductWithBarcodePayload
): Promise<VendorProduct> => {
  return productModel.createVendorProductWithBarcode(payload);
};

export const getProductByBarcode = async (barcode: string): Promise<Product | null> => {
  return productModel.getProductByBarcode(barcode);
};

export const getVendorProductByBarcode = async (barcode: string, vendorId: string): Promise<VendorProduct | null> => {
  return productModel.getVendorProductByBarcode(barcode, vendorId);
};

export const getVendorProductById = async (id: string): Promise<VendorProduct | null> => {
  return productModel.getVendorProductById(id);
};

export const getVendorProductsByCategory = async (
  vendorId: string,
  categoryId: string
): Promise<VendorProduct[]> => {
  return productModel.getVendorProductsByCategory(vendorId, categoryId);
};

export const updateProductBase = async (payload: UpdateProductBasePayload): Promise<Product> => {
  return productModel.updateProductBase(payload);
};

export const updateVendorProduct = async (payload: UpdateVendorProductPayload): Promise<VendorProduct> => {
  return productModel.updateVendorProduct(payload);
};

export const getAllProducts = async (): Promise<Product[]> => {
  return productModel.getAllProducts();
};

export const getAllVendorProducts = async (filters: productModel.getVendorProductsFilters, pagination: { page: string, take: string }) => {
  return productModel.getAllVendorProducts(filters, pagination);
};

export const getProductsByTagIds = async (tagIds: string[]): Promise<Product[]> => {
  return productModel.getProductsByTagIds(tagIds);
};

export const getVendorProductsByTagIds = async (tagIds: string[]): Promise<VendorProduct[]> => {
  return productModel.getVendorProductsByTagIds(tagIds);
};

export const deleteProduct = async (id: string): Promise<Product> => {
  return productModel.deleteProduct(id);
};

export const deleteVendorProduct = async (id: string): Promise<VendorProduct> => {
  return productModel.deleteVendorProduct(id);
};


export const getTrendingVendorProductsService = async (
  filters: { vendorId?: string },
  pagination: { page: string; take: string }
) => {
  return productModel.getTrendingVendorProducts(filters, pagination);
};