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
exports.adminGetDeliveryHistory = exports.adminGetDeliveryPersonDetailsById = exports.adminListAllDeliveryPersons = void 0;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
/**
 * (Admin) Retrieves a paginated list of all delivery persons with advanced filtering.
 * @param filters - The filtering criteria.
 * @param pagination - The pagination options.
 * @returns A paginated list of delivery persons with their total delivery count.
 */
exports.adminListAllDeliveryPersons = function (filters, pagination) { return __awaiter(void 0, void 0, void 0, function () {
    var name, status, minDeliveries, maxDeliveries, createdAtStart, createdAtEnd, page, take, skip, where, having, countFilter, userDeliveries, userIdsWithMatchingDeliveries, _a, users, totalCount, userIds, deliveryCounts, deliveryCountMap, usersWithDeliveryCount, totalPages;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                name = filters.name, status = filters.status, minDeliveries = filters.minDeliveries, maxDeliveries = filters.maxDeliveries, createdAtStart = filters.createdAtStart, createdAtEnd = filters.createdAtEnd;
                page = pagination.page, take = pagination.take;
                skip = (page - 1) * take;
                where = {
                    role: client_1.Role.delivery_person
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
                if (!(minDeliveries !== undefined || maxDeliveries !== undefined)) return [3 /*break*/, 2];
                having = {};
                countFilter = {};
                if (minDeliveries !== undefined) {
                    countFilter.gte = minDeliveries;
                }
                if (maxDeliveries !== undefined) {
                    countFilter.lte = maxDeliveries;
                }
                having.id = { _count: countFilter };
                return [4 /*yield*/, prisma.order.groupBy({
                        by: ['deliveryPersonId'],
                        where: {
                            deliveryPersonId: { not: null },
                            orderStatus: client_1.OrderStatus.delivered
                        },
                        _count: { id: true },
                        having: having
                    })];
            case 1:
                userDeliveries = _b.sent();
                userIdsWithMatchingDeliveries = userDeliveries.map(function (u) { return u.deliveryPersonId; });
                where.id = { "in": userIdsWithMatchingDeliveries };
                _b.label = 2;
            case 2: return [4 /*yield*/, prisma.$transaction([
                    prisma.user.findMany({ where: where, skip: skip, take: take, orderBy: { createdAt: 'desc' } }),
                    prisma.user.count({ where: where }),
                ])];
            case 3:
                _a = _b.sent(), users = _a[0], totalCount = _a[1];
                userIds = users.map(function (u) { return u.id; });
                return [4 /*yield*/, prisma.order.groupBy({
                        by: ['deliveryPersonId'],
                        where: {
                            deliveryPersonId: { "in": userIds },
                            orderStatus: client_1.OrderStatus.delivered
                        },
                        _count: { id: true }
                    })];
            case 4:
                deliveryCounts = _b.sent();
                deliveryCountMap = new Map(deliveryCounts.map(function (agg) { return [agg.deliveryPersonId, agg._count.id || 0]; }));
                usersWithDeliveryCount = users.map(function (user) { return (__assign(__assign({}, user), { totalDeliveries: deliveryCountMap.get(user.id) || 0 })); });
                totalPages = Math.ceil(totalCount / take);
                return [2 /*return*/, {
                        data: usersWithDeliveryCount,
                        page: page,
                        totalPages: totalPages,
                        pageSize: take,
                        totalCount: totalCount
                    }];
        }
    });
}); };
/**
 * (Admin) Retrieves detailed information for a single delivery person, including statistics and recent deliveries.
 * @param deliveryPersonId The ID of the delivery person to retrieve.
 * @returns A delivery person object with their stats and recent deliveries, or null if not found.
 */
exports.adminGetDeliveryPersonDetailsById = function (deliveryPersonId) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, deliveryPerson, orderStats, ratingStats, recentDeliveries;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, prisma.$transaction([
                    // 1. Fetch the user, ensuring they are a delivery person
                    prisma.user.findFirst({
                        where: {
                            id: deliveryPersonId,
                            role: client_1.Role.delivery_person
                        }
                    }),
                    // 2. Aggregate order statistics
                    prisma.order.aggregate({
                        where: {
                            deliveryPersonId: deliveryPersonId,
                            orderStatus: client_1.OrderStatus.delivered
                        },
                        _count: {
                            id: true
                        },
                        _sum: {
                            deliveryPersonTip: true
                        }
                    }),
                    // 3. Aggregate rating statistics
                    prisma.rating.aggregate({
                        where: {
                            ratedUserId: deliveryPersonId,
                            type: 'DELIVERER'
                        },
                        _avg: {
                            rating: true
                        },
                        _count: {
                            id: true
                        }
                    }),
                    // 4. Fetch recent deliveries
                    prisma.order.findMany({
                        where: {
                            deliveryPersonId: deliveryPersonId,
                            orderStatus: client_1.OrderStatus.delivered
                        },
                        include: {
                            user: { select: { name: true } },
                            vendor: { select: { name: true } }
                        },
                        orderBy: {
                            actualDeliveryTime: 'desc'
                        },
                        take: 10
                    }),
                ])];
            case 1:
                _a = _b.sent(), deliveryPerson = _a[0], orderStats = _a[1], ratingStats = _a[2], recentDeliveries = _a[3];
                if (!deliveryPerson) {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, __assign(__assign({}, deliveryPerson), { stats: {
                            totalDeliveries: orderStats._count.id || 0,
                            totalEarnings: orderStats._sum.deliveryPersonTip || 0,
                            averageRating: ratingStats._avg.rating || 0,
                            totalRatings: ratingStats._count.id || 0
                        }, recentDeliveries: recentDeliveries })];
        }
    });
}); };
/**
 * (Admin) Retrieves a paginated delivery history for a single delivery person.
 * @param deliveryPersonId The ID of the delivery person.
 * @param pagination The pagination options (page, take).
 * @returns A paginated list of the delivery person's completed deliveries.
 */
exports.adminGetDeliveryHistory = function (deliveryPersonId, pagination) { return __awaiter(void 0, void 0, void 0, function () {
    var page, take, skip, where, _a, deliveries, totalCount, totalPages;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                page = pagination.page, take = pagination.take;
                skip = (page - 1) * take;
                where = {
                    deliveryPersonId: deliveryPersonId,
                    orderStatus: client_1.OrderStatus.delivered
                };
                return [4 /*yield*/, prisma.$transaction([
                        prisma.order.findMany({
                            where: where,
                            select: {
                                id: true,
                                orderCode: true,
                                pickupOtpVerifiedAt: true,
                                actualDeliveryTime: true,
                                vendor: {
                                    select: {
                                        name: true,
                                        address: true
                                    }
                                },
                                deliveryAddress: {
                                    select: {
                                        addressLine1: true,
                                        city: true,
                                        state: true,
                                        label: true
                                    }
                                }
                            },
                            orderBy: {
                                actualDeliveryTime: 'desc'
                            },
                            skip: skip,
                            take: take
                        }),
                        prisma.order.count({ where: where }),
                    ])];
            case 1:
                _a = _b.sent(), deliveries = _a[0], totalCount = _a[1];
                totalPages = Math.ceil(totalCount / take);
                return [2 /*return*/, {
                        data: deliveries.map(function (d) { return (__assign(__assign({}, d), { pickupTime: d.pickupOtpVerifiedAt, deliveryTime: d.actualDeliveryTime })); }),
                        page: page,
                        totalPages: totalPages,
                        pageSize: take,
                        totalCount: totalCount
                    }];
        }
    });
}); };
