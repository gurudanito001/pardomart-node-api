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
} from '../services/transaction.service';
import { OrderCreationError } from '../services/order.service';
import Stripe from 'stripe';
import { Role } from '@prisma/client';
import * as transactionService from '../services/transaction.service';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

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
export const createPaymentIntentController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const { orderId } = req.body;

    const paymentIntent = await createPaymentIntentService(userId, orderId);
    res.status(200).json(paymentIntent);
  } catch (error: any) {
    if (error instanceof OrderCreationError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Error creating payment intent:', error);
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
    if (error instanceof OrderCreationError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Error creating setup intent:', error);
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
    console.error('Error listing saved payment methods:', error);
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
    if (error instanceof OrderCreationError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Error detaching payment method:', error);
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
    console.error('Error listing transactions:', error);
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
        console.error('Error listing vendor transactions:', error);
        res.status(500).json({ error: 'Failed to list vendor transactions.' });
    }
};

export const stripeWebhookController = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
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
    console.error('Error listing transactions:', error);
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'An unexpected error occurred while listing transactions.' });
  }
};