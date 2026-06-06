import { Request, Response } from 'express';
import { AuthenticatedRequest } from './vendor.controller';
import {
    createPaymentIntentService,
    handleStripeWebhook,
    listTransactionsForUserService,
    createSetupIntentService,
    listSavedPaymentMethodsService,
    detachPaymentMethodService,
    listTransactionsForVendorService,
    getTransactionOverviewService,
    adminListAllTransactionsService,
    adminGetTransactionByIdService,
    sendReceiptService,
    simulatePaymentService,
} from '../services/transaction.service';
import { OrderCreationError } from '../services/order.service';
import Stripe from 'stripe';
import { Role, TransactionStatus } from '@prisma/client';
import * as transactionService from '../services/transaction.service';
import { errorLogService } from '../services/errorLog.service';
import { stripe } from '../services/transaction.service';

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
 *     description: Initializes a Stripe PaymentIntent for a specific order. Accepts an optional `paymentType` to configure the intent for specialized payment methods like EBT. Returns a `clientSecret` that the frontend uses to securely render the Stripe PaymentSheet and complete the transaction.
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
 *               paymentType:
 *                 type: string
 *                 enum: [card, ebt]
 *                 description: "Optional. Specifies the type of payment. Use 'ebt' to configure the intent for EBT processing, otherwise defaults to standard automatic payment methods."
 *     responses:
 *       200:
 *         description: Payment Intent created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 clientSecret:
 *                   type: string
 *                   description: "The Stripe client secret required by the frontend SDK."
 *       400:
 *         description: Bad Request (e.g., order already paid).
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Order or User not found.
 * components:
 *   schemas:
 *     TransactionType:
 *       type: string
 *       enum: [ORDER_PAYMENT, REFUND, VENDOR_PAYOUT, DELIVERY_PAYOUT, TIP_PAYOUT, PLATFORM_FEE_COLLECTED, WALLET_TOP_UP, DEBIT, CREDIT]
 *     TransactionSource:
 *       type: string
 *       enum: [STRIPE, WALLET, SYSTEM, BANK_TRANSFER, CASH]
 *     TransactionStatus:
 *       type: string
 *       enum: [PENDING, COMPLETED, FAILED, CANCELLED]
 *     RefundType:
 *       type: string
 *       enum: [FULL_REVERSAL, PARTIAL_REFUND]
 *       description: >
 *         Categorizes the reason for a refund to the frontend:
 *         - `FULL_REVERSAL`: Entire budgeted amount returned (e.g. order cancelled, declined, or no items found).
 *         - `PARTIAL_REFUND`: Refund for price differences after shopping or partial returns.
 *     Transaction:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         userId: { type: string, format: uuid }
 *         amount: { type: number, format: float }
 *         type: { $ref: '#/components/schemas/TransactionType' }
 *         source: { $ref: '#/components/schemas/TransactionSource' }
 *         status: { $ref: '#/components/schemas/TransactionStatus' }
 *         description: { type: string, nullable: true, description: "A human-readable reason for the transaction, e.g., 'Overpayment Refund for order #ABC123'." }
 *         refundType:
 *           $ref: '#/components/schemas/RefundType'
 *           nullable: true
 *         orderId: { type: string, format: uuid }
 *         externalId: { type: string, nullable: true, description: "ID from the external payment provider (e.g., Stripe Payment Intent ID)." }
 *         meta:
 *           type: object
 *           nullable: true
 *           description: "Additional technical metadata. For refunds, display the `description` field to the user."
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
export const createPaymentIntentController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const { orderId, paymentType } = req.body;

    const paymentIntent = await createPaymentIntentService(userId, orderId, paymentType);
    res.status(200).json(paymentIntent);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to create payment intent',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'CREATE_PAYMENT_INTENT_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    if (error instanceof OrderCreationError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create payment intent.' });
  }
};

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
export const createSetupIntentController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const setupIntent = await createSetupIntentService(userId);
    res.status(200).json(setupIntent);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to create setup intent',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'CREATE_SETUP_INTENT_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    if (error instanceof OrderCreationError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create setup intent.' });
  }
};

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
export const listMySavedPaymentMethodsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const paymentMethods = await listSavedPaymentMethodsService(userId);
    res.status(200).json(paymentMethods);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to list saved payment methods',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'LIST_SAVED_PAYMENT_METHODS_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));
    res.status(500).json({ error: 'Failed to list saved payment methods.' });
  }
};

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
export const detachPaymentMethodController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const { paymentMethodId } = req.params;
    await detachPaymentMethodService(userId, paymentMethodId);
    res.status(204).send();
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to detach payment method',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'DETACH_PAYMENT_METHOD_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    if (error instanceof OrderCreationError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to detach payment method.' });
  }
};

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
export const listMyTransactionsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const transactions = await listTransactionsForUserService(userId);
    res.status(200).json(transactions);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to list my transactions',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'LIST_MY_TRANSACTIONS_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));
    res.status(500).json({ error: 'Failed to list transactions.' });
  }
};

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
export const listVendorTransactionsController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId as string;
        const { vendorId } = req.query;

        const transactions = await listTransactionsForVendorService(userId, vendorId as string | undefined);
        res.status(200).json(transactions);
    } catch (error: any) {
        await errorLogService.logError({
          message: error.message || 'Failed to list vendor transactions',
          stackTrace: error.stack,
          metaData: { body: req.body, query: req.query, params: req.params },
          userId: (req as any).userId as string,
          ipAddress: req.ip || req.socket?.remoteAddress,
          requestMethod: req.method,
          requestPath: req.originalUrl || req.path,
          statusCode: error.statusCode || 500,
          errorCode: error.code || 'LIST_VENDOR_TRANSACTIONS_ERROR'
        }).catch((logErr: any) => console.error('Failed to log error:', logErr));
        res.status(500).json({ error: 'Failed to list vendor transactions.' });
    }
};

