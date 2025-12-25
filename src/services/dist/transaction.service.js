"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.simulatePaymentService = exports.sendReceiptService = exports.adminGetTransactionByIdService = exports.adminListAllTransactionsService = exports.getTransactionOverviewService = exports.listTransactionsService = exports.detachPaymentMethodService = exports.listSavedPaymentMethodsService = exports.listTransactionsForVendorService = exports.listTransactionsForUserService = exports.handleStripeWebhook = exports.createSetupIntentService = exports.createPaymentIntentService = void 0;
var client_1 = require("@prisma/client");
var order_service_1 = require("./order.service");
var transactionModel = require("../models/transaction.model");
var email_util_1 = require("../utils/email.util");
var prisma = new client_1.PrismaClient();
/* const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
}); */
/**
 * Finds a user's Stripe Customer ID, or creates a new Stripe Customer if one doesn't exist.
 * @param user The user object from the database.
 * @returns The Stripe Customer ID.
 */
var findOrCreateStripeCustomer = function (user) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        /* if (user.stripeCustomerId) {
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
        return customer.id; */
        return [2 /*return*/, 'mock_stripe_customer_id'];
    });
}); };
/**
 * Creates a Stripe Payment Intent for a given order.
 * @param userId The ID of the user making the payment.
 * @param orderId The ID of the order to be paid for.
 * @returns An object containing the client_secret for the Payment Intent.
 */
exports.createPaymentIntentService = function (userId, orderId) { return __awaiter(void 0, void 0, void 0, function () {
    var user, order;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.user.findUnique({ where: { id: userId } })];
            case 1:
                user = _a.sent();
                if (!user) {
                    throw new order_service_1.OrderCreationError('User not found.', 404);
                }
                return [4 /*yield*/, prisma.order.findUnique({ where: { id: orderId } })];
            case 2:
                order = _a.sent();
                if (!order) {
                    throw new order_service_1.OrderCreationError('Order not found.', 404);
                }
                if (order.userId !== userId) {
                    throw new order_service_1.OrderCreationError('You are not authorized to pay for this order.', 403);
                }
                if (order.paymentStatus === 'paid') {
                    throw new order_service_1.OrderCreationError('This order has already been paid for.', 409);
                }
                /* const stripeCustomerId = await findOrCreateStripeCustomer(user);
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
                }); */
                return [2 /*return*/, { clientSecret: 'mock_client_secret' }];
        }
    });
}); };
/**
 * Creates a Stripe Setup Intent to save a payment method for future use.
 * @param userId The ID of the user setting up the payment method.
 * @returns An object containing the client_secret for the Setup Intent.
 */
exports.createSetupIntentService = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.user.findUnique({ where: { id: userId } })];
            case 1:
                user = _a.sent();
                if (!user) {
                    throw new order_service_1.OrderCreationError('User not found.', 404);
                }
                /* const stripeCustomerId = await findOrCreateStripeCustomer(user);
              
                const setupIntent = await stripe.setupIntents.create({
                  customer: stripeCustomerId,
                  payment_method_types: ['card'],
                  usage: 'off_session',
                  metadata: {
                    userId: user.id,
                  },
                }); */
                return [2 /*return*/, { clientSecret: 'mock_setup_secret' }];
        }
    });
}); };
/**
 * Handles incoming webhook events from Stripe.
 * @param event The Stripe event object.
 */
exports.handleStripeWebhook = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        /* switch (event.type) {
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
        } */
        console.log('Stripe webhook handling is currently disabled.');
        return [2 /*return*/];
    });
}); };
/**
 * Retrieves a list of payments for a specific user.
 * @param userId The ID of the user.
 * @returns A list of the user's payments.
 */
exports.listTransactionsForUserService = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, transactionModel.listTransactionsForUser(userId)];
    });
}); };
/**
 * Retrieves a list of payments for a vendor user's stores.
 * @param vendorOwnerId The ID of the user who owns the vendors.
 * @param vendorId Optional ID of a specific vendor to filter by.
 * @returns A list of transactions.
 */
