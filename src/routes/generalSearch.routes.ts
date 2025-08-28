// routes/product.routes.ts
import express from 'express';
import { searchByProductController, searchByStoreController, searchByCategoryController } from '../controllers/generalSearch.controllers';

const router = express.Router();
//router.get('/', getVendorsCategoriesAndProductsController);


router.get('/product/', searchByProductController);
router.get('/store', searchByStoreController);
router.get('/category', searchByCategoryController);

export default router;