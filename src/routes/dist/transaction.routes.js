"use strict";
exports.__esModule = true;
var express_1 = require("express");
var transactionController = require("../controllers/transaction.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var validation_middleware_1 = require("../middlewares/validation.middleware");
var client_1 = require("@prisma/client");
var router = express_1.Router();
// The webhook needs to receive the raw request body for signature verification
router.post('/stripe-webhook', express_1.raw({ type: 'application/json' }), transactionController.stripeWebhookController);
router.use(auth_middleware_1.authenticate);
// --- Admin-only Transaction Routes ---
router.get('/admin/overview', auth_middleware_1.authorize([client_1.Role.admin]), transactionController.getTransactionOverviewController);
router.get('/admin/all', auth_middleware_1.authorize([client_1.Role.admin]), transactionController.adminListAllTransactionsController);
router.post('/admin/:transactionId/send-receipt', auth_middleware_1.authorize([client_1.Role.admin]), transactionController.sendReceiptController);
router.get('/admin/:transactionId', auth_middleware_1.authorize([client_1.Role.admin]), transactionController.adminGetTransactionByIdController);
router.get('/', auth_middleware_1.authorize([client_1.Role.vendor, client_1.Role.store_admin, client_1.Role.store_shopper]), transactionController.listTransactionsController);
router.post('/create-payment-intent', transactionController.createPaymentIntentController);
router.get('/me', transactionController.listMyTransactionsController);
router.get('/vendor', transactionController.listVendorTransactionsController);
router.post('/setup-intent', transactionController.createSetupIntentController);
router.get('/me/payment-methods', transactionController.listMySavedPaymentMethodsController);
router["delete"]('/me/payment-methods/:paymentMethodId', validation_middleware_1.validate(validation_middleware_1.validateDetachPaymentMethod), transactionController.detachPaymentMethodController);
exports["default"] = router;
