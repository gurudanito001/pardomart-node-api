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
exports.adminListCustomerTransactions = exports.adminGetCustomerDetailsById = exports.adminListAllCustomers = exports.listCustomerTransactions = exports.listCustomers = void 0;
// models/customer.model.ts
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
/**
 * Retrieves a list of unique customers who have placed orders
 * with a vendor's store(s).
 * @param filters - The filters to apply, including ownerId or vendorId.
 * @returns A list of unique customer users.
 */
exports.listCustomers = function (filters) { return __awaiter(void 0, void 0, Promise, function () {
    var ownerId, vendorId, where, orders;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ownerId = filters.ownerId, vendorId = filters.vendorId;
                where = {};
                if (vendorId) {
                    // Filter by a specific store ID
                    where.vendorId = vendorId;
                }
                else if (ownerId) {
                    // Filter by all stores belonging to a vendor owner
                    where.vendor = {
                        userId: ownerId
                    };
                }
                else {
                    return [2 /*return*/, []]; // Should not happen if service validation is correct
                }
                console.log('Order where clause:', where);
                return [4 /*yield*/, prisma.order.findMany({
                        where: where,
                        select: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    mobileNumber: true
                                }
                            }
                        },
                        distinct: ['userId']
                    })];
            case 1:
                orders = _a.sent();
                return [2 /*return*/, orders.map(function (order) { return order.user; })];
        }
    });
}); };
/**
 * Retrieves transactions for a specific customer, scoped by vendor or owner.
 * @param filters - The filters to apply, including customerId and owner/vendor scope.
 * @returns A list of transactions.
 */
exports.listCustomerTransactions = function (filters) { return __awaiter(void 0, void 0, void 0, function () {
    var customerId, ownerId, vendorId, where;
    return __generator(this, function (_a) {
        customerId = filters.customerId, ownerId = filters.ownerId, vendorId = filters.vendorId;
        where = {
            userId: customerId
        };
        if (vendorId) {
            // Highest precedence: filter by a specific store ID.
            where.vendorId = vendorId;
        }
        else if (ownerId) {
            // Filter by all stores belonging to a vendor owner.
            where.vendor = {
                userId: ownerId
            };
        }
        else {
            // This case should be prevented by the service layer.
            return [2 /*return*/, []];
        }
        return [2 /*return*/, prisma.transaction.findMany({
                where: where,
                include: {
                    order: true
                },
                orderBy: { createdAt: 'desc' }
            })];
    });
}); };
/**
 * (Admin) Retrieves a paginated list of all customers with advanced filtering.
 * @param filters - The filtering criteria.
 * @param pagination - The pagination options.
 * @returns A paginated list of customers with their total spent amount.
 */
