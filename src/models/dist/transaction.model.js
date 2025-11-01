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
exports.adminGetTransactionById = exports.adminListAllTransactions = exports.listTransactions = exports.listTransactionsForVendor = exports.listTransactionsForUser = exports.createTransaction = void 0;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
exports.createTransaction = function (payload, tx) {
    var db = tx || prisma;
    return db.transaction.create({
        data: payload
    });
};
exports.listTransactionsForUser = function (userId) {
    return prisma.transaction.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
            order: {
                select: { id: true, orderCode: true, totalAmount: true }
            }
        }
    });
};
var transactionWithRelations = client_1.Prisma.validator()({
    include: {
        order: {
            include: {
                vendor: true,
                user: true
            }
        },
        user: true
    }
});
/**
 * Retrieves a list of transactions for a vendor user, optionally filtered by a specific vendor ID.
 * @param filters - The filters to apply, including the vendor owner's user ID and an optional vendor ID.
 * @returns A list of transactions.
 */
exports.listTransactionsForVendor = function (filters) { return __awaiter(void 0, void 0, Promise, function () {
    var where;
    return __generator(this, function (_a) {
        where = {
            order: {
                vendor: __assign({ userId: filters.vendorOwnerId }, (filters.vendorId ? { id: filters.vendorId } : {}))
            },
            // Only include transactions that are relevant to a vendor
            type: {
                "in": ['ORDER_PAYMENT', 'VENDOR_PAYOUT']
            }
        };
        return [2 /*return*/, prisma.transaction.findMany(__assign(__assign({ where: where }, transactionWithRelations), { orderBy: { createdAt: 'desc' } }))];
    });
}); };
/**
 * Retrieves a list of transactions based on various filters for vendors and their staff.
 * @param filters - The filters to apply to the query.
 * @returns A list of transactions.
 */
exports.listTransactions = function (filters) { return __awaiter(void 0, void 0, Promise, function () {
    var ownerId, vendorId, userId, where, vendorFilter;
    return __generator(this, function (_a) {
        ownerId = filters.ownerId, vendorId = filters.vendorId, userId = filters.userId;
        where = {};
        // If a specific user (customer or staff) is being filtered, this is the primary condition.
        if (userId) {
            where.userId = userId;
        }
        vendorFilter = {
            OR: [
                // Condition 1: Transaction is linked to an order from the specified vendor/owner.
                {
                    order: {
                        vendor: __assign(__assign({}, (vendorId ? { id: vendorId } : {})), (ownerId ? { userId: ownerId } : {}))
                    }
                },
                // Condition 2: Transaction was performed by a user (staff) who belongs to the specified vendor/owner.
                {
                    user: {
                        vendor: __assign(__assign({}, (vendorId ? { id: vendorId } : {})), (ownerId ? { userId: ownerId } : {}))
                    }
                },
            ]
        };
        // If there's a vendor or owner filter, combine it with the main `where` clause.
        if (vendorId || ownerId) {
            where.AND = [where.AND || {}, vendorFilter].flat();
        }
        return [2 /*return*/, prisma.transaction.findMany({
                where: where,
                include: {
                    user: { select: { id: true, name: true, email: true, role: true } },
                    order: { select: { id: true, orderCode: true } }
                },
                orderBy: { createdAt: 'desc' }
            })];
    });
}); };
/**
 * (Admin) Retrieves a paginated list of all transactions with filtering.
 * @param filters - The filtering criteria.
 * @param pagination - The pagination options.
 * @returns A paginated list of transactions.
 */
exports.adminListAllTransactions = function (filters, pagination) { return __awaiter(void 0, void 0, void 0, function () {
    var orderCode, customerName, status, createdAtStart, createdAtEnd, page, take, skip, where, _a, transactions, totalCount, totalPages;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                orderCode = filters.orderCode, customerName = filters.customerName, status = filters.status, createdAtStart = filters.createdAtStart, createdAtEnd = filters.createdAtEnd;
                page = pagination.page, take = pagination.take;
                skip = (page - 1) * take;
                where = {};
                if (orderCode) {
                    where.order = {
                        orderCode: { contains: orderCode, mode: 'insensitive' }
                    };
                }
                if (customerName) {
                    where.user = {
                        name: { contains: customerName, mode: 'insensitive' }
                    };
                }
                if (status) {
                    where.status = status;
                }
                if (createdAtStart || createdAtEnd) {
                    where.createdAt = {};
                    if (createdAtStart) {
                        where.createdAt.gte = new Date(createdAtStart);
                    }
                    if (createdAtEnd) {
                        where.createdAt.lte = new Date(createdAtEnd);
                    }
                }
                return [4 /*yield*/, prisma.$transaction([
                        prisma.transaction.findMany({
                            where: where,
                            include: {
                                user: { select: { id: true, name: true, email: true } },
                                order: { select: { id: true, orderCode: true } }
                            },
                            skip: skip,
                            take: take,
                            orderBy: { createdAt: 'desc' }
                        }),
                        prisma.transaction.count({ where: where }),
                    ])];
            case 1:
                _a = _b.sent(), transactions = _a[0], totalCount = _a[1];
                totalPages = Math.ceil(totalCount / take);
                return [2 /*return*/, {
                        data: transactions,
                        page: page,
                        totalPages: totalPages,
                        pageSize: take,
                        totalCount: totalCount
                    }];
        }
    });
}); };
/**
 * (Admin) Retrieves a single transaction by its ID, including its relations.
 * @param transactionId The ID of the transaction to retrieve.
 * @returns A transaction object with relations or null if not found.
 */
exports.adminGetTransactionById = function (transactionId) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.transaction.findUnique(__assign({ where: { id: transactionId } }, transactionWithRelations))];
    });
}); };
