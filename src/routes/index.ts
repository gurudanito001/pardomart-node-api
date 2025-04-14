import { Router } from 'express';
import authRouter from './auth.routes';
import usersRouter from './users.routes';
import vendorRouter from './vendor.routes';
import vendorOpeningHoursRouter from './vendorOpeningHours.routes';
import productRouter from './product.routes';
import categoryRouter from './category.routes'
import tagRouter from './tag.routes';

// Create a new Router instance
const router = Router();

// Mount the routers
router.use('/api/v1/auth', authRouter);
router.use('/api/v1/users', usersRouter);
router.use('/api/v1/vendors', vendorRouter);
router.use('/api/v1/openingHours', vendorOpeningHoursRouter);
router.use('/api/v1/product', productRouter);
router.use('/api/v1/category', categoryRouter);
router.use('/api/v1/tags', tagRouter);

export default router;