// middlewares/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, check } from 'express-validator';

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
  check('role').notEmpty().withMessage('Role is required'),
];

export const validateLogin = [
  check('mobileNumber').notEmpty().withMessage('Mobile number is required'),
];

export const validateResendVerification = [
  check('mobileNumber').notEmpty().withMessage('Mobile number is required'),
];

export const validateVerifyAndLogin = [
  check('mobileNumber').notEmpty().withMessage('Mobile number is required'),
  check('verificationCode').notEmpty().withMessage('Verification code is required'),
];

export const validateCreateVendor = [
  check('userId').notEmpty().withMessage('UserId is required'),
  check('name').isString().withMessage('Name must be a string'),
  check('tagline').optional().isString().withMessage('Tagline must be a string'),
  check('details').optional().isString().withMessage('Details must be a string'),
  check('image').optional().isString().withMessage('Image must be a string'),
  check('address').optional().isString().withMessage('Address must be a string'),
  check('longitude').optional().isNumeric().withMessage('Longitude must be a number'),
  check('latitude').optional().isNumeric().withMessage('Latitude must be a number'),
  check('meta').optional().isObject().withMessage('Meta must be an object'),
];

// Add more validation chains as needed