"use strict";
exports.__esModule = true;
var express_1 = require("express");
var productController = require("../controllers/product.controllers");
var auth_middleware_1 = require("../middlewares/auth.middleware"); // Assuming you have validation middleware
var validation_middleware_1 = require("../middlewares/validation.middleware"); // Assuming you have validation middleware
var product_validation_1 = require("../middlewares/product.validation");
var client_1 = require("@prisma/client");
var router = express_1.Router();
// --- Admin Product Overview ---
router.get('/admin/overview', auth_middleware_1.authenticate, auth_middleware_1.authorize(['admin']), productController.getProductOverviewController);
router.get('/admin/all', auth_middleware_1.authenticate, auth_middleware_1.authorize(['admin']), validation_middleware_1.validate(product_validation_1.validateAdminGetAllProducts), productController.adminGetAllProductsController);
router.get('/admin/:productId/vendor-products', auth_middleware_1.authenticate, auth_middleware_1.authorize(['admin']), validation_middleware_1.validate(product_validation_1.validateGetVendorProductsForProduct), productController.getVendorProductsForProductController);
// --- Base Product Routes (Admin Only) ---
router.post('/', auth_middleware_1.authenticate, auth_middleware_1.authorize(['admin']), validation_middleware_1.validate(product_validation_1.validateCreateProduct), productController.createProduct);
router.patch('/:id', auth_middleware_1.authenticate, auth_middleware_1.authorize(['admin']), validation_middleware_1.validate(product_validation_1.validateUpdateProductBase), productController.updateProductBase);
router.patch('/:id/status', auth_middleware_1.authenticate, auth_middleware_1.authorize(['admin']), validation_middleware_1.validate(product_validation_1.validateUpdateProductStatus), productController.updateProductStatusController);
router["delete"]('/:id', auth_middleware_1.authenticate, auth_middleware_1.authorize(['admin']), validation_middleware_1.validate(product_validation_1.validateId), productController.deleteProduct);
// --- Vendor Product Routes (Vendor Owner & Store Admin) ---
router.post('/vendor', auth_middleware_1.authenticate, auth_middleware_1.authorize(['vendor', 'store_admin']), validation_middleware_1.validate(product_validation_1.validateCreateVendorProduct), productController.createVendorProduct);
router.post('/vendor/barcode', auth_middleware_1.authenticate, auth_middleware_1.authorize(['vendor', 'store_admin']), validation_middleware_1.validate(product_validation_1.validateCreateVendorProductWithBarcode), productController.createVendorProductWithBarcode);
router.patch('/vendor/:id', auth_middleware_1.authenticate, auth_middleware_1.authorize(['vendor', 'store_admin']), validation_middleware_1.validate(product_validation_1.validateUpdateVendorProduct), productController.updateVendorProduct);
router["delete"]('/vendor/:id', auth_middleware_1.authenticate, auth_middleware_1.authorize(['vendor', 'store_admin']), validation_middleware_1.validate(product_validation_1.validateId), productController.deleteVendorProduct);
// Add this new route
router.get('/vendor/my-products', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.vendor]), productController.getMyVendorProductsController);
router.post('/vendor/transfer', auth_middleware_1.authenticate, auth_middleware_1.authorize([client_1.Role.vendor]), validation_middleware_1.validate(product_validation_1.validateTransferProducts), productController.transferVendorProductsController);
// --- Public/General Product Routes ---
router.get('/', productController.getAllProducts);
router.get('/vendor', validation_middleware_1.validate(product_validation_1.validateGetAllVendorProducts), productController.getAllVendorProducts);
router.get('/vendor/trending', validation_middleware_1.validate(product_validation_1.validateGetTrendingVendorProducts), productController.getTrendingVendorProducts);
router.get('/vendor/:id', validation_middleware_1.validate(product_validation_1.validateGetVendorProductById), productController.getVendorProductById);
router.get('/barcode', validation_middleware_1.validate(product_validation_1.validateGetProductByBarcode), productController.getProductByBarcode);
router.get('/vendor/barcode', validation_middleware_1.validate(product_validation_1.validateGetVendorProductByBarcode), productController.getVendorProductByBarcode);
router.get('/tags/ids', validation_middleware_1.validate(product_validation_1.validateGetProductsByTagIds), productController.getProductsByTagIds);
router.get('/vendor/tags/ids', validation_middleware_1.validate(product_validation_1.validateGetVendorProductsByTagIds), productController.getVendorProductsByTagIds);
router.get('/vendor/category', validation_middleware_1.validate(product_validation_1.validateGetVendorProductsByCategory), productController.getVendorProductsByCategory);
router.get('/user/:userId', auth_middleware_1.authenticate, validation_middleware_1.validate(product_validation_1.validateGetVendorProductsByUser), productController.getVendorProductsByUserController);
exports["default"] = router;