exports.listTransactionsForVendorService = function (vendorOwnerId, vendorId) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, transactionModel.listTransactionsForVendor({ vendorOwnerId: vendorOwnerId, vendorId: vendorId })];
    });
}); };
/**
 * Retrieves a user's saved payment methods from the local database.
 * @param userId The ID of the user.
 * @returns A list of saved payment methods.
 */
exports.listSavedPaymentMethodsService = function (userId) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.savedPaymentMethod.findMany({
                where: { userId: userId },
                orderBy: { createdAt: 'asc' }
            })];
    });
}); };
/**
 * Detaches a payment method from a Stripe customer and removes it from the local DB via webhook.
 * @param userId The ID of the user.
 * @param stripePaymentMethodId The Stripe PaymentMethod ID to detach.
 */
exports.detachPaymentMethodService = function (userId, stripePaymentMethodId) { return __awaiter(void 0, void 0, Promise, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.user.findUnique({ where: { id: userId } })];
            case 1:
                user = _a.sent();
                if (!user || !user.stripeCustomerId) {
                    throw new order_service_1.OrderCreationError('User or Stripe customer not found.', 404);
                }
                /* const savedMethod = await prisma.savedPaymentMethod.findFirst({
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
                } */
                console.log('Detach payment method is currently disabled.');
                return [2 /*return*/];
        }
    });
}); };
exports.listTransactionsService = function (filters) { return __awaiter(void 0, void 0, Promise, function () {
    var requestingUserId, requestingUserRole, staffVendorId, filterByVendorId, filterByUserId, modelFilters, _a, vendor;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                requestingUserId = filters.requestingUserId, requestingUserRole = filters.requestingUserRole, staffVendorId = filters.staffVendorId, filterByVendorId = filters.filterByVendorId, filterByUserId = filters.filterByUserId;
                modelFilters = {};
                _a = requestingUserRole;
                switch (_a) {
                    case client_1.Role.vendor: return [3 /*break*/, 1];
                    case client_1.Role.store_admin: return [3 /*break*/, 4];
                    case client_1.Role.store_shopper: return [3 /*break*/, 5];
                }
                return [3 /*break*/, 6];
            case 1:
                // Vendor can see all transactions from stores they own.
                modelFilters.ownerId = requestingUserId;
                if (!filterByVendorId) return [3 /*break*/, 3];
                return [4 /*yield*/, prisma.vendor.findFirst({ where: { id: filterByVendorId, userId: requestingUserId } })];
            case 2:
                vendor = _b.sent();
                if (!vendor) {
                    throw new Error('Forbidden: You do not own this store.');
                }
                modelFilters.vendorId = filterByVendorId;
                _b.label = 3;
            case 3:
                // They can optionally filter by customer ID.
                modelFilters.userId = filterByUserId;
                return [3 /*break*/, 7];
            case 4:
                // Store admin can only see transactions from their assigned store.
                if (!staffVendorId)
                    throw new Error('Forbidden: You are not assigned to a store.');
                modelFilters.vendorId = staffVendorId;
                // They can optionally filter by customer ID.
                modelFilters.userId = filterByUserId;
                return [3 /*break*/, 7];
            case 5:
                // Store shopper can only see their own transactions (e.g., payouts, tips).
                modelFilters.userId = requestingUserId;
                return [3 /*break*/, 7];
            case 6: throw new Error('Forbidden: You do not have permission to view transactions.');
            case 7: return [2 /*return*/, transactionModel.listTransactions(modelFilters)];
        }
    });
}); };
/**
 * (Admin) Retrieves an overview of platform-wide financial transactions.
 * - Income is the sum of service and shopping fees from completed orders.
 * - Expense is the sum of all refunded amounts.
 * - Revenue is Income - Expense.
 * @returns An object containing the financial overview data.
 */
