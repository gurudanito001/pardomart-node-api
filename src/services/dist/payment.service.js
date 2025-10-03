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
exports.detachPaymentMethodService = exports.listSavedPaymentMethodsService = exports.listPaymentsForVendorService = exports.listPaymentsForUserService = exports.handleStripeWebhook = exports.createSetupIntentService = exports.createPaymentIntentService = void 0;
var client_1 = require("@prisma/client");
var stripe_1 = require("stripe");
var order_service_1 = require("./order.service");
var paymentModel = require("../models/payment.model");
var prisma = new client_1.PrismaClient();
var stripe = new stripe_1["default"](process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil'
});
/**
 * Finds a user's Stripe Customer ID, or creates a new Stripe Customer if one doesn't exist.
 * @param user The user object from the database.
 * @returns The Stripe Customer ID.
 */
var findOrCreateStripeCustomer = function (user) { return __awaiter(void 0, void 0, Promise, function () {
    var customer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (user.stripeCustomerId) {
                    return [2 /*return*/, user.stripeCustomerId];
                }
                return [4 /*yield*/, stripe.customers.create({
                        email: user.email,
                        name: user.name,
                        phone: user.mobileNumber
                    })];
            case 1:
                customer = _a.sent();
                return [4 /*yield*/, prisma.user.update({
                        where: { id: user.id },
                        data: { stripeCustomerId: customer.id }
                    })];
            case 2:
                _a.sent();
                return [2 /*return*/, customer.id];
        }
    });
}); };
/**
 * Creates a Stripe Payment Intent for a given order.
 * @param userId The ID of the user making the payment.
 * @param orderId The ID of the order to be paid for.
 * @returns An object containing the client_secret for the Payment Intent.
 */
exports.createPaymentIntentService = function (userId, orderId) { return __awaiter(void 0, void 0, void 0, function () {
    var user, order, stripeCustomerId, amountInCents, paymentIntent;
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
                return [4 /*yield*/, findOrCreateStripeCustomer(user)];
            case 3:
                stripeCustomerId = _a.sent();
                amountInCents = Math.round(order.totalAmount * 100);
                return [4 /*yield*/, stripe.paymentIntents.create({
                        amount: amountInCents,
                        currency: 'usd',
                        customer: stripeCustomerId,
                        automatic_payment_methods: {
                            enabled: true
                        },
                        metadata: {
                            orderId: order.id,
                            userId: user.id
                        }
                    })];
            case 4:
                paymentIntent = _a.sent();
                // Create or update a payment record in our database
                return [4 /*yield*/, prisma.payment.upsert({
                        where: { orderId: order.id },
                        create: {
                            orderId: order.id,
                            userId: user.id,
                            amount: order.totalAmount,
                            status: client_1.PaymentStatus.pending,
                            stripePaymentIntentId: paymentIntent.id
                        },
                        update: {
                            amount: order.totalAmount,
                            status: client_1.PaymentStatus.pending,
                            stripePaymentIntentId: paymentIntent.id
                        }
                    })];
            case 5:
                // Create or update a payment record in our database
                _a.sent();
                return [2 /*return*/, { clientSecret: paymentIntent.client_secret }];
        }
    });
}); };
/**
 * Creates a Stripe Setup Intent to save a payment method for future use.
 * @param userId The ID of the user setting up the payment method.
 * @returns An object containing the client_secret for the Setup Intent.
 */
exports.createSetupIntentService = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var user, stripeCustomerId, setupIntent;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.user.findUnique({ where: { id: userId } })];
            case 1:
                user = _a.sent();
                if (!user) {
                    throw new order_service_1.OrderCreationError('User not found.', 404);
                }
                return [4 /*yield*/, findOrCreateStripeCustomer(user)];
            case 2:
                stripeCustomerId = _a.sent();
                return [4 /*yield*/, stripe.setupIntents.create({
                        customer: stripeCustomerId,
                        payment_method_types: ['card'],
                        usage: 'off_session',
                        metadata: {
                            userId: user.id
                        }
                    })];
            case 3:
                setupIntent = _a.sent();
                return [2 /*return*/, { clientSecret: setupIntent.client_secret }];
        }
    });
}); };
/**
 * Handles incoming webhook events from Stripe.
 * @param event The Stripe event object.
 */
