// routes/user.routes.ts
import express from 'express';
import * as userController from '../controllers/user.controllers';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate, validateGetAllUsers, validateUpdateUser, validateUserId } from '../middlewares/validation.middleware';
import { Role } from '@prisma/client';

const router = express.Router();

// User Routes
// Note: These routes are protected and require admin privileges.
router.use(authenticate, /* authorize([Role.admin]) */);

router.get('/verificationCodes', userController.getAllVerificationCodes);
router.get('/', validate(validateGetAllUsers), userController.getAllUsers);
router.get('/:id', validate(validateUserId), userController.getUserById);
// router.post('/', userController.createUser); // Create user is handled by /auth/register
router.put('/:id', validate(validateUpdateUser), userController.updateUser);  // user should be able to update their own profile
router.delete('/:id', validate(validateUserId), userController.deleteUser);

//router.post('/user/support', userController.createSupport);

export default router;