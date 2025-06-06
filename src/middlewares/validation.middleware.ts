// middlewares/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, check, param, body } from 'express-validator';
import { Days } from '@prisma/client';

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
  check('name').notEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('Invalid email format'),
  check('mobileNumber').notEmpty().withMessage('Mobile number is required'),
  check('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['customer', 'vendor', 'delivery', 'admin'])
    .withMessage('Role must be one of: customer, vendor, delivery, or admin'),
];

export const validateLogin = [
  check('mobileNumber').notEmpty().withMessage('Mobile number is required'),
  check('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['customer', 'vendor', 'delivery', 'admin'])
    .withMessage('Role must be one of: customer, vendor, delivery, or admin'),
];

export const validateResendVerification = [
  check('mobileNumber').notEmpty().withMessage('Mobile number is required'),
];

export const validateVerifyAndLogin = [
  check('mobileNumber').notEmpty().withMessage('Mobile number is required'),
  check('verificationCode').notEmpty().withMessage('Verification code is required'),
  check('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['customer', 'vendor', 'delivery', 'admin'])
    .withMessage('Role must be one of: customer, vendor, delivery, or admin'),
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

// Add more validation chains as needed