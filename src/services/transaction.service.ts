import { PrismaClient, User, SavedPaymentMethod, Transaction, TransactionStatus, TransactionType, TransactionSource, PaymentStatus, Prisma, Role, OrderStatus } from '@prisma/client';
import Stripe from 'stripe';
import { OrderCreationError } from './order.service';
import * as transactionModel from '../models/transaction.model';

import { sendEmail } from '../utils/email.util';
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

/**
 * (Admin) Retrieves an overview of platform-wide financial transactions.
 * - Income is the sum of service and shopping fees from completed orders.
 * - Expense is the sum of all refunded amounts.
 * - Revenue is Income - Expense.
 * @returns An object containing the financial overview data.
 */
export const getTransactionOverviewService = async () => {
  const [
    totalTransactions,
    incomeAggregation,
    expenseAggregation,
  ] = await prisma.$transaction([
    // 1. Total number of all transactions
    prisma.transaction.count(),

    // 2. Total income (sum of service and shopping fees from completed orders)
    prisma.order.aggregate({
      where: {
        orderStatus: { in: [OrderStatus.delivered, OrderStatus.picked_up_by_customer] },
      },
      _sum: {
        serviceFee: true,
        shoppingFee: true,
      },
    }),

    // 3. Total expense (sum of all refunds)
    prisma.transaction.aggregate({
      where: { type: TransactionType.REFUND },
      _sum: {
        amount: true, // Refunds are stored as positive values
      },
    }),
  ]);

  const totalIncome = (incomeAggregation._sum.serviceFee || 0) + (incomeAggregation._sum.shoppingFee || 0);
  const totalExpense = expenseAggregation._sum.amount || 0;
  const revenue = totalIncome - totalExpense;

  return { totalTransactions, totalIncome, totalExpense, revenue };
};

/**
 * (Admin) Retrieves a paginated list of all transactions with filtering.
 * @param filters - The filtering criteria.
 * @param pagination - The pagination options.
 * @returns A paginated list of transactions.
 */
export const adminListAllTransactionsService = async (
  filters: transactionModel.AdminListTransactionsFilters,
  pagination: { page: number; take: number }
) => {
  return transactionModel.adminListAllTransactions(filters, pagination);
};

/**
 * (Admin) Retrieves a single transaction by its ID without any ownership checks.
 * @param transactionId The ID of the transaction to retrieve.
 * @returns The transaction object with its relations.
 * @throws OrderCreationError if the transaction is not found.
 */
export const adminGetTransactionByIdService = async (transactionId: string) => {
  const transaction = await transactionModel.adminGetTransactionById(transactionId);
  if (!transaction) {
    throw new OrderCreationError('Transaction not found.', 404);
  }
  return transaction;
};

/**
 * (Admin) Generates and sends a receipt for a given transaction to the customer.
 * @param transactionId The ID of the transaction.
 * @returns A success message.
 * @throws OrderCreationError if the transaction or associated order/user is not found.
 */
export const sendReceiptService = async (transactionId: string): Promise<{ message: string }> => {
  // 1. Fetch the transaction with all necessary relations for the receipt.
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      user: true,
      order: {
        include: {
          orderItems: {
            include: {
              vendorProduct: {
                include: {
                  product: true,
                },
              },
            },
          },
          vendor: true,
        },
      },
    },
  });

  if (!transaction) {
    throw new OrderCreationError('Transaction not found.', 404);
  }
  if (!transaction.order) {
    throw new OrderCreationError('This transaction is not associated with an order.', 400);
  }
  if (!transaction.user) {
    throw new OrderCreationError('Customer details not found for this transaction.', 404);
  }

  const { order, user } = transaction;

  // 2. Format the receipt data into an HTML string.
  const itemsHtml = order.orderItems
    .map(
      (item) => `
    <tr>
      <td>${item.vendorProduct.name}</td>
      <td>${item.quantity}</td>
      <td>$${item.vendorProduct.price.toFixed(2)}</td>
      <td>$${(item.quantity * item.vendorProduct.price).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  const receiptHtml = `
    <html>
      <head><style>body { font-family: sans-serif; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }</style></head>
      <body>
        <h2>Receipt for Order #${order.orderCode}</h2>
        <p>Hi ${user.name}, here is your receipt.</p>
        <p><strong>Transaction ID:</strong> ${transaction.id}</p>
        <p><strong>Date:</strong> ${new Date(transaction.createdAt).toLocaleString()}</p>
        <p><strong>Store:</strong> ${order.vendor.name}</p>
        <hr/>
        <h3>Order Items</h3>
        <table>
          <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <hr/>
        <h3>Summary</h3>
        <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
        <p>Delivery Fee: $${(order.deliveryFee || 0).toFixed(2)}</p>
        <p>Service Fee: $${(order.serviceFee || 0).toFixed(2)}</p>
        <p><strong>Total Paid: $${order.totalAmount.toFixed(2)}</strong></p>
        <br/>
        <p>Thank you for your purchase!</p>
      </body>
    </html>
  `;

  // 3. Send the email.
  await sendEmail({
    to: user.email,
    subject: `Your Receipt for Order #${order.orderCode}`,
    html: receiptHtml,
  });

  // 4. Update the transaction meta to log that a receipt was sent.
  await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      meta: { ...(transaction.meta as object), receiptSentAt: new Date().toISOString() },
    },
  });

  return { message: `Receipt successfully sent to ${user.email}.` };
};

/**
 * Simulates a successful payment for an order (For testing/dev purposes).
 * @param userId The ID of the user making the payment.
 * @param orderId The ID of the order to pay.
 * @returns The created transaction.
 */
export const simulatePaymentService = async (userId: string, orderId: string) => {
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

  if (order.paymentStatus === PaymentStatus.paid) {
    throw new OrderCreationError('This order has already been paid for.', 409);
  }

  // Create completed transaction
  const transaction = await transactionModel.createTransaction({
    userId: user.id,
    amount: -order.totalAmount,
    type: TransactionType.ORDER_PAYMENT,
    source: TransactionSource.SYSTEM, // Using SYSTEM to indicate internal/mock
    status: TransactionStatus.COMPLETED,
    description: `Mock Payment for order #${order.orderCode}`,
    orderId: order.id,
    externalId: `mock_${Date.now()}`,
    meta: { simulated: true },
  });

  // Update order status
  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: PaymentStatus.paid },
  });

  // Send receipt notification
  try {
    await sendReceiptService(transaction.id);
  } catch (error) {
    console.warn('Failed to send receipt for simulated payment:', error);
  }

  return transaction;
};