exports.adminListAllCustomers = function (filters, pagination) { return __awaiter(void 0, void 0, void 0, function () {
    var name, status, minAmountSpent, maxAmountSpent, createdAtStart, createdAtEnd, page, take, skip, where, having, userSpendings, userIdsWithMatchingSpend, _a, users, totalCount, userIds, userAggregations, totalSpentMap, usersWithTotalSpent, totalPages;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                name = filters.name, status = filters.status, minAmountSpent = filters.minAmountSpent, maxAmountSpent = filters.maxAmountSpent, createdAtStart = filters.createdAtStart, createdAtEnd = filters.createdAtEnd;
                page = pagination.page, take = pagination.take;
                skip = (page - 1) * take;
                where = {
                    role: client_1.Role.customer
                };
                if (name) {
                    where.name = { contains: name, mode: 'insensitive' };
                }
                if (status !== undefined) {
                    where.active = status;
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
                if (!(minAmountSpent !== undefined || maxAmountSpent !== undefined)) return [3 /*break*/, 2];
                having = {};
                if (minAmountSpent !== undefined) {
                    having.totalAmount = { _sum: { gte: minAmountSpent } };
                }
                if (maxAmountSpent !== undefined) {
                    // If there's already a 'gte', we need to use AND
                    if (having.totalAmount) {
                        having.totalAmount._sum.lte = maxAmountSpent;
                    }
                    else {
                        having.totalAmount = { _sum: { lte: maxAmountSpent } };
                    }
                }
                return [4 /*yield*/, prisma.order.groupBy({
                        by: ['userId'],
                        where: {
                            orderStatus: { "in": [client_1.OrderStatus.delivered, client_1.OrderStatus.picked_up_by_customer] }
                        },
                        _sum: {
                            totalAmount: true
                        },
                        having: having
                    })];
            case 1:
                userSpendings = _b.sent();
                userIdsWithMatchingSpend = userSpendings.map(function (u) { return u.userId; });
                // Add the list of user IDs to the main `where` clause.
                // If no users match the spending criteria, the query will correctly return no results.
                where.id = { "in": userIdsWithMatchingSpend };
                _b.label = 2;
            case 2: return [4 /*yield*/, prisma.$transaction([
                    prisma.user.findMany({
                        where: where,
                        skip: skip,
                        take: take,
                        orderBy: { createdAt: 'desc' }
                    }),
                    prisma.user.count({ where: where }),
                ])];
            case 3:
                _a = _b.sent(), users = _a[0], totalCount = _a[1];
                userIds = users.map(function (u) { return u.id; });
                return [4 /*yield*/, prisma.order.groupBy({
                        by: ['userId'],
                        where: {
                            userId: { "in": userIds },
                            orderStatus: { "in": [client_1.OrderStatus.delivered, client_1.OrderStatus.picked_up_by_customer] }
                        },
                        _sum: { totalAmount: true }
                    })];
            case 4:
                userAggregations = _b.sent();
                totalSpentMap = new Map(userAggregations.map(function (agg) { return [agg.userId, agg._sum.totalAmount || 0]; }));
                usersWithTotalSpent = users.map(function (user) { return (__assign(__assign({}, user), { totalSpent: totalSpentMap.get(user.id) || 0 })); });
                totalPages = Math.ceil(totalCount / take);
                return [2 /*return*/, {
                        data: usersWithTotalSpent,
                        page: page,
                        totalPages: totalPages,
                        pageSize: take,
                        totalCount: totalCount
                    }];
        }
    });
}); };
/**
 * (Admin) Retrieves detailed information for a single customer, including order statistics.
 * @param customerId The ID of the customer to retrieve.
 * @returns A customer object with their order stats, or null if not found.
 */
exports.adminGetCustomerDetailsById = function (customerId) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, customer, orderAggregations, totalOrders, totalCompleted, totalCancelled, _i, orderAggregations_1, group, count;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, prisma.$transaction([
                    prisma.user.findFirst({
                        where: {
                            id: customerId,
                            role: client_1.Role.customer
                        }
                    }),
                    prisma.order.groupBy({
                        by: ['orderStatus'],
                        where: {
                            userId: customerId
                        },
                        _count: {
                            orderStatus: true
                        },
                        orderBy: { orderStatus: 'asc' }
                    }),
                ])];
            case 1:
                _a = _c.sent(), customer = _a[0], orderAggregations = _a[1];
                if (!customer) {
                    return [2 /*return*/, null];
                }
                totalOrders = 0;
                totalCompleted = 0;
                totalCancelled = 0;
                for (_i = 0, orderAggregations_1 = orderAggregations; _i < orderAggregations_1.length; _i++) {
                    group = orderAggregations_1[_i];
                    count = typeof group._count === 'object' ? ((_b = group._count.orderStatus) !== null && _b !== void 0 ? _b : 0) : 0;
                    totalOrders += count;
                    if ([client_1.OrderStatus.delivered, client_1.OrderStatus.picked_up_by_customer].includes(group.orderStatus)) {
                        totalCompleted += count;
                    }
                    if ([client_1.OrderStatus.cancelled_by_customer, client_1.OrderStatus.declined_by_vendor].includes(group.orderStatus)) {
                        totalCancelled += count;
                    }
                }
                return [2 /*return*/, __assign(__assign({}, customer), { orderStats: {
                            totalOrders: totalOrders,
                            totalCompleted: totalCompleted,
                            totalCancelled: totalCancelled
                        } })];
        }
    });
}); };
/**
 * (Admin) Retrieves a paginated list of all transactions for a specific customer.
 * @param customerId The ID of the customer.
 * @param pagination The pagination options (page, take).
 * @returns A paginated list of the customer's transactions.
 */
exports.adminListCustomerTransactions = function (customerId, pagination) { return __awaiter(void 0, void 0, void 0, function () {
    var page, take, skip, where, _a, transactions, totalCount, totalPages;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                page = pagination.page, take = pagination.take;
                skip = (page - 1) * take;
                where = {
                    userId: customerId
                };
                return [4 /*yield*/, prisma.$transaction([
                        prisma.transaction.findMany({
                            where: where,
                            include: {
                                order: { select: { id: true, orderCode: true } },
                                vendor: { select: { id: true, name: true } }
                            },
                            skip: skip,
                            take: take,
                            orderBy: {
                                createdAt: 'desc'
                            }
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
