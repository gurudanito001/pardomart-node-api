"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.stripeWebhookController = exports.listMyPaymentsController = exports.detachPaymentMethodController = exports.listMySavedPaymentMethodsController = exports.createSetupIntentController = exports.createPaymentIntentController = void 0;
var payment_service_1 = require("../services/payment.service");
var order_service_1 = require("../services/order.service");
var stripe_1 = require("stripe");
var stripe = new stripe_1["default"](process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil'
});
/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment processing and management
 */
/**
 * @swagger
 * /api/v1/payments/create-payment-intent:
 *   post:
 *     summary: Create a Payment Intent for an order
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId]
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Payment Intent created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret:
 *                   type: string
 *       400:
 *         description: Bad Request (e.g., order already paid).
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Order or User not found.
 * components:
 *   schemas:
 *     PaymentStatus:
 *       type: string
 *       enum: [pending, paid, failed, refunded]
 *     Payment:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         amount: { type: number, format: float }
 *         currency: { type: string, example: "usd" }
 *         status: { $ref: '#/components/schemas/PaymentStatus' }
 *         userId: { type: string, format: uuid }
 *         orderId: { type: string, format: uuid }
 *         stripePaymentIntentId: { type: string }
 *         paymentMethodDetails: { type: object, nullable: true, description: "Details about the payment method used, from Stripe." }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     SavedPaymentMethod:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         userId: { type: string, format: uuid }
 *         stripePaymentMethodId: { type: string }
 *         cardBrand: { type: string, example: "visa" }
 *         cardLast4: { type: string, example: "4242" }
 *         isDefault: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */
exports.createPaymentIntentController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, orderId, paymentIntent, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                orderId = req.body.orderId;
                return [4 /*yield*/, payment_service_1.createPaymentIntentService(userId, orderId)];
            case 1:
                paymentIntent = _a.sent();
                res.status(200).json(paymentIntent);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                if (error_1 instanceof order_service_1.OrderCreationError) {
                    return [2 /*return*/, res.status(error_1.statusCode).json({ error: error_1.message })];
                }
                console.error('Error creating payment intent:', error_1);
                res.status(500).json({ error: 'Failed to create payment intent.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /api/v1/payments/setup-intent:
 *   post:
 *     summary: Create a Setup Intent to save a new payment method
 *     tags: [Payment]
 *     description: Creates a Setup Intent to be used on the client-side for saving a new card for future use.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Setup Intent created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret:
 *                   type: string
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 */
exports.createSetupIntentController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, setupIntent, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                return [4 /*yield*/, payment_service_1.createSetupIntentService(userId)];
            case 1:
                setupIntent = _a.sent();
                res.status(200).json(setupIntent);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                if (error_2 instanceof order_service_1.OrderCreationError) {
                    return [2 /*return*/, res.status(error_2.statusCode).json({ error: error_2.message })];
                }
                console.error('Error creating setup intent:', error_2);
                res.status(500).json({ error: 'Failed to create setup intent.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /api/v1/payments/me/payment-methods:
 *   get:
 *     summary: Get my saved payment methods
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of the user's saved payment methods.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SavedPaymentMethod'
 */
exports.listMySavedPaymentMethodsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, paymentMethods, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                return [4 /*yield*/, payment_service_1.listSavedPaymentMethodsService(userId)];
            case 1:
                paymentMethods = _a.sent();
                res.status(200).json(paymentMethods);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error listing saved payment methods:', error_3);
                res.status(500).json({ error: 'Failed to list saved payment methods.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /api/v1/payments/me/payment-methods/{paymentMethodId}:
 *   delete:
 *     summary: Delete a saved payment method
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentMethodId
 *         required: true
 *         schema:
 *           type: string
 *         description: The Stripe PaymentMethod ID (pm_...).
 *     responses:
 *       204:
 *         description: Payment method detached successfully.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Payment method not found for this user.
 */
exports.detachPaymentMethodController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, paymentMethodId, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                paymentMethodId = req.params.paymentMethodId;
                return [4 /*yield*/, payment_service_1.detachPaymentMethodService(userId, paymentMethodId)];
            case 1:
                _a.sent();
                res.status(204).send();
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                if (error_4 instanceof order_service_1.OrderCreationError) {
                    return [2 /*return*/, res.status(error_4.statusCode).json({ error: error_4.message })];
                }
                console.error('Error detaching payment method:', error_4);
                res.status(500).json({ error: 'Failed to detach payment method.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /api/v1/payments/me:
 *   get:
 *     summary: Get my payment history
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of the user's payments.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Payment'
 */
exports.listMyPaymentsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, payments, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                return [4 /*yield*/, payment_service_1.listPaymentsForUserService(userId)];
            case 1:
                payments = _a.sent();
                res.status(200).json(payments);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Error listing payments:', error_5);
                res.status(500).json({ error: 'Failed to list payments.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.stripeWebhookController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var sig, event, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                sig = req.headers['stripe-signature'];
                try {
                    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
                }
                catch (err) {
                    console.error("\u274C Webhook signature verification failed.", err.message);
                    return [2 /*return*/, res.status(400).send("Webhook Error: " + err.message)];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, payment_service_1.handleStripeWebhook(event)];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_6 = _a.sent();
                console.error('Error handling webhook event:', error_6);
                return [3 /*break*/, 4];
            case 4:
                res.status(200).json({ received: true });
                return [2 /*return*/];
        }
    });
}); };
