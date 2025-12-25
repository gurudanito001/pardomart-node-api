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
exports.adminListAllTransactionsController = exports.sendReceiptController = exports.adminGetTransactionByIdController = exports.simulatePaymentController = exports.getTransactionOverviewController = exports.listTransactionsController = exports.stripeWebhookController = exports.listVendorTransactionsController = exports.listMyTransactionsController = exports.detachPaymentMethodController = exports.listMySavedPaymentMethodsController = exports.createSetupIntentController = exports.createPaymentIntentController = void 0;
var transaction_service_1 = require("../services/transaction.service");
var order_service_1 = require("../services/order.service");
var transactionService = require("../services/transaction.service");
/* const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
}); */
/**
 * @swagger
 * tags:
 *   name: Transaction
 *   description: Payment, refund, and payout transaction management
 */
/**
 * @swagger
 * /transactions/create-payment-intent:
 *   post:
 *     summary: Create a Payment Intent for an order
 *     tags: [Transaction]
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
 *     Transaction:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         userId: { type: string, format: uuid }
 *         amount: { type: number, format: float }
 *         type: { $ref: '#/components/schemas/TransactionType' }
 *         source: { $ref: '#/components/schemas/TransactionSource' }
 *         status: { $ref: '#/components/schemas/TransactionStatus' }
 *         description: { type: string, nullable: true }
 *         orderId: { type: string, format: uuid }
 *         externalId: { type: string, nullable: true, description: "ID from the external payment provider (e.g., Stripe Payment Intent ID)." }
 *         meta: { type: object, nullable: true, description: "Additional metadata, such as payment details from Stripe." }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     TransactionWithRelations:
 *       allOf:
 *         - $ref: '#/components/schemas/Transaction'
 *         - type: object
 *           properties:
 *             order:
 *               type: object
 *               properties:
 *                 id: { type: string, format: uuid }
 *                 orderCode: { type: string }
 *                 totalAmount: { type: number, format: float }
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
                return [4 /*yield*/, transaction_service_1.createPaymentIntentService(userId, orderId)];
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
 * /transactions/setup-intent:
 *   post:
 *     summary: Create a Setup Intent to save a new payment method
 *     tags: [Transaction]
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
                return [4 /*yield*/, transaction_service_1.createSetupIntentService(userId)];
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
 * /transactions/me/payment-methods:
 *   get:
 *     summary: Get my saved payment methods
 *     tags: [Transaction]
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
                return [4 /*yield*/, transaction_service_1.listSavedPaymentMethodsService(userId)];
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
 * /transactions/me/payment-methods/{paymentMethodId}:
 *   delete:
 *     summary: Delete a saved payment method
 *     tags: [Transaction]
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
                return [4 /*yield*/, transaction_service_1.detachPaymentMethodService(userId, paymentMethodId)];
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
 * /transactions/me:
 *   get:
 *     summary: Get my transaction history
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of the user's transactions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TransactionWithRelations'
 */
exports.listMyTransactionsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, transactions, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                return [4 /*yield*/, transaction_service_1.listTransactionsForUserService(userId)];
            case 1:
                transactions = _a.sent();
                res.status(200).json(transactions);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Error listing transactions:', error_5);
                res.status(500).json({ error: 'Failed to list transactions.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /transactions/vendor:
 *   get:
 *     summary: Get payment transactions for a vendor user
 *     tags: [Transaction, Vendor]
 *     description: Retrieves a list of all payment-related transactions for stores owned by the authenticated vendor user. Can be filtered by a specific store.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional. The ID of a specific store (vendor) to filter payments for.
 *     responses:
 *       200:
 *         description: A list of payment transactions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TransactionWithRelations'
 *       403:
 *         description: Forbidden. User is not a vendor.
 */
exports.listVendorTransactionsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, vendorId, transactions, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                vendorId = req.query.vendorId;
                return [4 /*yield*/, transaction_service_1.listTransactionsForVendorService(userId, vendorId)];
            case 1:
                transactions = _a.sent();
                res.status(200).json(transactions);
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Error listing vendor transactions:', error_6);
                res.status(500).json({ error: 'Failed to list vendor transactions.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.stripeWebhookController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        /* const sig = req.headers['stripe-signature'] as string;
        let event: Stripe.Event;
      
        try {
          event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
        } catch (err: any) {
          console.error(`❌ Webhook signature verification failed.`, err.message);
          return res.status(400).send(`Webhook Error: ${err.message}`);
        }
      
        try {
          await handleStripeWebhook(event);
        } catch (error) {
          console.error('Error handling webhook event:', error);
          // Return a 200 to Stripe even if our internal processing fails
          // to prevent Stripe from retrying indefinitely. We should have internal monitoring for this.
        } */
        res.status(200).json({ received: true });
        return [2 /*return*/];
    });
}); };
/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Transaction management
 */