exports.getTransactionOverviewService = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, totalTransactions, incomeAggregation, expenseAggregation, totalIncome, totalExpense, revenue;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, prisma.$transaction([
                    // 1. Total number of all transactions
                    prisma.transaction.count(),
                    // 2. Total income (sum of service and shopping fees from completed orders)
                    prisma.order.aggregate({
                        where: {
                            orderStatus: { "in": [client_1.OrderStatus.delivered, client_1.OrderStatus.picked_up_by_customer] }
                        },
                        _sum: {
                            serviceFee: true,
                            shoppingFee: true
                        }
                    }),
                    // 3. Total expense (sum of all refunds)
                    prisma.transaction.aggregate({
                        where: { type: client_1.TransactionType.REFUND },
                        _sum: {
                            amount: true
                        }
                    }),
                ])];
            case 1:
                _a = _b.sent(), totalTransactions = _a[0], incomeAggregation = _a[1], expenseAggregation = _a[2];
                totalIncome = (incomeAggregation._sum.serviceFee || 0) + (incomeAggregation._sum.shoppingFee || 0);
                totalExpense = expenseAggregation._sum.amount || 0;
                revenue = totalIncome - totalExpense;
                return [2 /*return*/, { totalTransactions: totalTransactions, totalIncome: totalIncome, totalExpense: totalExpense, revenue: revenue }];
        }
    });
}); };
/**
 * (Admin) Retrieves a paginated list of all transactions with filtering.
 * @param filters - The filtering criteria.
 * @param pagination - The pagination options.
 * @returns A paginated list of transactions.
 */
exports.adminListAllTransactionsService = function (filters, pagination) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, transactionModel.adminListAllTransactions(filters, pagination)];
    });
}); };
/**
 * (Admin) Retrieves a single transaction by its ID without any ownership checks.
 * @param transactionId The ID of the transaction to retrieve.
 * @returns The transaction object with its relations.
 * @throws OrderCreationError if the transaction is not found.
 */
exports.adminGetTransactionByIdService = function (transactionId) { return __awaiter(void 0, void 0, void 0, function () {
    var transaction;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, transactionModel.adminGetTransactionById(transactionId)];
            case 1:
                transaction = _a.sent();
                if (!transaction) {
                    throw new order_service_1.OrderCreationError('Transaction not found.', 404);
                }
                return [2 /*return*/, transaction];
        }
    });
}); };
/**
 * (Admin) Generates and sends a receipt for a given transaction to the customer.
 * @param transactionId The ID of the transaction.
 * @returns A success message.
 * @throws OrderCreationError if the transaction or associated order/user is not found.
 */
