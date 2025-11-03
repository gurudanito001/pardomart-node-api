// routes/category.routes.ts
import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import * as categoryController from '../controllers/category.controllers';
import {
  validate,
  validateCreateCategory,
  validateCreateCategoriesBulk,
  validateUpdateCategory,
  validateGetOrDeleteCategory,
  validateGetAllCategories,
} from '../middlewares/validation.middleware';
import { Role } from '@prisma/client';

const router = express.Router();

// --- Admin Category Overview ---
router.get(
  '/admin/overview',
  authenticate,
  authorize([Role.admin]),
  categoryController.getCategoryOverviewController
);

// --- Public Category Routes ---
router.get('/parents', categoryController.getAllParentCategoriesController);
router.get('/sub-categories', categoryController.getAllSubCategoriesController);

// --- Admin-only Category Creation/Modification ---
router.post(
  '/bulk',
  authenticate,
  authorize([Role.admin]),
  validate(validateCreateCategoriesBulk),
  categoryController.createCategoriesBulk
);
router.post('/', authenticate, authorize([Role.admin]), validate(validateCreateCategory), categoryController.createCategory);
router.get('/:id', validate(validateGetOrDeleteCategory), categoryController.getCategoryById);
router.get('/', validate(validateGetAllCategories), categoryController.getAllCategories);
router.put(
  '/:id',
  authenticate,
  authorize([Role.admin]),
  validate(validateUpdateCategory),
  categoryController.updateCategory
);
router.delete(
  '/:id',
  authenticate,
  authorize([Role.admin]),
  validate(validateGetOrDeleteCategory),
  categoryController.deleteCategory
);

export default router;