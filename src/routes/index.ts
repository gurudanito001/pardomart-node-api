import { Router } from 'express';
import authRouter from './auth.routes';
import usersRouter from './users.routes';
import vendorRouter from './vendor.routes';
import vendorOpeningHours from './vendorOpeningHours.routes'

// Create a new Router instance
const router = Router();

// Mount the routers
router.use('/api/v1/auth', authRouter);
router.use('/api/v1/users', usersRouter);
router.use('/api/v1/vendors', vendorRouter);
router.use('/api/v1/openingHours', vendorOpeningHours);

export default router;