exports.sendReceiptService = function (transactionId) { return __awaiter(void 0, void 0, Promise, function () {
    var transaction, order, user, itemsHtml, receiptHtml;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.transaction.findUnique({
                    where: { id: transactionId },
                    include: {
                        user: true,
                        order: {
                            include: {
                                orderItems: {
                                    include: {
                                        vendorProduct: {
                                            include: {
                                                product: true
                                            }
                                        }
                                    }
                                },
                                vendor: true
                            }
                        }
                    }
                })];
            case 1:
                transaction = _a.sent();
                if (!transaction) {
                    throw new order_service_1.OrderCreationError('Transaction not found.', 404);
                }
                if (!transaction.order) {
                    throw new order_service_1.OrderCreationError('This transaction is not associated with an order.', 400);
                }
                if (!transaction.user) {
                    throw new order_service_1.OrderCreationError('Customer details not found for this transaction.', 404);
                }
                order = transaction.order, user = transaction.user;
                itemsHtml = order.orderItems
                    .map(function (item) { return "\n    <tr>\n      <td>" + item.vendorProduct.name + "</td>\n      <td>" + item.quantity + "</td>\n      <td>$" + item.vendorProduct.price.toFixed(2) + "</td>\n      <td>$" + (item.quantity * item.vendorProduct.price).toFixed(2) + "</td>\n    </tr>\n  "; })
                    .join('');
                receiptHtml = "\n    <html>\n      <head><style>body { font-family: sans-serif; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }</style></head>\n      <body>\n        <h2>Receipt for Order #" + order.orderCode + "</h2>\n        <p>Hi " + user.name + ", here is your receipt.</p>\n        <p><strong>Transaction ID:</strong> " + transaction.id + "</p>\n        <p><strong>Date:</strong> " + new Date(transaction.createdAt).toLocaleString() + "</p>\n        <p><strong>Store:</strong> " + order.vendor.name + "</p>\n        <hr/>\n        <h3>Order Items</h3>\n        <table>\n          <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>\n          <tbody>" + itemsHtml + "</tbody>\n        </table>\n        <hr/>\n        <h3>Summary</h3>\n        <p>Subtotal: $" + order.subtotal.toFixed(2) + "</p>\n        <p>Delivery Fee: $" + (order.deliveryFee || 0).toFixed(2) + "</p>\n        <p>Service Fee: $" + (order.serviceFee || 0).toFixed(2) + "</p>\n        <p><strong>Total Paid: $" + order.totalAmount.toFixed(2) + "</strong></p>\n        <br/>\n        <p>Thank you for your purchase!</p>\n      </body>\n    </html>\n  ";
                // 3. Send the email.
                return [4 /*yield*/, email_util_1.sendEmail({
                        to: user.email,
                        subject: "Your Receipt for Order #" + order.orderCode,
                        html: receiptHtml
                    })];
            case 2:
                // 3. Send the email.
                _a.sent();
                // 4. Update the transaction meta to log that a receipt was sent.
                return [4 /*yield*/, prisma.transaction.update({
                        where: { id: transactionId },
                        data: {
                            meta: __assign(__assign({}, transaction.meta), { receiptSentAt: new Date().toISOString() })
                        }
                    })];
            case 3:
                // 4. Update the transaction meta to log that a receipt was sent.
                _a.sent();
                return [2 /*return*/, { message: "Receipt successfully sent to " + user.email + "." }];
        }
    });
}); };
/**
 * Simulates a successful payment for an order (For testing/dev purposes).
 * @param userId The ID of the user making the payment.
 * @param orderId The ID of the order to pay.
 * @returns The created transaction.
 */
exports.simulatePaymentService = function (userId, orderId) { return __awaiter(void 0, void 0, void 0, function () {
    var user, order, transaction, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.user.findUnique({ where: { id: userId } })];
            case 1:
                user = _a.sent();
                if (!user) {
                    throw new order_service_1.OrderCreationError('User not found.', 404);
                }
                return [4 /*yield*/, prisma.order.findUnique({ where: { id: orderId } })];
            case 2:
                order = _a.sent();
                if (!order) {
                    throw new order_service_1.OrderCreationError('Order not found.', 404);
                }
                if (order.userId !== userId) {
                    throw new order_service_1.OrderCreationError('You are not authorized to pay for this order.', 403);
                }
                if (order.paymentStatus === client_1.PaymentStatus.paid) {
                    throw new order_service_1.OrderCreationError('This order has already been paid for.', 409);
                }
                return [4 /*yield*/, transactionModel.createTransaction({
                        userId: user.id,
                        amount: order.totalAmount,
                        type: client_1.TransactionType.ORDER_PAYMENT,
                        source: client_1.TransactionSource.SYSTEM,
                        status: client_1.TransactionStatus.COMPLETED,
                        description: "Mock Payment for order #" + order.orderCode,
                        orderId: order.id,
                        externalId: "mock_" + Date.now(),
                        meta: { simulated: true }
                    })];
            case 3:
                transaction = _a.sent();
                // Update order status
                return [4 /*yield*/, prisma.order.update({
                        where: { id: orderId },
                        data: { paymentStatus: client_1.PaymentStatus.paid }
                    })];
            case 4:
                // Update order status
                _a.sent();
                _a.label = 5;
            case 5:
                _a.trys.push([5, 7, , 8]);
                return [4 /*yield*/, exports.sendReceiptService(transaction.id)];
            case 6:
                _a.sent();
                return [3 /*break*/, 8];
            case 7:
                error_1 = _a.sent();
                console.warn('Failed to send receipt for simulated payment:', error_1);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/, transaction];
        }
    });
}); };
