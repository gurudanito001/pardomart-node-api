// routes/product.routes.ts
import express from 'express';
import * as productController from '../controllers/product.controller';

const router = express.Router();
router.get('/', productController.getAllProducts);
router.get('/vendor', productController.getAllVendorProducts);
router.post('/', productController.createProduct);
router.post('/vendor', productController.createVendorProduct);
router.post('/vendor/barcode', productController.createVendorProductWithBarcode);
router.get('/barcode', productController.getProductByBarcode);
router.get('/vendor/barcode', productController.getVendorProductByBarcode);
router.get('/vendor/category', productController.getVendorProductsByCategory);
router.patch('/:id', productController.updateProductBase);
router.patch('/vendor/:id', productController.updateVendorProduct);
router.delete('/:id', productController.deleteProduct);
router.delete('/vendor/:id', productController.deleteVendorProduct);

export default router;