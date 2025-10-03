"use strict";
exports.__esModule = true;
var express_1 = require("express");
var paymentController = require("../controllers/payment.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var validation_middleware_1 = require("../middlewares/validation.middleware");
var router = express_1.Router();
// The webhook needs to receive the raw request body for signature verification
router.post('/stripe-webhook', express_1.raw({ type: 'application/json' }), paymentController.stripeWebhookController);
router.use(auth_middleware_1.authenticate);
router.post('/create-payment-intent', paymentController.createPaymentIntentController);
router.get('/me', paymentController.listMyPaymentsController);
router.get('/vendor', paymentController.listVendorPaymentsController);
router.post('/setup-intent', paymentController.createSetupIntentController);
router.get('/me/payment-methods', paymentController.listMySavedPaymentMethodsController);
router["delete"]('/me/payment-methods/:paymentMethodId', validation_middleware_1.validate(validation_middleware_1.validateDetachPaymentMethod), paymentController.detachPaymentMethodController);
exports["default"] = router;
