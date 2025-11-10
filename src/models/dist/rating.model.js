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
exports.getAggregateRatingsForVendors = exports.getAggregateRating = exports.deleteRating = exports.updateRating = exports.getRatings = exports.getRatingById = exports.createRating = void 0;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
/**
 * Creates a new rating in the database.
 * @param payload - The data for the new rating.
 * @param tx - Optional Prisma transaction client.
 * @returns The created rating.
 */
exports.createRating = function (payload, tx) { return __awaiter(void 0, void 0, Promise, function () {
    var db;
    return __generator(this, function (_a) {
        db = tx || prisma;
        return [2 /*return*/, db.rating.create({
                data: payload
            })];
    });
}); };
/**
 * Retrieves a rating by its unique ID.
 * @param id - The ID of the rating to retrieve.
 * @returns The rating object or null if not found.
 */
exports.getRatingById = function (id) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.rating.findUnique({
                where: { id: id }
            })];
    });
}); };
/**
 * Retrieves a list of ratings based on filters.
 * @param filters - The filtering criteria.
 * @returns An array of rating objects.
 */
exports.getRatings = function (filters) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.rating.findMany({
                where: filters,
                include: {
                    rater: { select: { id: true, name: true } },
                    ratedUser: { select: { id: true, name: true } },
                    ratedVendor: { select: { id: true, name: true } }
                }
            })];
    });
}); };
/**
 * Updates an existing rating.
 * @param id - The ID of the rating to update.
 * @param payload - The data to update.
 * @returns The updated rating.
 */
exports.updateRating = function (id, payload) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.rating.update({
                where: { id: id },
                data: payload
            })];
    });
}); };
/**
 * Deletes a rating from the database.
 * @param id - The ID of the rating to delete.
 * @returns The deleted rating.
 */
exports.deleteRating = function (id) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.rating["delete"]({
                where: { id: id }
            })];
    });
}); };
/**
 * Calculates the aggregate rating (average and count) for a vendor or a user (shopper/deliverer).
 * @param filters - Must contain either `ratedVendorId` or `ratedUserId`.
 * @returns An object with the average rating and total number of ratings.
 */
exports.getAggregateRating = function (filters) { return __awaiter(void 0, void 0, Promise, function () {
    var _a, _avg, _count, count, average;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, prisma.rating.aggregate({
                    where: filters,
                    _avg: { rating: true },
                    _count: { _all: true }
                })];
            case 1:
                _a = _b.sent(), _avg = _a._avg, _count = _a._count;
                count = _count._all;
                average = count > 0 ? (_avg.rating || 0) : 5;
                return [2 /*return*/, { average: average, count: count }];
        }
    });
}); };
exports.getAggregateRatingsForVendors = function (vendorIds) { return __awaiter(void 0, void 0, Promise, function () {
    var aggregates, ratingsMap, _i, aggregates_1, agg;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (vendorIds.length === 0) {
                    return [2 /*return*/, new Map()];
                }
                return [4 /*yield*/, prisma.rating.groupBy({
                        by: ['ratedVendorId'],
                        where: {
                            ratedVendorId: {
                                "in": vendorIds
                            },
                            type: client_1.RatingType.VENDOR
                        },
                        _avg: {
                            rating: true
                        },
                        _count: {
                            ratedVendorId: true
                        }
                    })];
            case 1:
                aggregates = _a.sent();
                ratingsMap = new Map();
                for (_i = 0, aggregates_1 = aggregates; _i < aggregates_1.length; _i++) {
                    agg = aggregates_1[_i];
                    if (agg.ratedVendorId) {
                        ratingsMap.set(agg.ratedVendorId, {
                            average: agg._avg.rating || 0,
                            count: agg._count.ratedVendorId
                        });
                    }
                }
                return [2 /*return*/, ratingsMap];
        }
    });
}); };
