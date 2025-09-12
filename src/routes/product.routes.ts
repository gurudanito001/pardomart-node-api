// routes/product.routes.ts
import express from 'express';

import {
  validate,
  validateCreateProduct,
  validateUpdateProduct,
  validateCreateVendorProduct,
  validateUpdateVendorProduct,
  validateGetOrDeleteProduct,
  validateGetAllProducts,
  validateGetProductByBarcode,
  validateGetProductsByTagIds,
  validateGetAllVendorProducts,
  validateGetTrendingVendorProducts,
  validateCreateVendorProductWithBarcode,
  validateGetVendorProductByBarcode,
  validateGetVendorProductsByCategory,
  validateGetVendorProductsByTagIds,
} from '../middlewares/validation.middleware';
import { authenticate, authorizeVendorAccess } from '../middlewares/auth.middleware';

import {
  createProduct,
  createVendorProduct,
  createVendorProductWithBarcode,
  deleteProduct,
  deleteVendorProduct,
  getAllProducts,
  getAllVendorProducts,
  getProductByBarcode,
  getProductsByTagIds,
  getVendorProductByBarcode,
  getVendorProductById,
  getVendorProductsByCategory,
  getTrendingVendorProducts,
  getVendorProductsByTagIds,
  updateProductBase,
  updateVendorProduct,
} from '../controllers/product.controllers';

const router = express.Router();




// Public routes
router.get('/', validate(validateGetAllProducts), getAllProducts);
router.get('/vendor', validate(validateGetAllVendorProducts), getAllVendorProducts);
router.get('/vendor/trending', validate(validateGetTrendingVendorProducts), getTrendingVendorProducts);
router.get('/barcode', validate(validateGetProductByBarcode), getProductByBarcode);
router.get('/vendor/barcode', validate(validateGetVendorProductByBarcode), getVendorProductByBarcode);
router.get('/vendor/category', validate(validateGetVendorProductsByCategory), getVendorProductsByCategory);
router.get('/vendor/:id', validate(validateGetOrDeleteProduct), getVendorProductById);
router.get('/tags/ids', validate(validateGetProductsByTagIds), getProductsByTagIds);
router.get('/vendor/tags/ids', validate(validateGetVendorProductsByTagIds), getVendorProductsByTagIds);

// Protected routes (assuming admin/vendor roles)
router.post('/', authenticate, /* authorize(['admin']), */ validate(validateCreateProduct), createProduct);
router.post('/vendor', authenticate, authorizeVendorAccess, validate(validateCreateVendorProduct), createVendorProduct);
router.post('/vendor/barcode', authenticate, authorizeVendorAccess, validate(validateCreateVendorProductWithBarcode), createVendorProductWithBarcode);
router.patch('/:id', authenticate, /* authorize(['admin']), */ validate(validateUpdateProduct), updateProductBase);
router.patch('/vendor/:id', authenticate, authorizeVendorAccess, validate(validateUpdateVendorProduct), updateVendorProduct);
router.delete('/:id', authenticate, /* authorize(['admin']), */ validate(validateGetOrDeleteProduct), deleteProduct);
router.delete('/vendor/:id', authenticate, authorizeVendorAccess, validate(validateGetOrDeleteProduct), deleteVendorProduct);


export default router;