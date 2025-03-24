import { Router } from 'express';
import usersRouter from './users.routes';
import authRouter from './auth.routes';

// Create a new Router instance
const router = Router();

// Mount the routers
router.use('/api/v1/auth', authRouter);
router.use('/api/v1/users', usersRouter);

export default router;