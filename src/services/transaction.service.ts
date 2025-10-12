import { PrismaClient, User, SavedPaymentMethod, Transaction, TransactionStatus, TransactionType, TransactionSource, PaymentStatus, Prisma, Role } from '@prisma/client';
import Stripe from 'stripe';
import { OrderCreationError } from './order.service';
import * as transactionModel from '../models/transaction.model';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

/**
 * Finds a user's Stripe Customer ID, or creates a new Stripe Customer if one doesn't exist.
 * @param user The user object from the database.
 * @returns The Stripe Customer ID.
 */
const findOrCreateStripeCustomer = async (user: User): Promise<string> => {
  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    phone: user.mobileNumber,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
};

/**
 * Creates a Stripe Payment Intent for a given order.
 * @param userId The ID of the user making the payment.
 * @param orderId The ID of the order to be paid for.
 * @returns An object containing the client_secret for the Payment Intent.
 */
export const createPaymentIntentService = async (userId: string, orderId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new OrderCreationError('User not found.', 404);
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new OrderCreationError('Order not found.', 404);
  }

  if (order.userId !== userId) {
    throw new OrderCreationError('You are not authorized to pay for this order.', 403);
  }

  if (order.paymentStatus === 'paid') {
    throw new OrderCreationError('This order has already been paid for.', 409);
  }

  const stripeCustomerId = await findOrCreateStripeCustomer(user);
  const amountInCents = Math.round(order.totalAmount * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'usd',
    customer: stripeCustomerId,
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      orderId: order.id,
      userId: user.id,
    },
  });

  // Create a transaction record to track the payment intent
  // We use upsert to handle cases where a user might try to pay for the same order again
  // before the first payment is complete. This updates the existing transaction record.
  await transactionModel.createTransaction({
    userId: user.id,
    amount: -order.totalAmount, // Debiting the customer
    type: TransactionType.ORDER_PAYMENT,
    source: TransactionSource.STRIPE,
    status: TransactionStatus.PENDING,
    description: `Payment for order #${order.orderCode}`,
    orderId: order.id,
    externalId: paymentIntent.id,
    meta: {
      client_secret: paymentIntent.client_secret,
    },
  });

  return { clientSecret: paymentIntent.client_secret };
};

/**
 * Creates a Stripe Setup Intent to save a payment method for future use.
 * @param userId The ID of the user setting up the payment method.
 * @returns An object containing the client_secret for the Setup Intent.
 */
export const createSetupIntentService = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new OrderCreationError('User not found.', 404);
  }

  const stripeCustomerId = await findOrCreateStripeCustomer(user);

  const setupIntent = await stripe.setupIntents.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    usage: 'off_session',
    metadata: {
      userId: user.id,
    },
  });

  return { clientSecret: setupIntent.client_secret };
};

/**
 * Handles incoming webhook events from Stripe.
 * @param event The Stripe event object.
 */
export const handleStripeWebhook = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.orderId;
      if (orderId) {
        // Update our internal transaction record
        await prisma.transaction.updateMany({
          where: { externalId: paymentIntent.id },
          data: { 
            status: TransactionStatus.COMPLETED,
            meta: paymentIntent.payment_method_options ? { payment_method_details: JSON.stringify(paymentIntent.payment_method_options) } : undefined,
          },
        });

        // Update the order itself
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: 'paid' },
        });

        console.log(`✅ Payment for order ${orderId} succeeded.`);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
      const failedOrderId = failedPaymentIntent.metadata.orderId;

      if (failedOrderId) {
        await prisma.transaction.updateMany({
          where: { externalId: failedPaymentIntent.id },
          data: { status: TransactionStatus.FAILED },
        });
        console.log(`❌ Payment for order ${failedOrderId} failed.`);
      }
      break;

    case 'setup_intent.succeeded': {
      const setupIntent = event.data.object as Stripe.SetupIntent;
      const stripeCustomerId = setupIntent.customer as string;
      const stripePaymentMethodId = setupIntent.payment_method as string;

      const user = await prisma.user.findUnique({ where: { stripeCustomerId } });
      if (user) {
        const paymentMethod = await stripe.paymentMethods.retrieve(stripePaymentMethodId);

        // Check if it's the first card for the user
        const existingMethodsCount = await prisma.savedPaymentMethod.count({
          where: { userId: user.id },
        });

        const isDefault = existingMethodsCount === 0;

        // Save to our local DB
        await prisma.savedPaymentMethod.create({
          data: {
            userId: user.id,
            stripePaymentMethodId: paymentMethod.id,
            cardBrand: paymentMethod.card?.brand || 'unknown',
            cardLast4: paymentMethod.card?.last4 || '0000',
            isDefault: isDefault,
          },
        });

        if (isDefault) {
          // Set as default on Stripe
          await stripe.customers.update(stripeCustomerId, {
            invoice_settings: {
              default_payment_method: paymentMethod.id,
            },
          });
        }
        console.log(`✅ Saved payment method ${paymentMethod.id} for user ${user.id}.`);
      }
      break;
    }
    case 'payment_method.detached': {
      const paymentMethod = event.data.object as Stripe.PaymentMethod;
      await prisma.savedPaymentMethod.deleteMany({
        where: { stripePaymentMethodId: paymentMethod.id },
      });
      console.log(`✅ Detached and removed payment method ${paymentMethod.id} from local DB.`);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
};

