// middlewares/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, body, param, query } from 'express-validator';
import { Days, Role } from '@prisma/client';

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
// Add more validation chains as needed