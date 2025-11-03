// controllers/category.controller.ts
import { Request, Response } from 'express';
import * as categoryService from '../services/category.service';
import { CategoryFilters } from '../models/category.model';
import { Prisma } from '@prisma/client';

/**
 * @swagger
 * components:
 *   schemas:
 *     CategoryOverview:
 *       type: object
 *       properties:
 *         totalParentCategories:
 *           type: integer
 *           description: "The total number of top-level categories."
 *         totalSubCategories:
 *           type: integer
 *           description: "The total number of categories that are children of another category."
 */

/**
 * @swagger
 * /category/admin/overview:
 *   get:
 *     summary: Get an overview of category data (Admin)
 *     tags: [Category, Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves aggregate data about categories, such as the total number of parent and sub-categories.
 *     responses:
 *       200:
 *         description: The category overview data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryOverview'
 *       500:
 *         description: Internal server error.
 */
export const getCategoryOverviewController = async (req: Request, res: Response) => {
  try {
    const overview = await categoryService.getCategoryOverviewService();
    res.status(200).json(overview);
  } catch (error: any) {
    console.error('Error getting category overview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /category/parents:
 *   get:
 *     summary: Get all parent categories
 *     tags: [Category]
 *     description: Retrieves a list of all top-level categories (those without a parent).
 *     responses:
 *       200:
 *         description: A list of parent categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       500:
 *         description: Internal server error.
 */
export const getAllParentCategoriesController = async (req: Request, res: Response) => {
  try {
    const parentCategories = await categoryService.getAllParentCategoriesService();
    res.status(200).json(parentCategories);
  } catch (error: any) {
    console.error('Error getting parent categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /category/sub-categories:
 *   get:
 *     summary: Get all sub-categories
 *     tags: [Category]
 *     description: Retrieves a list of all categories that are children of another category (i.e., their parentId is not null).
 *     responses:
 *       200:
 *         description: A list of all sub-categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       500:
 *         description: Internal server error.
 */
export const getAllSubCategoriesController = async (req: Request, res: Response) => {
  try {
    const subCategories = await categoryService.getAllSubCategoriesService();
    res.status(200).json(subCategories);
  } catch (error: any) {
    console.error('Error getting sub-categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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
    const { categories } = req.body;
    const createdCategories = await categoryService.createCategoriesBulk(categories);
    res.status(201).json(createdCategories);
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error creating categories in bulk:', error);
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * @swagger
 * /category:
 *   post:
 *     summary: Create a new category (Admin)
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     description: Creates a new category. To create a parent category, omit the `parentId`. To create a sub-category, provide the `parentId` of an existing category.
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
 *       404:
 *         description: Not Found - The provided parentId does not exist.
 *       409:
 *         description: Conflict - A category with this name already exists.
 *       500:
 *         description: Internal server error.
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle unique constraint violation (e.g., duplicate category name)
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'A category with this name already exists.' });
      }
      if (error.code === 'P2003') {
        return res.status(404).json({ error: 'The specified parent category does not exist.' });
      }
    }
    const errorMessage = error.message || 'Internal server error';
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
 *     summary: Update a category (Admin)
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Updates a category's details. This can be used to change its name, description, or move it within the hierarchy.
 *       - To change a sub-category's parent, provide a new `parentId`.
 *       - To promote a sub-category to a parent category, set `parentId` to `null`.
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
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Category not found.' });
      }
      // Handle unique constraint violation on update
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'A category with this name already exists.' });
      }
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found.' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};