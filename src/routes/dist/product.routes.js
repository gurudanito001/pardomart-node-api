"use strict";
exports.__esModule = true;
// routes/product.routes.ts
var express_1 = require("express");
var validation_middleware_1 = require("../middlewares/validation.middleware");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var product_controllers_1 = require("../controllers/product.controllers");
var router = express_1["default"].Router();
// Public routes
router.get('/', validation_middleware_1.validate(validation_middleware_1.validateGetAllProducts), product_controllers_1.getAllProductsController);
router.get('/vendor', validation_middleware_1.validate(validation_middleware_1.validateGetAllVendorProducts), product_controllers_1.getAllVendorProductsController);
router.get('/vendor/trending', validation_middleware_1.validate(validation_middleware_1.validateGetTrendingVendorProducts), product_controllers_1.getTrendingVendorProductsController);
router.get('/barcode', validation_middleware_1.validate(validation_middleware_1.validateGetProductByBarcode), product_controllers_1.getProductByBarcodeController);
router.get('/vendor/barcode', validation_middleware_1.validate(validation_middleware_1.validateGetVendorProductByBarcode), product_controllers_1.getVendorProductByBarcodeController);
router.get('/vendor/category', validation_middleware_1.validate(validation_middleware_1.validateGetVendorProductsByCategory), product_controllers_1.getVendorProductsByCategoryController);
router.get('/vendor/:id', validation_middleware_1.validate(validation_middleware_1.validateGetOrDeleteProduct), product_controllers_1.getVendorProductByIdController);
router.get('/tags/ids', validation_middleware_1.validate(validation_middleware_1.validateGetProductsByTagIds), product_controllers_1.getProductsByTagIdsController);
router.get('/vendor/tags/ids', validation_middleware_1.validate(validation_middleware_1.validateGetVendorProductsByTagIds), product_controllers_1.getVendorProductsByTagIdsController);
// Protected routes (assuming admin/vendor roles)
router.post('/', auth_middleware_1.authenticate, /* authorize(['admin']), */ validation_middleware_1.validate(validation_middleware_1.validateCreateProduct), product_controllers_1.createProductController);
router.post('/vendor', auth_middleware_1.authenticate, auth_middleware_1.authorizeVendorAccess, validation_middleware_1.validate(validation_middleware_1.validateCreateVendorProduct), product_controllers_1.createVendorProductController);
router.post('/vendor/barcode', auth_middleware_1.authenticate, auth_middleware_1.authorizeVendorAccess, validation_middleware_1.validate(validation_middleware_1.validateCreateVendorProductWithBarcode), product_controllers_1.createVendorProductWithBarcodeController);
router.patch('/:id', auth_middleware_1.authenticate, /* authorize(['admin']), */ validation_middleware_1.validate(validation_middleware_1.validateUpdateProduct), product_controllers_1.updateProductBaseController);
router.patch('/vendor/:id', auth_middleware_1.authenticate, auth_middleware_1.authorizeVendorAccess, validation_middleware_1.validate(validation_middleware_1.validateUpdateVendorProduct), product_controllers_1.updateVendorProductController);
router["delete"]('/:id', auth_middleware_1.authenticate, /* authorize(['admin']), */ validation_middleware_1.validate(validation_middleware_1.validateGetOrDeleteProduct), product_controllers_1.deleteProductController);
router["delete"]('/vendor/:id', auth_middleware_1.authenticate, auth_middleware_1.authorizeVendorAccess, validation_middleware_1.validate(validation_middleware_1.validateGetOrDeleteProduct), product_controllers_1.deleteVendorProductController);
exports["default"] = router;
