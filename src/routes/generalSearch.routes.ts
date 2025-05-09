// routes/product.routes.ts
import express from 'express';
import { getVendorCategoriesWithProductsController, getVendorsCategoriesAndProductsController, getCategoryDetailsWithRelatedDataController, getStoresByProductIdController } from '../controllers/generalSearch.controller';

const router = express.Router();
router.get('/', getVendorsCategoriesAndProductsController);
router.get('/vendor/:vendorId', getVendorCategoriesWithProductsController);
router.get('/category/:categoryId', getCategoryDetailsWithRelatedDataController);
router.get('/product/', getStoresByProductIdController);

export default router;