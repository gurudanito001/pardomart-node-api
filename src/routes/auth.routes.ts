import { Router } from 'express';
import * as authController from '../controllers/auth.controllers'; 
import { validate, validateRegisterUser, validateLogin, validateVerifyAndLogin, validateResendVerification } from '../middlewares/validation.middleware';


// New Router instance
const router = Router();

// Authentication Routes
router.post('/register', validate(validateRegisterUser), authController.registerUser);
router.post('/resendVerification',validate(validateResendVerification), authController.resendVerificationCode);
router.post('/initiateLogin',validate(validateLogin), authController.initiateLogin);
router.post('/verifyAndLogin',validate(validateVerifyAndLogin), authController.verifyCodeAndLogin);


export default router;