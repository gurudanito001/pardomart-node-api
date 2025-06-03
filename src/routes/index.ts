import { Router } from 'express';
import authRouter from './auth.routes';
import usersRouter from './user.routes';
import vendorRouter from './vendor.routes';
import vendorOpeningHoursRouter from './vendorOpeningHours.routes';
import productRouter from './product.routes';
import categoryRouter from './category.routes'
import tagRouter from './tag.routes';
import generalSearchRouter from './generalSearch.routes'
import cartItemRouter from './cartItem.routes';
import orderRouter from './order.routes';
import feeRouter from './fee.routes';
import deliveryAddress from './deliveryAddress.routes';

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
router.use('/api/v1/generalSearch', generalSearchRouter);
router.use('/api/v1/cartItem', cartItemRouter);
router.use('/api/v1/order', orderRouter);
router.use('/api/v1/fees', feeRouter);
router.use('/api/v1/deliveryAddress', deliveryAddress);

export default router;