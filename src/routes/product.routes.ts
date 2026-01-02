import { Router } from 'express';
import * as productController from '../controllers/product.controllers';
import { authenticate, authorize } from '../middlewares/auth.middleware'; // Assuming you have validation middleware
import { validate, validateUpdateVendorProduct, validateCreateVendorProduct } from '../middlewares/validation.middleware'; // Assuming you have validation middleware
import {
    validateCreateProduct,
    validateUpdateProductBase,
    validateId,
    validateGetVendorProductById,
    validateCreateVendorProductWithBarcode,
    validateGetAllVendorProducts,
    validateGetTrendingVendorProducts,
    validateGetProductByBarcode,
    validateGetVendorProductByBarcode,
    validateGetProductsByTagIds,
    validateGetVendorProductsByTagIds,
    validateGetVendorProductsByCategory,
    validateGetVendorProductsByUser,
    validateTransferProducts,
    validateAdminGetAllProducts,
    validateUpdateProductStatus,
    validateGetVendorProductsForProduct,
} from '../middlewares/product.validation';
import { Role } from '@prisma/client';

const router = Router();

// --- Admin Product Overview ---
router.get(
    '/admin/overview',
    authenticate,
    authorize(['admin']),
    productController.getProductOverviewController
);

router.get(
    '/admin/all',
    authenticate,
    authorize(['admin']),
    validate(validateAdminGetAllProducts),
    productController.adminGetAllProductsController
);

router.get(
    '/admin/:productId/vendor-products',
    authenticate,
    authorize(['admin']),
    validate(validateGetVendorProductsForProduct),
    productController.getVendorProductsForProductController
);


// --- Base Product Routes (Admin Only) ---
router.post(
    '/',
    authenticate,
    authorize(['admin']),
    validate(validateCreateProduct),
    productController.createProduct
);
router.patch(
    '/:id',
    authenticate,
    authorize(['admin']),
    validate(validateUpdateProductBase),
    productController.updateProductBase
);
router.patch(
    '/:id/status',
    authenticate,
    authorize(['admin']),
    validate(validateUpdateProductStatus),
    productController.updateProductStatusController
);
router.delete(
    '/:id',
    authenticate,
    authorize(['admin']),
    validate(validateId),
    productController.deleteProduct
);

// --- Vendor Product Routes (Vendor Owner & Store Admin) ---
router.post(
    '/vendor',
    authenticate,
    authorize(['vendor', 'store_admin']),
    validate(validateCreateVendorProduct),
    productController.createVendorProduct
);
router.post(
    '/vendor/barcode',
    authenticate,
    authorize(['vendor', 'store_admin']),
    validate(validateCreateVendorProductWithBarcode),
    productController.createVendorProductWithBarcode
);
router.patch(
    '/vendor/:id',
    authenticate,
    authorize(['vendor', 'store_admin']),
    validate(validateUpdateVendorProduct),
    productController.updateVendorProduct
);
router.delete(
    '/vendor/:id',
    authenticate,
    authorize(['vendor', 'store_admin']),
    validate(validateId),
    productController.deleteVendorProduct
);

// Add this new route
router.get(
  '/vendor/my-products',
  authenticate,
  authorize([Role.vendor]),
  productController.getMyVendorProductsController
);

router.post(
  '/vendor/transfer',
  authenticate,
  authorize([Role.vendor]),
  validate(validateTransferProducts),
  productController.transferVendorProductsController
);

// --- Public/General Product Routes ---
router.get('/', productController.getAllProducts);
router.get('/vendor', validate(validateGetAllVendorProducts), productController.getAllVendorProducts);
router.get('/vendor/trending', validate(validateGetTrendingVendorProducts), productController.getTrendingVendorProducts);
router.get('/vendor/:id', validate(validateGetVendorProductById), productController.getVendorProductById);
router.get('/barcode', validate(validateGetProductByBarcode), productController.getProductByBarcode);
router.get('/vendor/barcode', validate(validateGetVendorProductByBarcode), productController.getVendorProductByBarcode);
router.get('/tags/ids', validate(validateGetProductsByTagIds), productController.getProductsByTagIds);
router.get('/vendor/tags/ids', validate(validateGetVendorProductsByTagIds), productController.getVendorProductsByTagIds);
router.get('/vendor/category', validate(validateGetVendorProductsByCategory), productController.getVendorProductsByCategory);
router.get('/user/:userId', authenticate, validate(validateGetVendorProductsByUser), productController.getVendorProductsByUserController);

export default router;