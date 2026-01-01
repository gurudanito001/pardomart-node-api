import { Router } from 'express';
import authRouter from './auth.routes';
import usersRouter from './user.routes';
import vendorRouter from './vendor.routes';
import vendorOpeningHoursRouter from './vendorOpeningHours.routes';
import productRouter from './product.routes';
import categoryRouter from './category.routes'
import tagRouter from './tag.routes';
import generalSearchRouter from './generalSearch.routes'
import cartRouter from './cart.routes';
import cartItemRouter from './cartItem.routes';
import orderRouter from './order.routes';
import feeRouter from './fee.routes';
import deliveryAddressRouter from './deliveryAddress.routes';
import ratingRouter from './rating.routes';
import wishlistRouter from './wishlist.routes';
import deviceRouter from './device.routes';
import notificationRouter from './notification.routes';
import walletRoutes from './wallet.routes';
import supportRoutes from './support.routes';
import transactionRoutes from './transaction.routes';
import bugReportRoutes from './bugReport.routes';
import healthRouter from './health.routes';
import faqRouter from './faq.routes';
import mediaRouter from './media.routes';
import contentRouter from './content.routes';
import staffRoutes from './staff.routes';
import customerRoutes from './customer.routes'; // This line was already present
import earningsRoutes from './earnings.routes';
import deliveryPersonRoutes from './delivery-person.routes';
import adRoutes from './ad.routes';
import announcementRoutes from './announcement.routes';
import errorLogRoutes from './errorLog.routes';

// Create a new Router instance
const router = Router();

// Mount the routers
router.use('/health', healthRouter); // For server wake-up calls

router.use('/api/v1/auth', authRouter);
router.use('/api/v1/users', usersRouter); // This now includes the new /api/v1/users/all route
router.use('/api/v1/vendors', vendorRouter);
router.use('/api/v1/openingHours', vendorOpeningHoursRouter);
router.use('/api/v1/product', productRouter);
router.use('/api/v1/category', categoryRouter);
router.use('/api/v1/tags', tagRouter);
router.use('/api/v1/generalSearch', generalSearchRouter);
router.use('/api/v1/cart-items', cartItemRouter); 
router.use('/api/v1/cart', cartRouter);
router.use('/api/v1/order', orderRouter);
router.use('/api/v1/fees', feeRouter);
router.use('/api/v1/deliveryAddress', deliveryAddressRouter);
router.use('/api/v1/ratings', ratingRouter);
router.use('/api/v1/wishlist', wishlistRouter);
router.use('/api/v1/devices', deviceRouter);
router.use('/api/v1/notifications', notificationRouter);
router.use('/api/v1/wallet', walletRoutes);
router.use('/api/v1/support', supportRoutes);
router.use('/api/v1/transactions', transactionRoutes); // This path is correct, now pointing to the new routes file
router.use('/api/v1/bug-reports', bugReportRoutes);
router.use('/api/v1/faqs', faqRouter);
router.use('/api/v1/content', contentRouter);
router.use('/api/v1/media', mediaRouter);
router.use('/api/v1/staff', staffRoutes);
router.use('/api/v1/customers', customerRoutes);
router.use('/api/v1/earnings', earningsRoutes);
router.use('/api/v1/delivery-persons', deliveryPersonRoutes);
router.use('/api/v1/ads', adRoutes);
router.use('/api/v1/announcements', announcementRoutes);
router.use('/api/v1/errors', errorLogRoutes);





export default router;