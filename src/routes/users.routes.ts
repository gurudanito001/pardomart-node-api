// routes/user.routes.ts
import express from 'express';
import * as userController from '../controllers/users.controllers'; 


const router = express.Router();

// User Routes

router.get('/verificationCodes', userController.getAllVerificationCodes);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

//router.post('/user/support', userController.createSupport);

export default router;