/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: List transactions based on user role
 *     tags: [Transactions]
 *     description: >
 *       Retrieves a list of transactions with role-based access control:
 *       - **Vendor**: Can see all transactions from all their stores. Can filter by `vendorId` (store ID) and `userId` (customer ID).
 *       - **Store Admin**: Can only see transactions from their assigned store. Can filter by `userId` (customer ID).
 *       - **Store Shopper**: Can only see transactions they have performed (e.g., payouts, tips).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         schema: { type: string, format: uuid }
 *         description: Optional. (Vendor only) Filter transactions for a specific store.
 *       - in: query
 *         name: userId
 *         schema: { type: string, format: uuid }
 *         description: Optional. (Vendor/Store Admin) Filter transactions for a specific customer or staff member.
 *     responses:
 *       200:
 *         description: A list of transactions.
 *       403:
 *         description: Forbidden. User does not have permission to access the requested resources.
 *       500:
 *         description: Internal server error.
 */
exports.listTransactionsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, userRole, staffVendorId, _a, queryVendorId, queryUserId, filters, transactions, error_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = req.userId, userRole = req.userRole, staffVendorId = req.vendorId;
                _a = req.query, queryVendorId = _a.vendorId, queryUserId = _a.userId;
                filters = {
                    requestingUserId: userId,
                    requestingUserRole: userRole,
                    staffVendorId: staffVendorId,
                    filterByVendorId: queryVendorId,
                    filterByUserId: queryUserId
                };
                return [4 /*yield*/, transactionService.listTransactionsService(filters)];
            case 1:
                transactions = _b.sent();
                res.status(200).json(transactions);
                return [3 /*break*/, 3];
            case 2:
                error_7 = _b.sent();
                console.error('Error listing transactions:', error_7);
                if (error_7.message.includes('Forbidden') || error_7.message.includes('Unauthorized')) {
                    return [2 /*return*/, res.status(403).json({ error: error_7.message })];
                }
                res.status(500).json({ error: 'An unexpected error occurred while listing transactions.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /transactions/admin/overview:
 *   get:
 *     summary: Get platform-wide transaction overview (Admin)
 *     tags: [Transaction, Admin]
 *     description: Retrieves aggregate financial data for the platform, including total transactions, income (fees), expenses (refunds), and revenue. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: An object containing the financial overview data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTransactions: { type: integer }
 *                 totalIncome: { type: number, format: float }
 *                 totalExpense: { type: number, format: float }
 *                 revenue: { type: number, format: float }
 *       500:
 *         description: Internal server error.
 */
exports.getTransactionOverviewController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var overviewData, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, transactionService.getTransactionOverviewService()];
            case 1:
                overviewData = _a.sent();
                res.status(200).json(overviewData);
                return [3 /*break*/, 3];
            case 2:
                error_8 = _a.sent();
                console.error('Error getting transaction overview:', error_8);
                res.status(500).json({ error: 'An unexpected error occurred.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /transactions/simulate-payment:
 *   post:
 *     summary: Simulate a payment (Dev/Test)
 *     tags: [Transaction]
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
 *         description: Payment simulated successfully.
 *       400:
 *         description: Bad request.
 *       404:
 *         description: Order not found.
 */
exports.simulatePaymentController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, orderId, transaction, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                orderId = req.body.orderId;
                return [4 /*yield*/, transaction_service_1.simulatePaymentService(userId, orderId)];
            case 1:
                transaction = _a.sent();
                res.status(200).json(transaction);
                return [3 /*break*/, 3];
            case 2:
                error_9 = _a.sent();
                if (error_9 instanceof order_service_1.OrderCreationError) {
                    return [2 /*return*/, res.status(error_9.statusCode).json({ error: error_9.message })];
                }
                console.error('Error simulating payment:', error_9);
                res.status(500).json({ error: 'Failed to simulate payment.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /transactions/admin/{transactionId}:
 *   get:
 *     summary: Get a single transaction by ID (Admin)
 *     tags: [Transaction, Admin]
 *     description: Retrieves the full details of a specific transaction by its ID. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the transaction to retrieve.
 *     responses:
 *       200:
 *         description: The requested transaction details.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/TransactionWithRelations' }
 *       404:
 *         description: Transaction not found.
 */
exports.adminGetTransactionByIdController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var transactionId, transaction, error_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                transactionId = req.params.transactionId;
                return [4 /*yield*/, transactionService.adminGetTransactionByIdService(transactionId)];
            case 1:
                transaction = _a.sent();
                res.status(200).json(transaction);
                return [3 /*break*/, 3];
            case 2:
                error_10 = _a.sent();
                res.status(error_10.statusCode || 500).json({ error: error_10.message || 'An unexpected error occurred.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /transactions/admin/{transactionId}/send-receipt:
 *   post:
 *     summary: Generate and send a receipt for a transaction (Admin)
 *     tags: [Transaction, Admin]
 *     description: Retrieves the details for a transaction, generates an HTML receipt, and sends it to the customer's email address. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the transaction to send a receipt for.
 *     responses:
 *       200:
 *         description: Receipt sent successfully.
 *       404:
 *         description: Transaction or related data not found.
 *       400:
 *         description: Bad request (e.g., transaction not linked to an order).
 */
exports.sendReceiptController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var transactionId, result, error_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                transactionId = req.params.transactionId;
                return [4 /*yield*/, transactionService.sendReceiptService(transactionId)];
            case 1:
                result = _a.sent();
                res.status(200).json(result);
                return [3 /*break*/, 3];
            case 2:
                error_11 = _a.sent();
                res.status(error_11.statusCode || 500).json({ error: error_11.message || 'An unexpected error occurred.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /transactions/admin/all:
 *   get:
 *     summary: Get a paginated list of all transactions (Admin)
 *     tags: [Transaction, Admin]
 *     description: Retrieves a paginated list of all transactions on the platform. Allows filtering by orderCode, customer name, status, and creation date. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: orderCode, schema: { type: string }, description: "Filter by order code." }
 *       - { in: query, name: customerName, schema: { type: string }, description: "Filter by customer's name (case-insensitive)." }
 *       - { in: query, name: status, schema: { $ref: '#/components/schemas/TransactionStatus' }, description: "Filter by transaction status." }
 *       - { in: query, name: createdAtStart, schema: { type: string, format: date-time }, description: "Filter transactions created on or after this date." }
 *       - { in: query, name: createdAtEnd, schema: { type: string, format: date-time }, description: "Filter transactions created on or before this date." }
 *       - { in: query, name: page, schema: { type: integer, default: 1 }, description: "Page number for pagination." }
 *       - { in: query, name: size, schema: { type: integer, default: 20 }, description: "Number of items per page." }
 *     responses:
 *       200:
 *         description: A paginated list of transactions.
 *       500:
 *         description: Internal server error.
 */
exports.adminListAllTransactionsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, orderCode, customerName, status, createdAtStart, createdAtEnd, page, take, filters, pagination, result, error_12;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, orderCode = _a.orderCode, customerName = _a.customerName, status = _a.status, createdAtStart = _a.createdAtStart, createdAtEnd = _a.createdAtEnd;
                page = parseInt(req.query.page) || 1;
                take = parseInt(req.query.size) || 20;
                filters = {
                    orderCode: orderCode,
                    customerName: customerName,
                    status: status,
                    createdAtStart: createdAtStart,
                    createdAtEnd: createdAtEnd
                };
                pagination = { page: page, take: take };
                return [4 /*yield*/, transactionService.adminListAllTransactionsService(filters, pagination)];
            case 1:
                result = _b.sent();
                res.status(200).json(result);
                return [3 /*break*/, 3];
            case 2:
                error_12 = _b.sent();
                console.error('Error in adminListAllTransactionsController:', error_12);
                res.status(500).json({ error: 'An unexpected error occurred.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
