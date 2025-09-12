"use strict";
exports.__esModule = true;
// routes/product.routes.ts
var express_1 = require("express");
var validation_middleware_1 = require("../middlewares/validation.middleware");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var product_controllers_1 = require("../controllers/product.controllers");
var router = express_1["default"].Router();
// Public routes
router.get('/', validation_middleware_1.validate(validation_middleware_1.validateGetAllProducts), product_controllers_1.getAllProducts);
router.get('/vendor', validation_middleware_1.validate(validation_middleware_1.validateGetAllVendorProducts), product_controllers_1.getAllVendorProducts);
router.get('/vendor/trending', validation_middleware_1.validate(validation_middleware_1.validateGetTrendingVendorProducts), product_controllers_1.getTrendingVendorProducts);
router.get('/barcode', validation_middleware_1.validate(validation_middleware_1.validateGetProductByBarcode), product_controllers_1.getProductByBarcode);
router.get('/vendor/barcode', validation_middleware_1.validate(validation_middleware_1.validateGetVendorProductByBarcode), product_controllers_1.getVendorProductByBarcode);
router.get('/vendor/category', validation_middleware_1.validate(validation_middleware_1.validateGetVendorProductsByCategory), product_controllers_1.getVendorProductsByCategory);
router.get('/vendor/:id', validation_middleware_1.validate(validation_middleware_1.validateGetOrDeleteProduct), product_controllers_1.getVendorProductById);
router.get('/tags/ids', validation_middleware_1.validate(validation_middleware_1.validateGetProductsByTagIds), product_controllers_1.getProductsByTagIds);
router.get('/vendor/tags/ids', validation_middleware_1.validate(validation_middleware_1.validateGetVendorProductsByTagIds), product_controllers_1.getVendorProductsByTagIds);
// Protected routes (assuming admin/vendor roles)
router.post('/', auth_middleware_1.authenticate, /* authorize(['admin']), */ validation_middleware_1.validate(validation_middleware_1.validateCreateProduct), product_controllers_1.createProduct);
router.post('/vendor', auth_middleware_1.authenticate, auth_middleware_1.authorizeVendorAccess, validation_middleware_1.validate(validation_middleware_1.validateCreateVendorProduct), product_controllers_1.createVendorProduct);
router.post('/vendor/barcode', auth_middleware_1.authenticate, auth_middleware_1.authorizeVendorAccess, validation_middleware_1.validate(validation_middleware_1.validateCreateVendorProductWithBarcode), product_controllers_1.createVendorProductWithBarcode);
router.patch('/:id', auth_middleware_1.authenticate, /* authorize(['admin']), */ validation_middleware_1.validate(validation_middleware_1.validateUpdateProduct), product_controllers_1.updateProductBase);
router.patch('/vendor/:id', auth_middleware_1.authenticate, auth_middleware_1.authorizeVendorAccess, validation_middleware_1.validate(validation_middleware_1.validateUpdateVendorProduct), product_controllers_1.updateVendorProduct);
router["delete"]('/:id', auth_middleware_1.authenticate, /* authorize(['admin']), */ validation_middleware_1.validate(validation_middleware_1.validateGetOrDeleteProduct), product_controllers_1.deleteProduct);
router["delete"]('/vendor/:id', auth_middleware_1.authenticate, auth_middleware_1.authorizeVendorAccess, validation_middleware_1.validate(validation_middleware_1.validateGetOrDeleteProduct), product_controllers_1.deleteVendorProduct);
exports["default"] = router;
