// services/category.service.ts
import * as categoryModel from '../models/category.model';
import { Category } from '@prisma/client';


export const createCategoriesBulk = async (categories: { name: string; description: string, parentId?: string }[]): Promise<Category[]> => {
  return categoryModel.createCategoriesBulk(categories);
};

export const createCategory = async (payload: any): Promise<Category> => {
  return categoryModel.createCategory(payload);
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
  return categoryModel.getCategoryById(id);
};

export const getAllCategories = async (filters: categoryModel.CategoryFilters): Promise<Category[]> => {
  return categoryModel.getAllCategories(filters);
};

export const updateCategory = async (payload: any): Promise<Category> => {
  return categoryModel.updateCategory(payload);
};

export const deleteCategory = async (id: string): Promise<Category> => {
  return categoryModel.deleteCategory(id);
};