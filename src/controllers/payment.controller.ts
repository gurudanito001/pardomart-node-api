import { Request, Response } from 'express';
import { AuthenticatedRequest } from './vendor.controller';
import {
  createPaymentIntentService,
  handleStripeWebhook,
  listPaymentsForUserService,
  createSetupIntentService,
  listSavedPaymentMethodsService,
  detachPaymentMethodService,
} from '../services/payment.service';
import { OrderCreationError } from '../services/order.service';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
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
export const listMyPaymentsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const payments = await listPaymentsForUserService(userId);
    res.status(200).json(payments);
  } catch (error: any) {
    console.error('Error listing payments:', error);
    res.status(500).json({ error: 'Failed to list payments.' });
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