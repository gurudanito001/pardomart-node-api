"use strict";
exports.__esModule = true;
exports.validateGetVendorProductsForProduct = exports.validateAdminGetAllProducts = exports.validateTransferProducts = exports.validateGetVendorProductsByUser = exports.validateGetVendorProductsByCategory = exports.validateGetVendorProductsByTagIds = exports.validateGetProductsByTagIds = exports.validateGetVendorProductByBarcode = exports.validateGetProductByBarcode = exports.validateCreateVendorProductWithBarcode = exports.validateGetTrendingVendorProducts = exports.validateGetAllVendorProducts = exports.validateGetVendorProductById = exports.validateUpdateVendorProduct = exports.validateCreateVendorProduct = exports.validateUpdateProductStatus = exports.validateUpdateProductBase = exports.validateCreateProduct = exports.validateId = void 0;
var express_validator_1 = require("express-validator");
exports.validateId = [
    express_validator_1.param('id').isUUID(4).withMessage('A valid ID is required in the URL path.'),
];
exports.validateCreateProduct = [
    express_validator_1.body('barcode').trim().notEmpty().withMessage('Barcode is required.'),
    express_validator_1.body('name').trim().notEmpty().withMessage('Product name is required.'),
    express_validator_1.body('description').optional().isString(),
    express_validator_1.body('images').optional().isArray().withMessage('Images must be an array of strings.'),
    express_validator_1.body('images.*').optional().isURL().withMessage('Each image must be a valid URL.'),
    express_validator_1.body('categoryIds').isArray({ min: 1 }).withMessage('At least one categoryId is required.'),
    express_validator_1.body('categoryIds.*').isUUID(4).withMessage('Each categoryId must be a valid UUID.'),
    express_validator_1.body('tagIds').optional().isArray().withMessage('tagIds must be an array.'),
    express_validator_1.body('tagIds.*').isUUID(4).withMessage('Each tagId must be a valid UUID.'),
    express_validator_1.body('isAlcohol').optional().isBoolean(),
    express_validator_1.body('isAgeRestricted').optional().isBoolean(),
];
exports.validateUpdateProductBase = [
    express_validator_1.param('id').isUUID(4).withMessage('A valid product ID is required in the URL.'),
    express_validator_1.body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty.'),
    express_validator_1.body('description').optional().isString(),
    express_validator_1.body('images').optional().isArray().withMessage('Images must be an array of strings.'),
    express_validator_1.body('images.*').optional().isURL().withMessage('Each image must be a valid URL.'),
    express_validator_1.body('categoryIds').optional().isArray({ min: 1 }).withMessage('categoryIds must be a non-empty array if provided.'),
    express_validator_1.body('categoryIds.*').isUUID(4).withMessage('Each categoryId must be a valid UUID.'),
    express_validator_1.body('tagIds').optional().isArray().withMessage('tagIds must be an array.'),
    express_validator_1.body('tagIds.*').isUUID(4).withMessage('Each tagId must be a valid UUID.'),
];
exports.validateUpdateProductStatus = [
    express_validator_1.param('id').isUUID(4).withMessage('A valid product ID is required in the URL.'),
    express_validator_1.body('isActive').isBoolean().withMessage('isActive must be a boolean value (true or false).'),
];
exports.validateCreateVendorProduct = [
    express_validator_1.body('vendorId').isUUID(4).withMessage('A valid vendorId is required.'),
    express_validator_1.body('productId').isUUID(4).withMessage('A valid productId is required.'),
    express_validator_1.body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number.'),
    express_validator_1.body('name').trim().notEmpty().withMessage('Product name is required.'),
    express_validator_1.body('description').optional().isString(),
    express_validator_1.body('discountedPrice').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Discounted price must be a non-negative number.'),
    express_validator_1.body('isAvailable').optional().isBoolean(),
    express_validator_1.body('categoryIds').isArray({ min: 1 }).withMessage('At least one categoryId is required.'),
    express_validator_1.body('categoryIds.*').isUUID(4).withMessage('Each categoryId must be a valid UUID.'),
    express_validator_1.body('tagIds').optional().isArray().withMessage('tagIds must be an array.'),
    express_validator_1.body('tagIds.*').isUUID(4).withMessage('Each tagId must be a valid UUID.'),
];
exports.validateUpdateVendorProduct = [
    express_validator_1.param('id').isUUID(4).withMessage('A valid vendor product ID is required in the URL.'),
    express_validator_1.body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be a positive number.'),
    express_validator_1.body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty.'),
    express_validator_1.body('isAvailable').optional().isBoolean(),
    express_validator_1.body('discountedPrice').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Discounted price must be a non-negative number.'),
];
exports.validateGetVendorProductById = [
    express_validator_1.param('id').isUUID(4).withMessage('A valid vendor product ID is required in the URL path.'),
];
exports.validateGetAllVendorProducts = [
    express_validator_1.query('vendorId').optional().isUUID(4).withMessage('Vendor id must be a valid UUID.'),
    express_validator_1.query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
    express_validator_1.query('size').optional().isInt({ min: 1, max: 100 }).withMessage('Size must be between 1 and 100.'),
    express_validator_1.query('name').optional().isString(),
    express_validator_1.query('productId').optional().isUUID(4).withMessage('Product id must be a valid UUID.'),
    express_validator_1.query('categoryIds').optional().isArray().withMessage('categoryIds must be an array.'),
    express_validator_1.query('categoryIds.*').isUUID(4).withMessage('Each categoryId must be a valid UUID.'),
    express_validator_1.query('tagIds').optional().isArray().withMessage('tagIds must be an array.'),
    express_validator_1.query('tagIds.*').isUUID(4).withMessage('Each tagId must be a valid UUID.'),
];
exports.validateGetTrendingVendorProducts = [
    express_validator_1.query('vendorId').optional().isUUID(4).withMessage('A valid vendorId is required.'),
    express_validator_1.query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
    express_validator_1.query('size').optional().isInt({ min: 1, max: 100 }).withMessage('Size must be between 1 and 100.'),
];
exports.validateCreateVendorProductWithBarcode = [
    express_validator_1.body('vendorId').isUUID(4).withMessage('A valid vendorId is required.'),
    express_validator_1.body('barcode').trim().notEmpty().withMessage('Barcode is required.'),
    express_validator_1.body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number.'),
    express_validator_1.body('name').trim().notEmpty().withMessage('Product name is required.'),
    express_validator_1.body('categoryIds').isArray({ min: 1 }).withMessage('At least one categoryId is required.'),
    express_validator_1.body('categoryIds.*').isUUID(4).withMessage('Each categoryId must be a valid UUID.'),
    express_validator_1.body('description').optional().isString(),
    express_validator_1.body('discountedPrice').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Discounted price must be a non-negative number.'),
    express_validator_1.body('isAvailable').optional().isBoolean(),
];
exports.validateGetProductByBarcode = [
    express_validator_1.query('barcode').trim().notEmpty().withMessage('Barcode is required.'),
];
exports.validateGetVendorProductByBarcode = [
    express_validator_1.query('vendorId').isUUID(4).withMessage('A valid vendorId is required.'),
    express_validator_1.query('barcode').trim().notEmpty().withMessage('Barcode is required.'),
];
exports.validateGetProductsByTagIds = [
    express_validator_1.query('tagIds').notEmpty().withMessage('tagIds query parameter is required.').isArray().withMessage('tagIds must be an array.'),
    express_validator_1.query('tagIds.*').isUUID(4).withMessage('Each tagId must be a valid UUID.'),
];
exports.validateGetVendorProductsByTagIds = [
    express_validator_1.query('tagIds').notEmpty().withMessage('tagIds query parameter is required.').isArray().withMessage('tagIds must be an array.'),
    express_validator_1.query('tagIds.*').isUUID(4).withMessage('Each tagId must be a valid UUID.'),
];
exports.validateGetVendorProductsByCategory = [
    express_validator_1.query('vendorId').isUUID(4).withMessage('A valid vendorId is required.'),
    express_validator_1.query('categoryId').isUUID(4).withMessage('A valid categoryId is required.'),
];
exports.validateGetVendorProductsByUser = [
    express_validator_1.param('userId').isUUID(4).withMessage('A valid user ID is required in the URL path.'),
];
exports.validateTransferProducts = [
    express_validator_1.body('sourceVendorProductIds')
        .isArray({ min: 1 })
        .withMessage('At least one source product ID is required.'),
    express_validator_1.body('sourceVendorProductIds.*')
        .isUUID(4)
        .withMessage('Each source product ID must be a valid UUID.'),
    express_validator_1.body('targetVendorIds')
        .isArray({ min: 1 })
        .withMessage('At least one target vendor ID is required.'),
    express_validator_1.body('targetVendorIds.*')
        .isUUID(4)
        .withMessage('Each target vendor ID must be a valid UUID.'),
];
exports.validateAdminGetAllProducts = [
    express_validator_1.query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
    express_validator_1.query('size').optional().isInt({ min: 1, max: 100 }).withMessage('Size must be between 1 and 100.'),
    express_validator_1.query('categoryId').optional().isUUID(4).withMessage('Category ID must be a valid UUID.'),
    express_validator_1.query('isAlcohol').optional().isBoolean().withMessage('isAlcohol must be a boolean value (true/false).'),
    express_validator_1.query('isAgeRestricted').optional().isBoolean().withMessage('isAgeRestricted must be a boolean value (true/false).'),
    express_validator_1.query('name').optional().isString().withMessage('Name must be a string.'),
];
exports.validateGetVendorProductsForProduct = [
    express_validator_1.param('productId').isUUID(4).withMessage('Product ID must be a valid UUID.'),
    express_validator_1.query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
    express_validator_1.query('size').optional().isInt({ min: 1, max: 100 }).withMessage('Size must be between 1 and 100.'),
];
