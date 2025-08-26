// controllers/category.controller.ts
import { Request, Response } from 'express';
import * as categoryService from '../services/category.service';
import { CategoryFilters } from '../models/category.model';

/**
 * @swagger
 * /category/bulk:
 *   post:
 *     summary: Create multiple categories in bulk
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoriesBulkPayload'
 *     responses:
 *       201:
 *         description: The created categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       400:
 *         description: Bad request, category list is missing or empty.
 *       500:
 *         description: Internal server error.
 */
export const createCategoriesBulk = async (req: Request, res: Response) => {
  try {
    const {categories} = req.body;

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ error: 'Category list is required and must not be empty' });
    }

    const createdCategories = await categoryService.createCategoriesBulk(categories);
    res.status(201).json(createdCategories);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error creating categories in bulk:', error);
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * @swagger
 * /category:
 *   post:
 *     summary: Create a new category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryPayload'
 *     responses:
 *       201:
 *         description: The created category.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       500:
 *         description: Internal server error.
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error creating category:', error);
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * @swagger
 * /category/{id}:
 *   get:
 *     summary: Get a category by its ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the category.
 *     responses:
 *       200:
 *         description: The requested category.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found.
 */
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error getting category by ID:', error);
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * @swagger
 * /category:
 *   get:
 *     summary: Get all categories, with optional filters
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter categories by their parent ID.
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [top, sub]
 *         description: Filter categories by their type.
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter categories by name (case-insensitive search).
 *     responses:
 *       200:
 *         description: A list of categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
export const getAllCategories = async (req: Request, res: Response) => {
  //let parentId: string | undefined;
  const {parentId, type, name}: CategoryFilters  = req?.query;

  try {
    const categories = await categoryService.getAllCategories({ parentId, type, name });
    res.json(categories);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error getting all categories:', error);
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * @swagger
 * /category/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the category to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCategoryPayload'
 *     responses:
 *       200:
 *         description: The updated category.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found.
 */
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.updateCategory({ id: req.params.id, ...req.body });
    res.json(category);
  } catch (error: any) {
    console.error('Error updating category:', error);
    // Assuming the service throws an error with a specific message for not found
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /category/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the category to delete.
 *     responses:
 *       200:
 *         description: The deleted category.
 *       404:
 *         description: Category not found.
 */
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.deleteCategory(req.params.id);
    res.json(category);
  } catch (error: any) {
    console.error('Error deleting category:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};