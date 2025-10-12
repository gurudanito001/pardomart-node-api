import { Router, raw } from 'express';
import * as transactionController from '../controllers/transaction.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate, validateDetachPaymentMethod } from '../middlewares/validation.middleware';
import { Role } from '@prisma/client';

const router = Router();

// The webhook needs to receive the raw request body for signature verification
router.post(
  '/stripe-webhook',
  raw({ type: 'application/json' }),
  transactionController.stripeWebhookController
);

router.use(authenticate);
router.get('/', authorize([Role.vendor, Role.store_admin, Role.store_shopper]), transactionController.listTransactionsController);

router.post('/create-payment-intent', transactionController.createPaymentIntentController);
router.get('/me', transactionController.listMyTransactionsController);
router.get('/vendor', transactionController.listVendorTransactionsController);
router.post('/setup-intent', transactionController.createSetupIntentController);
router.get('/me/payment-methods', transactionController.listMySavedPaymentMethodsController);
router.delete(
  '/me/payment-methods/:paymentMethodId',
  validate(validateDetachPaymentMethod),
  transactionController.detachPaymentMethodController
);

export default router;