exports.handleStripeWebhook = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, paymentIntent, orderId, failedPaymentIntent, failedOrderId, setupIntent, stripeCustomerId, stripePaymentMethodId, user, paymentMethod, existingMethodsCount, isDefault, paymentMethod;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _a = event.type;
                switch (_a) {
                    case 'payment_intent.succeeded': return [3 /*break*/, 1];
                    case 'payment_intent.payment_failed': return [3 /*break*/, 5];
                    case 'setup_intent.succeeded': return [3 /*break*/, 8];
                    case 'payment_method.detached': return [3 /*break*/, 16];
                }
                return [3 /*break*/, 18];
            case 1:
                paymentIntent = event.data.object;
                orderId = paymentIntent.metadata.orderId;
                if (!orderId) return [3 /*break*/, 4];
                // Update our internal payment record
                return [4 /*yield*/, prisma.payment.updateMany({
                        where: { stripePaymentIntentId: paymentIntent.id },
                        data: { status: client_1.PaymentStatus.paid }
                    })];
            case 2:
                // Update our internal payment record
                _d.sent();
                // Update the order itself
                return [4 /*yield*/, prisma.order.update({
                        where: { id: orderId },
                        data: { paymentStatus: client_1.PaymentStatus.paid }
                    })];
            case 3:
                // Update the order itself
                _d.sent();
                console.log("\u2705 Payment for order " + orderId + " succeeded.");
                _d.label = 4;
            case 4: return [3 /*break*/, 19];
            case 5:
                failedPaymentIntent = event.data.object;
                failedOrderId = failedPaymentIntent.metadata.orderId;
                if (!failedOrderId) return [3 /*break*/, 7];
                return [4 /*yield*/, prisma.payment.updateMany({
                        where: { stripePaymentIntentId: failedPaymentIntent.id },
                        data: { status: client_1.PaymentStatus.failed }
                    })];
            case 6:
                _d.sent();
                console.log("\u274C Payment for order " + failedOrderId + " failed.");
                _d.label = 7;
            case 7: return [3 /*break*/, 19];
            case 8:
                setupIntent = event.data.object;
                stripeCustomerId = setupIntent.customer;
                stripePaymentMethodId = setupIntent.payment_method;
                return [4 /*yield*/, prisma.user.findUnique({ where: { stripeCustomerId: stripeCustomerId } })];
            case 9:
                user = _d.sent();
                if (!user) return [3 /*break*/, 15];
                return [4 /*yield*/, stripe.paymentMethods.retrieve(stripePaymentMethodId)];
            case 10:
                paymentMethod = _d.sent();
                return [4 /*yield*/, prisma.savedPaymentMethod.count({
                        where: { userId: user.id }
                    })];
            case 11:
                existingMethodsCount = _d.sent();
                isDefault = existingMethodsCount === 0;
                // Save to our local DB
                return [4 /*yield*/, prisma.savedPaymentMethod.create({
                        data: {
                            userId: user.id,
                            stripePaymentMethodId: paymentMethod.id,
                            cardBrand: ((_b = paymentMethod.card) === null || _b === void 0 ? void 0 : _b.brand) || 'unknown',
                            cardLast4: ((_c = paymentMethod.card) === null || _c === void 0 ? void 0 : _c.last4) || '0000',
                            isDefault: isDefault
                        }
                    })];
            case 12:
                // Save to our local DB
                _d.sent();
                if (!isDefault) return [3 /*break*/, 14];
                // Set as default on Stripe
                return [4 /*yield*/, stripe.customers.update(stripeCustomerId, {
                        invoice_settings: {
                            default_payment_method: paymentMethod.id
                        }
                    })];
            case 13:
                // Set as default on Stripe
                _d.sent();
                _d.label = 14;
            case 14:
                console.log("\u2705 Saved payment method " + paymentMethod.id + " for user " + user.id + ".");
                _d.label = 15;
            case 15: return [3 /*break*/, 19];
            case 16:
                paymentMethod = event.data.object;
                return [4 /*yield*/, prisma.savedPaymentMethod.deleteMany({
                        where: { stripePaymentMethodId: paymentMethod.id }
                    })];
            case 17:
                _d.sent();
                console.log("\u2705 Detached and removed payment method " + paymentMethod.id + " from local DB.");
                return [3 /*break*/, 19];
            case 18:
                console.log("Unhandled event type " + event.type);
                _d.label = 19;
            case 19: return [2 /*return*/];
        }
    });
}); };
/**
 * Retrieves a list of payments for a specific user.
 * @param userId The ID of the user.
 * @returns A list of the user's payments.
 */
