// routes/category.routes.ts
import express from 'express';
import * as categoryController from '../controllers/category.controllers';
import {
  validate,
  validateCreateCategory,
  validateCreateCategoriesBulk,
  validateUpdateCategory,
  validateGetOrDeleteCategory,
  validateGetAllCategories,
} from '../middlewares/validation.middleware';

const router = express.Router();


router.post('/bulk', validate(validateCreateCategoriesBulk), categoryController.createCategoriesBulk);
router.post('/', validate(validateCreateCategory), categoryController.createCategory);
router.get('/:id', validate(validateGetOrDeleteCategory), categoryController.getCategoryById);
router.get('/', validate(validateGetAllCategories), categoryController.getAllCategories);
router.put('/:id', validate(validateUpdateCategory), categoryController.updateCategory);
router.delete('/:id', validate(validateGetOrDeleteCategory), categoryController.deleteCategory);

export default router;