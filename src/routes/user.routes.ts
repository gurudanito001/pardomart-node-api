// routes/user.routes.ts
import express from 'express';
import * as userController from '../controllers/user.controllers';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate, validateGetAllUsers, validateUpdateUser, validateUserId } from '../middlewares/validation.middleware';
import { Role } from '@prisma/client';

const router = express.Router();

// Public route to get all users without authentication
// GET /users/all
router.get('/all', userController.getAllUsers);

// User Routes
// Note: These routes are protected and require admin privileges.
router.use(authenticate, /* authorize([Role.admin]) */);

// Admin Management Routes
router.get('/admin/stats', authorize([Role.admin]), userController.getAdminStats);
router.get('/admin/export', authorize([Role.admin]), userController.exportAdmins);

router.get('/verificationCodes', userController.getAllVerificationCodes);
router.get('/', validate(validateGetAllUsers), userController.getAllUsers);
router.get('/:id', validate(validateUserId), userController.getUserById);
// router.post('/', userController.createUser); // Create user is handled by /auth/register
router.put('/update', validate(validateUpdateUser), userController.updateUser);  // user should be able to update their own profile
router.delete('/:id', validate(validateUserId), userController.deleteUser);

//router.post('/user/support', userController.createSupport);

export default router;