"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.debitWallet = exports.creditWallet = exports.getWalletTransactionsService = exports.getWalletByUserIdService = exports.findOrCreateWalletByUserId = exports.WalletError = void 0;
var client_1 = require("@prisma/client");
var transactionModel = require("../models/transaction.model");
var prisma = new client_1.PrismaClient();
var WalletError = /** @class */ (function (_super) {
    __extends(WalletError, _super);
    function WalletError(message, statusCode) {
        if (statusCode === void 0) { statusCode = 400; }
        var _this = _super.call(this, message) || this;
        _this.name = 'WalletError';
        _this.statusCode = statusCode;
        return _this;
    }
    return WalletError;
}(Error));
exports.WalletError = WalletError;
/**
 * Retrieves a user's wallet. Creates one if it doesn't exist.
 * @param userId The ID of the user.
 * @param tx Optional Prisma transaction client.
 * @returns The user's wallet.
 */
exports.findOrCreateWalletByUserId = function (userId, tx) { return __awaiter(void 0, void 0, Promise, function () {
    var db, wallet;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                db = tx || prisma;
                return [4 /*yield*/, db.wallet.findUnique({
                        where: { userId: userId }
                    })];
            case 1:
                wallet = _a.sent();
                if (!!wallet) return [3 /*break*/, 3];
                return [4 /*yield*/, db.wallet.create({
                        data: {
                            userId: userId,
                            balance: 0
                        }
                    })];
            case 2:
                wallet = _a.sent();
                _a.label = 3;
            case 3: return [2 /*return*/, wallet];
        }
    });
}); };
/**
 * Retrieves a user's wallet and balance.
 * @param userId The ID of the user.
 * @returns The user's wallet.
 */
exports.getWalletByUserIdService = function (userId) { return __awaiter(void 0, void 0, Promise, function () {
    var wallet;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.findOrCreateWalletByUserId(userId)];
            case 1:
                wallet = _a.sent();
                return [2 /*return*/, wallet];
        }
    });
}); };
/**
 * Retrieves a list of transactions for a user's wallet.
 * @param userId The ID of the user.
 * @returns A list of wallet transactions.
 */
exports.getWalletTransactionsService = function (userId) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        // This now uses the unified transaction model to get all transactions for a user.
        // You could add further filtering here if needed, e.g., by source.
        return [2 /*return*/, transactionModel.listTransactionsForUser(userId)];
    });
}); };
/**
 * Credits a user's wallet. This is an internal function to be used by other services.
 * It must be run within a Prisma transaction to ensure atomicity.
 * @param payload The credit payload.
 * @param tx The Prisma transaction client.
 * @returns The created wallet transaction.
 */
exports.creditWallet = function (_a, tx) {
    var userId = _a.userId, amount = _a.amount, description = _a.description, meta = _a.meta;
    return __awaiter(void 0, void 0, Promise, function () {
        var wallet;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (amount <= 0) {
                        throw new WalletError('Credit amount must be positive.');
                    }
                    return [4 /*yield*/, exports.findOrCreateWalletByUserId(userId, tx)];
                case 1:
                    wallet = _b.sent();
                    return [4 /*yield*/, tx.wallet.update({
                            where: { id: wallet.id },
                            data: { balance: { increment: amount } }
                        })];
                case 2:
                    _b.sent();
                    return [2 /*return*/, transactionModel.createTransaction({
                            userId: userId,
                            walletId: wallet.id,
                            amount: amount,
                            type: client_1.TransactionType.WALLET_TOP_UP,
                            source: client_1.TransactionSource.SYSTEM,
                            status: client_1.TransactionStatus.COMPLETED,
                            description: description,
                            meta: meta || {}
                        })];
            }
        });
    });
};
/**
 * Debits a user's wallet. This is an internal function to be used by other services.
 * It must be run within a Prisma transaction to ensure atomicity.
 * @param payload The debit payload.
 * @param tx The Prisma transaction client.
 * @returns The created wallet transaction.
 */
exports.debitWallet = function (_a, tx) {
    var userId = _a.userId, amount = _a.amount, description = _a.description, meta = _a.meta;
    return __awaiter(void 0, void 0, Promise, function () {
        var wallet;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (amount <= 0) {
                        throw new WalletError('Debit amount must be positive.');
                    }
                    return [4 /*yield*/, exports.findOrCreateWalletByUserId(userId, tx)];
                case 1:
                    wallet = _b.sent();
                    if (wallet.balance < amount) {
                        throw new WalletError('Insufficient wallet balance.', 402); // 402 Payment Required
                    }
                    return [4 /*yield*/, tx.wallet.update({
                            where: { id: wallet.id },
                            data: { balance: { decrement: amount } }
                        })];
                case 2:
                    _b.sent();
                    return [2 /*return*/, transactionModel.createTransaction({
                            userId: userId,
                            walletId: wallet.id,
                            amount: -amount,
                            type: client_1.TransactionType.ORDER_PAYMENT,
                            source: client_1.TransactionSource.WALLET,
                            status: client_1.TransactionStatus.COMPLETED,
                            description: description,
                            meta: meta || {}
                        })];
            }
        });
    });
};
