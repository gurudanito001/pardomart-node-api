// services/category.service.ts
import * as categoryModel from '../models/category.model';
import { Category } from '@prisma/client';


export const createCategoriesBulk = async (names: string[]): Promise<Category[]> => {
  return categoryModel.createCategoriesBulk(names);
};

export const createCategory = async (payload: any): Promise<Category> => {
  return categoryModel.createCategory(payload);
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
  return categoryModel.getCategoryById(id);
};

export const getAllCategories = async (): Promise<Category[]> => {
  return categoryModel.getAllCategories();
};

export const updateCategory = async (payload: any): Promise<Category> => {
  return categoryModel.updateCategory(payload);
};

export const deleteCategory = async (id: string): Promise<Category> => {
  return categoryModel.deleteCategory(id);
};