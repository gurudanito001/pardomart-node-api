// routes/product.routes.ts
import express from 'express';
import { searchByProductController, searchByStoreController, searchByCategoryController, searchStoreProductsController, searchByCategoryIdController } from '../controllers/generalSearch.controllers';
import { validate, validateGeneralSearch, validateSearchStoreProducts, validateSearchByCategoryId } from '../middlewares/validation.middleware';

const router = express.Router();
//router.get('/', getVendorsCategoriesAndProductsController);

router.get('/product/', validate(validateGeneralSearch), searchByProductController);
router.get('/store', validate(validateGeneralSearch), searchByStoreController);
router.get('/category', validate(validateGeneralSearch), searchByCategoryController);
router.get('/category/:categoryId', validate(validateSearchByCategoryId), searchByCategoryIdController);
router.get('/storeProducts/:storeId', validate(validateSearchStoreProducts), searchStoreProductsController);

export default router;