/**
 * @swagger
 * /transactions/stripe-webhook:
 *   post:
 *     summary: Stripe Webhook Endpoint
 *     tags: [Transaction]
 *     description: Receives asynchronous webhook events directly from Stripe (e.g., `payment_intent.succeeded`, `setup_intent.succeeded`). Verifies the Stripe signature and updates order payment statuses or saved payment methods in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200:
 *         description: Webhook received and processed successfully.
 *       400:
 *         description: Webhook signature verification failed.
 */
export const stripeWebhookController = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    // With our new middleware setup, req.body is explicitly the raw Buffer that Stripe expects!
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    await errorLogService.logError({
      message: `Webhook signature verification failed: ${err.message}`,
      stackTrace: err.stack,
      metaData: { headers: req.headers }, // Avoid logging raw buffer body
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: 400,
      errorCode: 'STRIPE_WEBHOOK_SIGNATURE_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await transactionService.handleStripeWebhook(event);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Error handling webhook event',
      stackTrace: error.stack,
      metaData: { eventType: event.type, eventId: event.id },
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: 500,
      errorCode: 'STRIPE_WEBHOOK_HANDLING_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));
    // Return a 200 to Stripe even if our internal processing fails
    // to prevent Stripe from retrying indefinitely. We should have internal monitoring for this.
  }

  res.status(200).json({ received: true });
};






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
export const listTransactionsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, userRole, vendorId: staffVendorId } = req;
    const { vendorId: queryVendorId, userId: queryUserId } = req.query as { vendorId?: string; userId?: string };

    const filters: transactionService.ListTransactionsFilters = {
      requestingUserId: userId as string,
      requestingUserRole: userRole as Role,
      staffVendorId: staffVendorId,
      filterByVendorId: queryVendorId,
      filterByUserId: queryUserId,
    };

    const transactions = await transactionService.listTransactionsService(filters);
    res.status(200).json(transactions);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to list transactions',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'LIST_TRANSACTIONS_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'An unexpected error occurred while listing transactions.' });
  }
};