/**
 * Retrieves a list of payments for a specific user.
 * @param userId The ID of the user.
 * @returns A list of the user's payments.
 */
export const listTransactionsForUserService = async (userId: string) => {
  return transactionModel.listTransactionsForUser(userId);
};

/**
 * Retrieves a list of payments for a vendor user's stores.
 * @param vendorOwnerId The ID of the user who owns the vendors.
 * @param vendorId Optional ID of a specific vendor to filter by.
 * @returns A list of transactions.
 */
export const listTransactionsForVendorService = async (
  vendorOwnerId: string,
  vendorId?: string
): Promise<transactionModel.TransactionWithRelations[]> => {
  return transactionModel.listTransactionsForVendor({ vendorOwnerId, vendorId });
};

/**
 * Retrieves a user's saved payment methods from the local database.
 * @param userId The ID of the user.
 * @returns A list of saved payment methods.
 */
export const listSavedPaymentMethodsService = async (userId: string): Promise<SavedPaymentMethod[]> => {
  return prisma.savedPaymentMethod.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
};

/**
 * Detaches a payment method from a Stripe customer and removes it from the local DB via webhook.
 * @param userId The ID of the user.
 * @param stripePaymentMethodId The Stripe PaymentMethod ID to detach.
 */
export const detachPaymentMethodService = async (userId: string, stripePaymentMethodId: string): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.stripeCustomerId) {
    throw new OrderCreationError('User or Stripe customer not found.', 404);
  }

  const savedMethod = await prisma.savedPaymentMethod.findFirst({
    where: {
      userId: userId,
      stripePaymentMethodId: stripePaymentMethodId,
    },
  });

  if (!savedMethod) {
    throw new OrderCreationError('Payment method not found for this user.', 404);
  }

  // Detach from Stripe. This will trigger the 'payment_method.detached' webhook
  // which will then delete it from our local DB.
  await stripe.paymentMethods.detach(stripePaymentMethodId);

  // If the detached card was the default, we need to find a new default.
  if (savedMethod.isDefault) {
    const nextMethod = await prisma.savedPaymentMethod.findFirst({
      where: {
        userId: userId,
        id: { not: savedMethod.id },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method:  nextMethod?.stripePaymentMethodId 
      },
    });
    if (nextMethod) {
      await prisma.savedPaymentMethod.update({
        where: { id: nextMethod.id },
        data: { isDefault: true },
      });
    }
  }
};



export interface ListTransactionsFilters {
  requestingUserId: string;
  requestingUserRole: Role;
  staffVendorId?: string; // The store ID from the staff member's token
  filterByVendorId?: string; // The store ID from the query param
  filterByUserId?: string; // The customer ID from the query param
}

export const listTransactionsService = async (filters: ListTransactionsFilters): Promise<Transaction[]> => {
  const {
    requestingUserId,
    requestingUserRole,
    staffVendorId,
    filterByVendorId,
    filterByUserId,
  } = filters;

  const modelFilters: transactionModel.ListTransactionsModelFilters = {};

  switch (requestingUserRole) {
    case Role.vendor:
      // Vendor can see all transactions from stores they own.
      modelFilters.ownerId = requestingUserId;
      // They can optionally filter by a specific store they own.
      if (filterByVendorId) {
        const vendor = await prisma.vendor.findFirst({ where: { id: filterByVendorId, userId: requestingUserId } });
        if (!vendor) {
          throw new Error('Forbidden: You do not own this store.');
        }
        modelFilters.vendorId = filterByVendorId;
      }
      // They can optionally filter by customer ID.
      modelFilters.userId = filterByUserId;
      break;

    case Role.store_admin:
      // Store admin can only see transactions from their assigned store.
      if (!staffVendorId) throw new Error('Forbidden: You are not assigned to a store.');
      modelFilters.vendorId = staffVendorId;
      // They can optionally filter by customer ID.
      modelFilters.userId = filterByUserId;
      break;

    case Role.store_shopper:
      // Store shopper can only see their own transactions (e.g., payouts, tips).
      modelFilters.userId = requestingUserId;
      break;

    default:
      throw new Error('Forbidden: You do not have permission to view transactions.');
  }

  return transactionModel.listTransactions(modelFilters);
};