// controllers/category.controller.ts
import { Request, Response } from 'express';
import * as categoryService from '../services/category.service';
import { CategoryFilters } from '../models/category.model';

export const createCategoriesBulk = async (req: Request, res: Response) => {
  try {
    const {categories} = req.body;

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ error: 'Category list is required and must not be empty' });
    }

    const createdCategories = await categoryService.createCategoriesBulk(categories);
    res.status(201).json(createdCategories);
  } catch (error) {
    console.error('Error creating categories in bulk:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error getting category by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllCategories = async (req: Request, res: Response) => {
  //let parentId: string | undefined;
  const {parentId, type, name}: CategoryFilters  = req?.query;

  try {
    const categories = await categoryService.getAllCategories({ parentId, type, name });
    res.json(categories);
  } catch (error) {
    console.error('Error getting all categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.updateCategory({ id: req.params.id, ...req.body });
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {

    const category = await categoryService.deleteCategory(req.params.id);
    res.json(category);
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};