// services/product.service.ts
import * as productModel from '../models/product.model';
import { Product, VendorProduct } from '@prisma/client';

export const createProduct = async (payload: any): Promise<Product> => {
  return productModel.createProduct(payload);
};

export const createVendorProduct = async (payload: any): Promise<VendorProduct> => {
  return productModel.createVendorProduct(payload);
};

export const createVendorProductWithBarcode = async (
  payload: any
): Promise<VendorProduct> => {
  return productModel.createVendorProductWithBarcode(payload);
};

export const getProductByBarcode = async (barcode: string): Promise<Product | null> => {
  return productModel.getProductByBarcode(barcode);
};

export const getVendorProductByBarcode = async (barcode: string, vendorId: string): Promise<VendorProduct | null> => {
  return productModel.getVendorProductByBarcode(barcode, vendorId);
};

export const getVendorProductsByCategory = async (
  vendorId: string,
  categoryId: string
): Promise<VendorProduct[]> => {
  return productModel.getVendorProductsByCategory(vendorId, categoryId);
};

export const updateProductBase = async (payload: any): Promise<Product> => {
  return productModel.updateProductBase(payload);
};

export const updateVendorProduct = async (payload: any): Promise<VendorProduct> => {
  return productModel.updateVendorProduct(payload);
};

export const getAllProducts = async (): Promise<Product[]> => {
  return productModel.getAllProducts();
};

export const getAllVendorProducts = async (vendorId: string): Promise<VendorProduct[]> => {
  return productModel.getAllVendorProducts(vendorId);
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