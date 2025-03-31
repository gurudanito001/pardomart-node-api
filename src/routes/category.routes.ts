// routes/category.routes.ts
import express from 'express';
import * as categoryController from '../controllers/category.controller';

const router = express.Router();


router.post('/bulk', categoryController.createCategoriesBulk);
router.post('/', categoryController.createCategory);
router.get('/:id', categoryController.getCategoryById);
router.get('/', categoryController.getAllCategories);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;