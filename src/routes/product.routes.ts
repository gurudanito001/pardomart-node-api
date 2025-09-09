// routes/product.routes.ts
import express from 'express';
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
  getVendorProductByIdController,
  getVendorProductsByCategory,
  getTrendingVendorProductsController,
  getVendorProductsByTagIds,
  updateProductBase,
  updateVendorProduct,
} from '../controllers/product.controllers';

const router = express.Router();
router.get('/', getAllProducts);
router.get('/vendor', getAllVendorProducts);
router.get('/vendor/trending', getTrendingVendorProductsController);
router.post('/', createProduct);
router.post('/vendor', createVendorProduct);
router.post('/vendor/barcode', createVendorProductWithBarcode);
router.get('/barcode', getProductByBarcode);
router.get('/vendor/barcode', getVendorProductByBarcode);
router.get('/vendor/category', getVendorProductsByCategory);
router.get('/vendor/:id', getVendorProductByIdController);
router.get('/tags/ids', getProductsByTagIds);
router.get('/vendor/tags/ids', getVendorProductsByTagIds);
router.patch('/:id', updateProductBase);
router.patch('/vendor/:id', updateVendorProduct);
router.delete('/:id', deleteProduct);
router.delete('/vendor/:id', deleteVendorProduct);

export default router;