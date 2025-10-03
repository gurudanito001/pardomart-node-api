import { Router, raw } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate, validateDetachPaymentMethod } from '../middlewares/validation.middleware';

const router = Router();

// The webhook needs to receive the raw request body for signature verification
router.post(
  '/stripe-webhook',
  raw({ type: 'application/json' }),
  paymentController.stripeWebhookController
);

router.use(authenticate);

router.post('/create-payment-intent', paymentController.createPaymentIntentController);
router.get('/me', paymentController.listMyPaymentsController);
router.get('/vendor', paymentController.listVendorPaymentsController);
router.post('/setup-intent', paymentController.createSetupIntentController);
router.get('/me/payment-methods', paymentController.listMySavedPaymentMethodsController);
router.delete(
  '/me/payment-methods/:paymentMethodId',
  validate(validateDetachPaymentMethod),
  paymentController.detachPaymentMethodController
);

export default router;