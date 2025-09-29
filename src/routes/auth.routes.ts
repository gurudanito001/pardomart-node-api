import { Router } from 'express';
import * as authController from '../controllers/auth.controllers'; 
import {
  validate,
  validateRegisterUser,
  validateLogin,
  validateVerifyAndLogin,
} from '../middlewares/validation.middleware';
import { smsLimiter } from '../middlewares/rateLimiter.middleware';

// New Router instance
const router = Router();

// Authentication Routes
router.post('/register', /* smsLimiter */ validate(validateRegisterUser), authController.registerUser);
router.get('/time-zones', authController.getTimeZones);
router.post('/initiate-login', /* smsLimiter */ validate(validateLogin), authController.initiateLogin);
router.post('/verify-login', validate(validateVerifyAndLogin), authController.verifyCodeAndLogin);

export default router;