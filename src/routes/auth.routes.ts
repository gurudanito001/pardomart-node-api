import { Router } from 'express';
import * as authController from '../controllers/auth.controllers'; 

// New Router instance
const router = Router();

// Authentication Routes
router.post('/check-existence', authController.checkUserExistence);
router.post('/register', authController.registerUser);
router.post('/resendVerification', authController.resendVerificationCode);
router.post('/register/verify', authController.verifyRegistrationCode);
router.post('/initiateLogin', authController.initiateLogin);
router.post('/verifyLogin', authController.verifyCodeAndLogin);


export default router;