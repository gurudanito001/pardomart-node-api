// services/category.service.ts
import * as categoryModel from '../models/category.model';
import { Category } from '@prisma/client';
import { uploadMedia } from './media.service';
import { Readable } from 'stream';

/**
 * Retrieves an overview of category counts.
 * @returns An object with total parent and sub-category counts.
 */
export const getCategoryOverviewService = async () => {
  return categoryModel.getCategoryOverview();
};

/**
 * Retrieves all parent categories.
 * @returns A list of top-level categories.
 */
export const getAllParentCategoriesService = async () => {
  return categoryModel.getAllParentCategories();
};

/**
 * Retrieves all sub-categories.
 * @returns A list of all child categories.
 */
export const getAllSubCategoriesService = async () => {
  return categoryModel.getAllSubCategories();
};
export const createCategoriesBulk = async (categories: { name: string; description: string, parentId?: string, imageUrl: string }[]): Promise<Category[]> => {
  return categoryModel.createCategoriesBulk(categories);
};

export const createCategory = async (payload: any): Promise<Category> => {
  // If imageUrl is base64 (doesn't start with http), we must create the category first
  // to get an ID for the media upload reference.
  if (payload.imageUrl && !payload.imageUrl.startsWith('http')) {
    const { imageUrl, ...categoryData } = payload;
    const category = await categoryModel.createCategory(categoryData);
    
    try {
      const imageBuffer = Buffer.from(imageUrl, 'base64');
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: `${category.id}-category-image.jpg`,
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: imageBuffer,
        size: imageBuffer.length,
        stream: new Readable(),
        destination: '',
        filename: '',
        path: '',
      };
      const uploadResult = await uploadMedia(mockFile, category.id, 'category_image' as any);
      return await categoryModel.updateCategory({ id: category.id, imageUrl: uploadResult.cloudinaryResult.secure_url });
    } catch (error) {
      console.error('Error uploading category image:', error);
      return category;
    }
  }

  // If imageUrl is already a URL or is missing, just create the category directly.
  return categoryModel.createCategory(payload);
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
  return categoryModel.getCategoryById(id);
};

export const getAllCategories = async (filters: categoryModel.CategoryFilters): Promise<Category[]> => {
  return categoryModel.getAllCategories(filters);
};

export const updateCategory = async (payload: any): Promise<Category> => {
  if (payload.imageUrl && !payload.imageUrl.startsWith('http')) {
    try {
      const imageBuffer = Buffer.from(payload.imageUrl, 'base64');
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: `${payload.id}-category-image.jpg`,
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: imageBuffer,
        size: imageBuffer.length,
        stream: new Readable(),
        destination: '',
        filename: '',
        path: '',
      };
      const uploadResult = await uploadMedia(mockFile, payload.id, 'category_image' as any);
      payload.imageUrl = uploadResult.cloudinaryResult.secure_url;
    } catch (error) {
      console.error('Error uploading category image during update:', error);
      delete payload.imageUrl;
    }
  }
  return categoryModel.updateCategory(payload);
};

export const deleteCategory = async (id: string): Promise<Category> => {
  return categoryModel.deleteCategory(id);
};