/**
 * @swagger
 * /transactions/admin/overview:
 *   get:
 *     summary: Get platform-wide transaction overview (Admin)
 *     tags: [Transaction, Admin]
 *     description: Retrieves aggregate financial data for the platform. Total Income is the sum of all paid order amounts. Total Revenue is the sum of service fees from paid orders. Total Expenses is the sum of refunds. Only accessible by admins.
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
export const getTransactionOverviewController = async (req: Request, res: Response) => {
  try {
    const overviewData = await transactionService.getTransactionOverviewService();
    res.status(200).json(overviewData);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to get transaction overview',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'GET_TRANSACTION_OVERVIEW_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

/**
 * @swagger
 * /transactions/simulate-payment:
 *   post:
 *     summary: Simulate a payment (Dev/Test)
 *     description: Simulates a successful payment for an order without hitting the Stripe API. It creates a mock completed transaction and updates the order status to paid. This is strictly intended for development and testing environments.
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
export const simulatePaymentController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const { orderId } = req.body;

    const transaction = await simulatePaymentService(userId, orderId);
    res.status(200).json(transaction);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to simulate payment',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'SIMULATE_PAYMENT_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    if (error instanceof OrderCreationError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to simulate payment.' });
  }
};

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
export const adminGetTransactionByIdController = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const transaction = await transactionService.adminGetTransactionByIdService(transactionId);
    res.status(200).json(transaction);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to get transaction by ID (Admin)',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'ADMIN_GET_TRANSACTION_BY_ID_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));
    res.status(error.statusCode || 500).json({ error: error.message || 'An unexpected error occurred.' });
  }
};

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
export const sendReceiptController = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const result = await transactionService.sendReceiptService(transactionId);
    res.status(200).json(result);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to send receipt',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'SEND_RECEIPT_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));
    res.status(error.statusCode || 500).json({ error: error.message || 'An unexpected error occurred.' });
  }
};

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
export const adminListAllTransactionsController = async (req: Request, res: Response) => {
  try {
    const {
      search,
      orderCode,
      customerName,
      status,
      createdAtStart,
      createdAtEnd,
    } = req.query;

    const page = parseInt(req.query.page as string) || 1;
    const take = parseInt(req.query.size as string) || 20;

    const filters = {
      search: search as string | undefined,
      orderCode: orderCode as string | undefined,
      customerName: customerName as string | undefined,
      status: status as TransactionStatus | undefined,
      createdAtStart: createdAtStart as string | undefined,
      createdAtEnd: createdAtEnd as string | undefined,
    };

    const pagination = { page, take };

    const result = await transactionService.adminListAllTransactionsService(filters, pagination);

    res.status(200).json(result);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to list all transactions (Admin)',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'ADMIN_LIST_ALL_TRANSACTIONS_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

/**
 * @swagger
 * /transactions/admin/{transactionId}/download-receipt:
 *   get:
 *     summary: Download receipt for a transaction (Admin)
 *     tags: [Transaction, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: HTML receipt file.
 *         content:
 *           text/html:
 *             schema: { type: string }
 */
export const downloadReceiptController = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const html = await transactionService.downloadReceiptService(transactionId);
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${transactionId}.html`);
    res.send(html);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to download receipt',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'DOWNLOAD_RECEIPT_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));
    res.status(error.statusCode || 500).json({ error: error.message || 'An unexpected error occurred.' });
  }
};

/**
 * @swagger
 * /transactions/admin/export:
 *   get:
 *     summary: Export transactions to CSV (Admin)
 *     tags: [Transaction, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: status, schema: { type: string } }
 *       - { in: query, name: createdAtStart, schema: { type: string, format: date-time } }
 *       - { in: query, name: createdAtEnd, schema: { type: string, format: date-time } }
 *     responses:
 *       200:
 *         description: CSV file download.
 */
export const exportTransactionsController = async (req: Request, res: Response) => {
  try {
    const csv = await transactionService.exportTransactionsService(req.query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to export transactions',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'EXPORT_TRANSACTIONS_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};