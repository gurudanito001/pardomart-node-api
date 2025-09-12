// middlewares/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, body, param, query } from 'express-validator';
import { Days, Role, PaymentMethods, ShoppingMethod, DeliveryMethod, OrderStatus, PaymentStatus } from '@prisma/client';

// Generic validation middleware
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

// Example validation chains for specific endpoints
export const validateRegisterUser = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required.'),
  body('mobileNumber').isMobilePhone('any', { strictMode: true }).withMessage('A valid E.164 mobile number is required (e.g., +1234567890).'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(Object.values(Role))
    .withMessage(`Role must be one of: ${Object.values(Role).join(', ')}`),
  body('vendorId')
    .if(body('role').equals(Role.vendor_staff))
    .isUUID(4).withMessage('A valid vendorId is required for vendor_staff role.'),
];

export const validateLogin = [
  body('mobileNumber').isMobilePhone('any', { strictMode: true }).withMessage('A valid E.164 mobile number is required (e.g., +1234567890).'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(Object.values(Role))
    .withMessage(`Role must be one of: ${Object.values(Role).join(', ')}`),
];

export const validateVerifyAndLogin = [
  body('mobileNumber').isMobilePhone('any', { strictMode: true }).withMessage('A valid E.164 mobile number is required (e.g., +1234567890).'),
  body('verificationCode').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits.').isNumeric().withMessage('Verification code must be numeric.'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(Object.values(Role))
    .withMessage(`Role must be one of: ${Object.values(Role).join(', ')}`),
];

export const validateCreateVendor = [
  //body('userId').notEmpty().withMessage('User ID is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('tagline').optional().isString().withMessage('Tagline must be a string'),
  body('details').optional().isString().withMessage('Details must be a string'),
  body('image').optional().isString().withMessage('Image must be a string'),
  body('address').optional().isString().withMessage('Address must be a string'),
  body('longitude').optional().isNumeric().withMessage('Longitude must be a number'),
  body('latitude').optional().isNumeric().withMessage('Latitude must be a number'),
  body('meta').optional().isObject().withMessage('Meta must be an object'),
  body('categories').optional().isArray().withMessage('Categories must be an array'),
];

export const validateCreateOrUpdateVendorOpeningHours = [
  body('vendorId').notEmpty().withMessage('Vendor ID is required'),
  body('day')
    .notEmpty()
    .withMessage('Day is required')
    .isIn(Object.values(Days))
    .withMessage(`Day must be one of: ${Object.values(Days).join(', ')}`),
  body('open')
    .optional()
    .custom((value) => {
      if (value === null || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
        return true;
      }
      throw new Error('Open time must be in HH:MM format or null');
    }),
  body('close')
    .optional()
    .custom((value) => {
      if (value === null || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
        return true;
      }
      throw new Error('Close time must be in HH:MM format or null');
    }),
  body('id').optional().isUUID().withMessage('Id must be a valid UUID'),
];

export const validateCreateCategory = [
  body('name').trim().notEmpty().withMessage('Category name is required.'),
  body('description').optional().isString(),
  body('parentId').optional({ nullable: true }).isUUID(4).withMessage('Parent ID must be a valid UUID.'),
];

export const validateCreateCategoriesBulk = [
  body('categories').isArray({ min: 1 }).withMessage('Categories must be a non-empty array.'),
  body('categories.*.name').trim().notEmpty().withMessage('Each category must have a name.'),
  body('categories.*.description').optional().isString(),
  body('categories.*.parentId').optional({ nullable: true }).isUUID(4).withMessage('Each parent ID must be a valid UUID.'),
];

export const validateUpdateCategory = [
  param('id').isUUID(4).withMessage('Category ID must be a valid UUID.'),
  body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty.'),
  body('description').optional().isString(),
  body('parentId').optional({ nullable: true }).isUUID(4).withMessage('Parent ID must be a valid UUID.'),
];

export const validateGetOrDeleteCategory = [
  param('id').isUUID(4).withMessage('Category ID must be a valid UUID.'),
];

export const validateGetAllCategories = [
  query('parentId').optional().isUUID(4).withMessage('Parent ID must be a valid UUID.'),
  query('vendorId').optional().isUUID(4).withMessage('Vendor ID must be a valid UUID.'),
  query('type').optional().isIn(['top', 'sub']).withMessage('Type must be either "top" or "sub".'),
  query('name').optional().isString(),
];

export const validateCreateDeliveryAddress = [
  body('label').optional({ nullable: true }).trim().isString().withMessage('Label must be a string.'),
  body('addressLine1').trim().notEmpty().withMessage('addressLine1 is required.'),
  body('addressLine2').optional({ nullable: true }).trim().isString(),
  body('city').trim().notEmpty().withMessage('City is required.'),
  body('state').optional({ nullable: true }).trim().isString(),
  body('postalCode').optional({ nullable: true }).trim().isString(),
  body('country').optional().trim().isString(),
  body('latitude').optional({ nullable: true }).isFloat().withMessage('Latitude must be a valid number.'),
  body('longitude').optional({ nullable: true }).isFloat().withMessage('Longitude must be a valid number.'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean.'),
];

export const validateUpdateDeliveryAddress = [
  param('id').isUUID(4).withMessage('A valid address ID is required in the URL.'),
  body('label').optional({ nullable: true }).trim().isString().withMessage('Label must be a string.'),
  body('addressLine1').optional().trim().notEmpty().withMessage('addressLine1 cannot be empty if provided.'),
  body('addressLine2').optional({ nullable: true }).trim().isString(),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty if provided.'),
  ...validateCreateDeliveryAddress.slice(4), // Reuse remaining optional validators
];

export const validateGetOrDeleteDeliveryAddress = [
  param('id').isUUID(4).withMessage('A valid address ID is required in the URL.'),
];

export const validateCreateOrder = [
  body('vendorId').isUUID(4).withMessage('A valid vendorId is required.'),
  body('paymentMethod').isIn(Object.values(PaymentMethods)).withMessage(`paymentMethod must be one of: ${Object.values(PaymentMethods).join(', ')}`),
  body('shippingAddressId')
    .if(body('deliveryMethod').equals(DeliveryMethod.delivery_person))
    .notEmpty().withMessage('shippingAddressId is required for delivery orders.')
    .isUUID(4).withMessage('shippingAddressId must be a valid UUID.'),
  body('deliveryInstructions').optional().isString().isLength({ max: 500 }).withMessage('Delivery instructions cannot exceed 500 characters.'),
  body('orderItems').isArray({ min: 1 }).withMessage('Order must contain at least one item.'),
  body('orderItems.*.vendorProductId').isUUID(4).withMessage('Each order item must have a valid vendorProductId.'),
  body('orderItems.*.quantity').isInt({ min: 1 }).withMessage('Item quantity must be a positive integer.'),
  body('orderItems.*.instructions').optional().isString().isLength({ max: 500 }).withMessage('Item instructions cannot exceed 500 characters.'),
  body('orderItems.*.replacementIds').optional().isArray({ max: 10 }).withMessage('A maximum of 10 replacement IDs are allowed.'),
  body('orderItems.*.replacementIds.*').isUUID(4).withMessage('Each replacementId must be a valid UUID.'),
  body('shoppingMethod').isIn(Object.values(ShoppingMethod)).withMessage(`shoppingMethod must be one of: ${Object.values(ShoppingMethod).join(', ')}`),
  body('deliveryMethod').isIn(Object.values(DeliveryMethod)).withMessage(`deliveryMethod must be one of: ${Object.values(DeliveryMethod).join(', ')}`),
  body('scheduledDeliveryTime').optional({ nullable: true }).isISO8601().withMessage('scheduledDeliveryTime must be a valid ISO 8601 date.'),
  body('shopperTip').optional().isFloat({ min: 0 }).withMessage('shopperTip must be a non-negative number.'),
  body('deliveryPersonTip').optional().isFloat({ min: 0 }).withMessage('deliveryPersonTip must be a non-negative number.'),
];

export const validateGetOrDeleteOrder = [
  param('id').isUUID(4).withMessage('A valid order ID is required in the URL.'),
];

export const validateUpdateOrderStatus = [
  param('id').isUUID(4).withMessage('A valid order ID is required in the URL.'),
  body('status').isIn(Object.values(OrderStatus)).withMessage(`Status must be one of: ${Object.values(OrderStatus).join(', ')}`),
];

export const validateUpdateOrder = [
  param('id').isUUID(4).withMessage('A valid order ID is required in the URL.'),
  body().custom((value, { req }) => {
    if (Object.keys(req.body).length === 0) {
      throw new Error('At least one field must be provided for update.');
    }
    return true;
  }),
  body('paymentMethod').optional().isIn(Object.values(PaymentMethods)).withMessage(`paymentMethod must be one of: ${Object.values(PaymentMethods).join(', ')}`),
  body('paymentStatus').optional().isIn(Object.values(PaymentStatus)).withMessage(`paymentStatus must be one of: ${Object.values(PaymentStatus).join(', ')}`),
  body('orderStatus').optional().isIn(Object.values(OrderStatus)).withMessage(`orderStatus must be one of: ${Object.values(OrderStatus).join(', ')}`),
  body('deliveryAddressId').optional({ nullable: true }).isUUID(4).withMessage('deliveryAddressId must be a valid UUID.'),
];

export const validateGetVendorOrders = [
  query('status').optional().isIn(Object.values(OrderStatus)).withMessage(`Status must be one of: ${Object.values(OrderStatus).join(', ')}`),
];

export const validateVendorOrderAction = [
  param('orderId').isUUID(4).withMessage('A valid orderId is required in the URL.'),
];

export const validateDeclineOrder = [
  param('orderId').isUUID(4).withMessage('A valid orderId is required in the URL.'),
  body('reason').optional().isString().isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters.'),
];

export const validateGetDeliverySlots = [
  query('vendorId').notEmpty().withMessage('vendorId is required.').isUUID(4).withMessage('vendorId must be a valid UUID.'),
  query('deliveryMethod').notEmpty().withMessage('deliveryMethod is required.').isIn(Object.values(DeliveryMethod)).withMessage(`deliveryMethod must be one of: ${Object.values(DeliveryMethod).join(', ')}`),
];

export const validateUpdateTip = [
  param('orderId').isUUID(4).withMessage('A valid orderId is required in the URL.'),
  body('shopperTip').optional().isFloat({ min: 0 }).withMessage('shopperTip must be a non-negative number.'),
  body('deliveryPersonTip').optional().isFloat({ min: 0 }).withMessage('deliveryPersonTip must be a non-negative number.'),
  body().custom((value, { req }) => {
    if (req.body.shopperTip === undefined && req.body.deliveryPersonTip === undefined) {
      throw new Error('At least one tip amount (shopperTip or deliveryPersonTip) must be provided.');
    }
    return true;
  }),
];

export const validateCreateProduct = [
  body('barcode').trim().notEmpty().withMessage('Barcode is required.'),
  body('name').trim().notEmpty().withMessage('Product name is required.'),
  body('description').optional().isString(),
  body('images').optional().isArray().withMessage('Images must be an array of strings.'),
  body('images.*').optional().isURL().withMessage('Each image must be a valid URL.'),
  body('categoryIds').isArray({ min: 1 }).withMessage('At least one categoryId is required.'),
  body('categoryIds.*').isUUID(4).withMessage('Each categoryId must be a valid UUID.'),
  body('tags').optional().isArray(),
  body('tags.*').optional().isString(),
  body('isAlcohol').optional().isBoolean(),
  body('isAgeRestricted').optional().isBoolean(),
];

export const validateUpdateProduct = [
  param('id').isUUID(4).withMessage('A valid product ID is required in the URL.'),
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty.'),
  body('description').optional().isString(),
  body('images').optional().isArray().withMessage('Images must be an array of strings.'),
  body('images.*').optional().isURL().withMessage('Each image must be a valid URL.'),
  body('categoryIds').optional().isArray({ min: 1 }).withMessage('categoryIds must be a non-empty array if provided.'),
  body('categoryIds.*').isUUID(4).withMessage('Each categoryId must be a valid UUID.'),
];

export const validateCreateVendorProduct = [
  body('vendorId').isUUID(4).withMessage('A valid vendorId is required.'),
  body('productId').isUUID(4).withMessage('A valid productId is required.'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number.'),
  body('name').trim().notEmpty().withMessage('Product name is required.'),
  body('description').optional().isString(),
  body('discountedPrice').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Discounted price must be a non-negative number.'),
  body('stock').optional({ nullable: true }).isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.'),
  body('isAvailable').optional().isBoolean(),
  body('categoryIds').isArray({ min: 1 }).withMessage('At least one categoryId is required.'),
  body('categoryIds.*').isUUID(4).withMessage('Each categoryId must be a valid UUID.'),
];

export const validateUpdateVendorProduct = [
  param('id').isUUID(4).withMessage('A valid vendor product ID is required in the URL.'),
  body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be a positive number.'),
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty.'),
  body('stock').optional({ nullable: true }).isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.'),
  body('isAvailable').optional().isBoolean(),
];

export const validateGetOrDeleteProduct = [
  param('id').isUUID(4).withMessage('A valid product ID is required in the URL.'),
];

export const validateGetAllProducts = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),
  query('search').optional().isString(),
];

export const validateGetProductByBarcode = [
  query('barcode').trim().notEmpty().withMessage('Barcode is required.'),
];

export const validateGetProductsByTagIds = [
  query('tagIds').notEmpty().withMessage('tagIds query parameter is required.').isArray().withMessage('tagIds must be an array.'),
  query('tagIds.*').isUUID(4).withMessage('Each tagId must be a valid UUID.'),
];

export const validateGetAllVendorProducts = [
  query('vendorId').isUUID(4).withMessage('A valid vendorId is required.'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),
  query('search').optional().isString(),
];

export const validateGetTrendingVendorProducts = [
  query('latitude').notEmpty().isFloat().withMessage('Latitude is required and must be a number.'),
  query('longitude').notEmpty().isFloat().withMessage('Longitude is required and must be a number.'),
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
  body('stock').optional({ nullable: true }).isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.'),
  body('isAvailable').optional().isBoolean(),
];

export const validateGetVendorProductByBarcode = [
  query('vendorId').isUUID(4).withMessage('A valid vendorId is required.'),
  query('barcode').trim().notEmpty().withMessage('Barcode is required.'),
];

export const validateGetVendorProductsByCategory = [
  query('vendorId').isUUID(4).withMessage('A valid vendorId is required.'),
  query('categoryId').isUUID(4).withMessage('A valid categoryId is required.'),
];

export const validateGetVendorProductsByTagIds = [
  query('vendorId').isUUID(4).withMessage('A valid vendorId is required.'),
  query('tagIds').notEmpty().withMessage('tagIds query parameter is required.').isArray().withMessage('tagIds must be an array.'),
  query('tagIds.*').isUUID(4).withMessage('Each tagId must be a valid UUID.'),
];
// Add more validation chains as needed