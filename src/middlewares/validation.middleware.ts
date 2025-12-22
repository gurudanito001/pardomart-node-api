// middlewares/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, body, param, query } from 'express-validator';
import { ContentType } from '@prisma/client';
import {
  Days,
  Role,
  PaymentMethods,
  ShoppingMethod,
  DeliveryMethod,
  OrderStatus,
  PaymentStatus,
  FeeType,
  FeeCalculationMethod,
  NotificationType,
  OrderItemStatus,
  TicketCategory,
  TicketStatus,
} from '@prisma/client';

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
    .if(body('role').equals(Role.store_shopper))
    .isUUID(4).withMessage('A valid vendorId is required for store_shopper role.'),
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
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('tagline').optional({ checkFalsy: true }).isString().withMessage('Tagline must be a string'),
  body('details').optional({ checkFalsy: true }).isString().withMessage('Details must be a string'),
  body('image')
    .optional({ checkFalsy: true })
    .custom((value) => {
      // This regex checks for an optional data URI prefix followed by a valid base64 string.
      const base64Regex = /^(data:image\/[a-zA-Z]+;base64,)?([A-Za-z0-9+/]+={0,2})$/;
      return base64Regex.test(value);
    })
    .withMessage('Image must be a valid base64 string, optionally with a data URI prefix.'),
  body('address').optional({ checkFalsy: true }).isString().withMessage('Address must be a string'),
  body('longitude').optional({ checkFalsy: true }).isFloat().withMessage('Longitude must be a number'),
  body('latitude').optional({ checkFalsy: true }).isFloat().withMessage('Latitude must be a number'),
  body('meta').optional({ checkFalsy: true }).isObject().withMessage('Meta must be an object'),
];

export const validateVendorId = [param('id').isUUID(4).withMessage('A valid vendor ID is required in the URL.')];

export const validateGetVendorById = [
  param('id').isUUID(4).withMessage('A valid vendor ID is required in the URL.'),
  query('latitude').optional().isFloat().withMessage('Latitude must be a valid number.'),
  query('longitude').optional().isFloat().withMessage('Longitude must be a valid number.'),
];