exports.listPaymentsForUserService = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.payment.findMany({
                where: { userId: userId },
                orderBy: { createdAt: 'desc' },
                include: {
                    order: {
                        select: { id: true, totalAmount: true, createdAt: true }
                    }
                }
            })];
    });
}); };
/**
 * Retrieves a list of payments for a vendor user's stores.
 * @param vendorOwnerId The ID of the user who owns the vendors.
 * @param vendorId Optional ID of a specific vendor to filter by.
 * @returns A list of payments.
 */
exports.listPaymentsForVendorService = function (vendorOwnerId, vendorId) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, paymentModel.listPaymentsForVendor({ vendorOwnerId: vendorOwnerId, vendorId: vendorId })];
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
    var user, savedMethod, nextMethod;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.user.findUnique({ where: { id: userId } })];
            case 1:
                user = _a.sent();
                if (!user || !user.stripeCustomerId) {
                    throw new order_service_1.OrderCreationError('User or Stripe customer not found.', 404);
                }
                return [4 /*yield*/, prisma.savedPaymentMethod.findFirst({
                        where: {
                            userId: userId,
                            stripePaymentMethodId: stripePaymentMethodId
                        }
                    })];
            case 2:
                savedMethod = _a.sent();
                if (!savedMethod) {
                    throw new order_service_1.OrderCreationError('Payment method not found for this user.', 404);
                }
                // Detach from Stripe. This will trigger the 'payment_method.detached' webhook
                // which will then delete it from our local DB.
                return [4 /*yield*/, stripe.paymentMethods.detach(stripePaymentMethodId)];
            case 3:
                // Detach from Stripe. This will trigger the 'payment_method.detached' webhook
                // which will then delete it from our local DB.
                _a.sent();
                if (!savedMethod.isDefault) return [3 /*break*/, 7];
                return [4 /*yield*/, prisma.savedPaymentMethod.findFirst({
                        where: {
                            userId: userId,
                            id: { not: savedMethod.id }
                        },
                        orderBy: {
                            createdAt: 'asc'
                        }
                    })];
            case 4:
                nextMethod = _a.sent();
                return [4 /*yield*/, stripe.customers.update(user.stripeCustomerId, {
                        invoice_settings: {
                            default_payment_method: nextMethod === null || nextMethod === void 0 ? void 0 : nextMethod.stripePaymentMethodId
                        }
                    })];
            case 5:
                _a.sent();
                if (!nextMethod) return [3 /*break*/, 7];
                return [4 /*yield*/, prisma.savedPaymentMethod.update({
                        where: { id: nextMethod.id },
                        data: { isDefault: true }
                    })];
            case 6:
                _a.sent();
                _a.label = 7;
            case 7: return [2 /*return*/];
        }
    });
}); };
