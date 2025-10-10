import { body, param, query } from 'express-validator';

export const validateId = [
    param('id').isUUID(4).withMessage('A valid ID is required in the URL path.'),
];

export const validateCreateProduct = [
  body('barcode').trim().notEmpty().withMessage('Barcode is required.'),
  body('name').trim().notEmpty().withMessage('Product name is required.'),
  body('description').optional().isString(),
  body('images').optional().isArray().withMessage('Images must be an array of strings.'),
  body('images.*').optional().isURL().withMessage('Each image must be a valid URL.'),
  body('categoryIds').isArray({ min: 1 }).withMessage('At least one categoryId is required.'),
  body('categoryIds.*').isUUID(4).withMessage('Each categoryId must be a valid UUID.'),
  body('tagIds').optional().isArray().withMessage('tagIds must be an array.'),
  body('tagIds.*').isUUID(4).withMessage('Each tagId must be a valid UUID.'),
  body('isAlcohol').optional().isBoolean(),
  body('isAgeRestricted').optional().isBoolean(),
];

export const validateUpdateProductBase = [
  param('id').isUUID(4).withMessage('A valid product ID is required in the URL.'),
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty.'),
  body('description').optional().isString(),
  body('images').optional().isArray().withMessage('Images must be an array of strings.'),
  body('images.*').optional().isURL().withMessage('Each image must be a valid URL.'),
  body('categoryIds').optional().isArray({ min: 1 }).withMessage('categoryIds must be a non-empty array if provided.'),
  body('categoryIds.*').isUUID(4).withMessage('Each categoryId must be a valid UUID.'),
  body('tagIds').optional().isArray().withMessage('tagIds must be an array.'),
  body('tagIds.*').isUUID(4).withMessage('Each tagId must be a valid UUID.'),
];

export const validateCreateVendorProduct = [
  body('vendorId').isUUID(4).withMessage('A valid vendorId is required.'),
  body('productId').isUUID(4).withMessage('A valid productId is required.'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number.'),
  body('name').trim().notEmpty().withMessage('Product name is required.'),
  body('description').optional().isString(),
  body('discountedPrice').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Discounted price must be a non-negative number.'),
  body('isAvailable').optional().isBoolean(),
  body('categoryIds').isArray({ min: 1 }).withMessage('At least one categoryId is required.'),
  body('categoryIds.*').isUUID(4).withMessage('Each categoryId must be a valid UUID.'),
  body('tagIds').optional().isArray().withMessage('tagIds must be an array.'),
  body('tagIds.*').isUUID(4).withMessage('Each tagId must be a valid UUID.'),
];

export const validateUpdateVendorProduct = [
  param('id').isUUID(4).withMessage('A valid vendor product ID is required in the URL.'),
  body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be a positive number.'),
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty.'),
  body('isAvailable').optional().isBoolean(),
  body('discountedPrice').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Discounted price must be a non-negative number.'),
];

export const validateGetVendorProductById = [
    param('id').isUUID(4).withMessage('A valid vendor product ID is required in the URL path.'),
];

export const validateGetAllVendorProducts = [
  query('vendorId').optional().isUUID(4).withMessage('Vendor id must be a valid UUID.'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('size').optional().isInt({ min: 1, max: 100 }).withMessage('Size must be between 1 and 100.'),
  query('name').optional().isString(),
  query('productId').optional().isUUID(4).withMessage('Product id must be a valid UUID.'),
  query('categoryIds').optional().isArray().withMessage('categoryIds must be an array.'),
  query('categoryIds.*').isUUID(4).withMessage('Each categoryId must be a valid UUID.'),
  query('tagIds').optional().isArray().withMessage('tagIds must be an array.'),
  query('tagIds.*').isUUID(4).withMessage('Each tagId must be a valid UUID.'),
];

export const validateGetTrendingVendorProducts = [
  query('vendorId').optional().isUUID(4).withMessage('A valid vendorId is required.'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('size').optional().isInt({ min: 1, max: 100 }).withMessage('Size must be between 1 and 100.'),
];

export const validateCreateVendorProductWithBarcode = [
  body('vendorId').isUUID(4).withMessage('A valid vendorId is required.'),
  body('barcode').trim().notEmpty().withMessage('Barcode is required.'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number.'),
  body('name').trim().notEmpty().withMessage('Product name is required.'),
  body('categoryIds').isArray({ min: 1 }).withMessage('At least one categoryId is required.'),
  body('categoryIds.*').isUUID(4).withMessage('Each categoryId must be a valid UUID.'),
  body('description').optional().isString(),
  body('discountedPrice').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Discounted price must be a non-negative number.'),
  body('isAvailable').optional().isBoolean(),
];

export const validateGetProductByBarcode = [
  query('barcode').trim().notEmpty().withMessage('Barcode is required.'),
];

export const validateGetVendorProductByBarcode = [
  query('vendorId').isUUID(4).withMessage('A valid vendorId is required.'),
  query('barcode').trim().notEmpty().withMessage('Barcode is required.'),
];

export const validateGetProductsByTagIds = [
  query('tagIds').notEmpty().withMessage('tagIds query parameter is required.').isArray().withMessage('tagIds must be an array.'),
  query('tagIds.*').isUUID(4).withMessage('Each tagId must be a valid UUID.'),
];

export const validateGetVendorProductsByTagIds = [
  query('tagIds').notEmpty().withMessage('tagIds query parameter is required.').isArray().withMessage('tagIds must be an array.'),
  query('tagIds.*').isUUID(4).withMessage('Each tagId must be a valid UUID.'),
];

export const validateGetVendorProductsByCategory = [
  query('vendorId').isUUID(4).withMessage('A valid vendorId is required.'),
  query('categoryId').isUUID(4).withMessage('A valid categoryId is required.'),
];

export const validateGetVendorProductsByUser = [
    param('userId').isUUID(4).withMessage('A valid user ID is required in the URL path.'),
];