export const validateGetAllVendors = [
  query('name').optional().isString().withMessage('Name must be a string.'),
  query('latitude').optional().isFloat().withMessage('Latitude must be a valid number.'),
  query('longitude').optional().isFloat().withMessage('Longitude must be a valid number.'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('size').optional().isInt({ min: 1, max: 100 }).withMessage('Size must be an integer between 1 and 100.'),
];

export const validateUpdateVendor = [
  param('id').isUUID(4).withMessage('A valid vendor ID is required in the URL.'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.'),
  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('tagline').optional({ checkFalsy: true }).isString().withMessage('Tagline must be a string'),
  body('details').optional({ checkFalsy: true }).isString().withMessage('Details must be a string'),
  body('image')
    .optional({ checkFalsy: true })
    .custom((value) => {
      // This regex checks for an optional data URI prefix followed by a valid base64 string.
      const base64Regex = /^(data:image\/[a-zA-Z]+;base64,)?([A-Za-z0-9+/]+={0,2})$/;
      return base64Regex.test(value);
    })
    .withMessage('Image must be a valid base64 string, optionally with a data URI prefix.'),
  body('address').optional({ checkFalsy: true }).isString().withMessage('Address must be a string'),
  body('longitude').optional({ checkFalsy: true }).isFloat().withMessage('Longitude must be a number'),
  body('latitude').optional({ checkFalsy: true }).isFloat().withMessage('Latitude must be a number'),
  body('isVerified').optional().isBoolean().toBoolean().withMessage('isVerified must be a boolean.'),
  body('meta').optional({ checkFalsy: true }).isJSON().withMessage('Meta must be a valid JSON string.'),
];

export const validateSetVendorAvailability = [
  param('id').isUUID(4).withMessage('A valid vendor ID is required in the URL.'),
  body('available').isBoolean().withMessage('The "available" field must be a boolean.'),
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
  body('categories.*.imageUrl').optional().isString(),
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

export const validateAddToWishlist = [
  body('vendorProductId').isUUID(4).withMessage('A valid vendorProductId is required in the request body.'),
];

export const validateRemoveFromWishlist = [
  param('id').isUUID(4).withMessage('A valid wishlistItemId is required in the URL path.'),
];



export const validateCreateFee = [
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Fee type is required.')
    .isIn(Object.values(FeeType))
    .withMessage(`type must be one of: ${Object.values(FeeType).join(', ')}`),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a non-negative number.'),
  body('method')
    .trim()
    .notEmpty()
    .withMessage('Fee calculation method is required.')
    .isIn(Object.values(FeeCalculationMethod))
    .withMessage(`method must be one of: ${Object.values(FeeCalculationMethod).join(', ')}`),
  body('unit').optional({ nullable: true }).isString().withMessage('unit must be a string.'),
  body('minThreshold').optional({ nullable: true }).isFloat().withMessage('minThreshold must be a number.'),
  body('maxThreshold').optional({ nullable: true }).isFloat().withMessage('maxThreshold must be a number.'),
  body('thresholdAppliesTo').optional({ nullable: true }).isString().withMessage('thresholdAppliesTo must be a string.'),
];

export const validateUpdateFee = [
  param('id').isUUID(4).withMessage('A valid fee ID is required in the URL.'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a non-negative number if provided.'),
  body('method')
    .optional()
    .trim()
    .isIn(Object.values(FeeCalculationMethod))
    .withMessage(`method must be one of: ${Object.values(FeeCalculationMethod).join(', ')}`),
  body('unit').optional({ nullable: true }).isString().withMessage('unit must be a string.'),
  body('minThreshold').optional({ nullable: true }).isFloat().withMessage('minThreshold must be a number.'),
  body('maxThreshold').optional({ nullable: true }).isFloat().withMessage('maxThreshold must be a number.'),
  body('thresholdAppliesTo').optional({ nullable: true }).isString().withMessage('thresholdAppliesTo must be a string.'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean if provided.'),
];

export const validateFeeId = [param('id').isUUID(4).withMessage('A valid fee ID is required in the URL.')];

export const validateFeeType = [
  param('type')
    .trim()
    .notEmpty()
    .withMessage('Fee type is required in the URL.')
    .isIn(Object.values(FeeType))
    .withMessage(`type must be one of: ${Object.values(FeeType).join(', ')}`),
];

export const validateCalculateFees = [
  body('orderItems').isArray({ min: 1 }).withMessage('orderItems array is required and cannot be empty.'),
  body('orderItems.*.vendorProductId').isUUID(4).withMessage('Each order item must have a valid vendorProductId.'),
  body('orderItems.*.quantity').isInt({ gt: 0 }).withMessage('Each order item must have a positive integer quantity.'),
  body('vendorId').isUUID(4).withMessage('A valid vendorId is required.'),
  body('deliveryAddressId').isUUID(4).withMessage('A valid deliveryAddressId is required.'),
];

export const validateGeneralSearch = [
  query('search').trim().notEmpty().withMessage('The "search" query parameter is required.'),
  query('latitude').isFloat().toFloat().withMessage('A valid "latitude" query parameter is required.'),
  query('longitude').isFloat().toFloat().withMessage('A valid "longitude" query parameter is required.'),
];

export const validateSearchStoreProducts = [
  param('storeId').isUUID(4).withMessage('A valid storeId is required in the URL path.'),
  query('searchTerm').optional().isString().withMessage('searchTerm must be a string if provided.'),
  query('categoryId').optional().isUUID(4).withMessage('categoryId must be a valid UUID if provided.'),
];

export const validateSearchByCategoryId = [
  param('categoryId').isUUID(4).withMessage('A valid categoryId is required in the URL path.'),
  query('latitude').isFloat().toFloat().withMessage('A valid "latitude" query parameter is required.'),
  query('longitude').isFloat().toFloat().withMessage('A valid "longitude" query parameter is required.'),
];

export const validateGetAllUsers = [
  query('mobileVerified').optional().isBoolean().toBoolean().withMessage('mobileVerified must be a boolean.'),
  query('active').optional().isBoolean().toBoolean().withMessage('active must be a boolean.'),
  query('role').optional().isIn(Object.values(Role)).withMessage(`Role must be one of: ${Object.values(Role).join(', ')}`),
  query('language').optional().isString().withMessage('language must be a string.'),
  query('page').optional().isInt({ min: 1 }).toInt().withMessage('page must be a positive integer.'),
  query('size').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('size must be an integer between 1 and 100.'),
];

export const validateUserId = [param('id').isUUID(4).withMessage('A valid user ID is required in the URL.')];

export const validateUpdateUser = [
  param('id').isUUID(4).withMessage('A valid user ID is required in the URL.'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty if provided.'),
  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail().withMessage('A valid email is required if provided.'),
  body('mobileNumber')
    .optional()
    .isMobilePhone('any', { strictMode: true })
    .withMessage('A valid E.164 mobile number is required if provided (e.g., +1234567890).'),
  body('role').optional().isIn(Object.values(Role)).withMessage(`Role must be one of: ${Object.values(Role).join(', ')}`),
  body('mobileVerified').optional().isBoolean().withMessage('mobileVerified must be a boolean if provided.'),
  body('active').optional().isBoolean().withMessage('active must be a boolean if provided.'),
  body('language').optional().isString().withMessage('language must be a string if provided.'),
  body('notification').optional().isObject().withMessage('notification must be an object if provided.'),
];

export const validateAddLocation = [
  param('orderId').isUUID(4).withMessage('A valid order ID is required in the URL.'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('A valid latitude is required.'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('A valid longitude is required.'),
];

export const validateGetPath = [param('orderId').isUUID(4).withMessage('A valid order ID is required in the URL.')];

// --- Messaging Validation ---
export const validateSendMessage = [
  param('orderId').isUUID(4).withMessage('A valid orderId is required in the URL.'),
  body('recipientId').isUUID(4).withMessage('A valid recipientId is required.'),
  body('content').trim().notEmpty().withMessage('Message content cannot be empty.'),
];

export const validateMarkMessagesAsRead = [
  param('orderId').isUUID(4).withMessage('A valid orderId is required in the URL.'),
];

// --- Live Shopping Validation ---
export const validateUpdateOrderItemShoppingStatus = [
  param('orderId').isUUID(4).withMessage('A valid orderId is required.'),
  param('itemId').isUUID(4).withMessage('A valid itemId is required.'),
  body('status').isIn(Object.values(OrderItemStatus)).withMessage(`Status must be one of: ${Object.values(OrderItemStatus).join(', ')}`),
  body('quantityFound').optional().isInt({ min: 0 }).withMessage('quantityFound must be a non-negative integer.'),
  body('chosenReplacementId').optional({ nullable: true }).isUUID(4).withMessage('chosenReplacementId must be a valid UUID.'),
  body().custom((value, { req }) => {
    if (req.body.status === 'FOUND' && req.body.quantityFound === undefined) {
      throw new Error('quantityFound is required when status is FOUND.');
    }
    return true;
  }),
];

export const validateRespondToReplacement = [
  param('orderId').isUUID(4).withMessage('A valid orderId is required.'),
  param('itemId').isUUID(4).withMessage('A valid itemId is required.'),
  body('approved').isBoolean().withMessage('approved must be a boolean.'),
];

// --- Support Ticket Validation ---
export const validateCreateSupportTicket = [
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('description').trim().notEmpty().withMessage('Description is required.'),
  body('category').isIn(Object.values(TicketCategory)).withMessage(`Category must be one of: ${Object.values(TicketCategory).join(', ')}`),
  body('meta').optional({ nullable: true }).isObject().withMessage('Meta must be an object.'),
];

export const validateUpdateSupportTicketStatus = [
  param('ticketId').isUUID(4).withMessage('A valid ticketId is required in the URL.'),
  body('status').isIn(Object.values(TicketStatus)).withMessage(`Status must be one of: ${Object.values(TicketStatus).join(', ')}`),
];

// --- Payment Validation ---
export const validateDetachPaymentMethod = [
  param('paymentMethodId').isString().notEmpty().withMessage('A valid paymentMethodId is required in the URL.'),
];

// --- Device Validation ---
export const validateRegisterDevice = [
  body('fcmToken').isString().notEmpty().withMessage('fcmToken is required.'),
  body('platform').isIn(['ios', 'android', 'web']).withMessage('Platform must be ios, android, or web.'),
];

export const validateUnregisterDevice = [param('fcmToken').isString().notEmpty().withMessage('fcmToken is required in path.')];

// --- Notification Validation ---
export const validateGetNotifications = [
  query('page').optional().isInt({ min: 1 }).toInt().withMessage('Page must be a positive integer.'),
  query('size').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('Size must be an integer between 1 and 100.'),
];

export const validateNotificationId = [
  param('notificationId').isUUID(4).withMessage('A valid notification ID is required in the URL.'),
];

export const validateUpdateBugReportStatus = [
  param('id').isUUID(4).withMessage('A valid bug report ID is required in the URL.'),
  body('isResolved').isBoolean().withMessage('isResolved must be a boolean value.'),
];

// --- FAQ Validation ---

export const validateCreateFaq = [
  body('question').trim().notEmpty().withMessage('Question is required.'),
  body('answer').trim().notEmpty().withMessage('Answer is required.'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean.'),
  body('sortOrder').optional().isInt().withMessage('sortOrder must be an integer.'),
];

export const validateUpdateFaq = [
  param('id').isUUID().withMessage('A valid FAQ ID is required in the URL path.'),
  body('question').optional().trim().notEmpty().withMessage('Question cannot be empty.'),
  body('answer').optional().trim().notEmpty().withMessage('Answer cannot be empty.'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean.'),
  body('sortOrder').optional().isInt().withMessage('sortOrder must be an integer.'),
];

export const validateFaqId = [param('id').isUUID().withMessage('A valid FAQ ID is required in the URL path.')];



export const validateContentType: ValidationChain[] = [
  param('type')
    .isIn(Object.values(ContentType))
    .withMessage(`Invalid content type. Must be one of: ${Object.values(ContentType).join(', ')}`),
];

export const validateUpdateContent: ValidationChain[] = [
  param('type')
    .isIn(Object.values(ContentType))
    .withMessage(`Invalid content type. Must be one of: ${Object.values(ContentType).join(', ')}`),
  body('content')
    .isString()
    .withMessage('Content must be a string.')
    .notEmpty()
    .withMessage('Content cannot be empty.')
    .trim(),
];
