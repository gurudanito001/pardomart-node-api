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
exports.getAggregateRatingsForVendorsService = exports.getAggregateRatingService = exports.deleteRatingService = exports.updateRatingService = exports.getRatingsService = exports.getRatingByIdService = exports.createRatingService = exports.RatingError = void 0;
var client_1 = require("@prisma/client");
var ratingModel = require("../models/rating.model");
var orderModel = require("../models/order.model");
var prisma = new client_1.PrismaClient();
var RatingError = /** @class */ (function (_super) {
    __extends(RatingError, _super);
    function RatingError(message, statusCode) {
        if (statusCode === void 0) { statusCode = 400; }
        var _this = _super.call(this, message) || this;
        _this.name = 'RatingError';
        _this.statusCode = statusCode;
        return _this;
    }
    return RatingError;
}(Error));
exports.RatingError = RatingError;
/**
 * Creates a new rating for an order.
 * It performs several validations before creating the rating.
 * @param raterId - The ID of the user submitting the rating.
 * @param payload - The rating data.
 * @returns The created rating.
 */
exports.createRatingService = function (raterId, payload) { return __awaiter(void 0, void 0, Promise, function () {
    var orderId, type, rating, order, ratingData, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                orderId = payload.orderId, type = payload.type, rating = payload.rating;
                return [4 /*yield*/, orderModel.getOrderById(orderId)];
            case 1:
                order = _a.sent();
                if (!order) {
                    throw new RatingError('Order not found.', 404);
                }
                if (order.userId !== raterId) {
                    throw new RatingError('You are not authorized to rate this order.', 403);
                }
                if (order.orderStatus !== client_1.OrderStatus.delivered) {
                    throw new RatingError('Order must be delivered before it can be rated.', 400);
                }
                // 2. Validate rating value
                if (rating < 1 || rating > 5) {
                    throw new RatingError('Rating must be between 1 and 5.', 400);
                }
                ratingData = __assign(__assign({}, payload), { raterId: raterId });
                switch (type) {
                    case client_1.RatingType.VENDOR:
                        ratingData.ratedVendorId = order.vendorId;
                        break;
                    case client_1.RatingType.SHOPPER:
                        if (!order.shopperId)
                            throw new RatingError('This order does not have an assigned shopper to rate.', 400);
                        ratingData.ratedUserId = order.shopperId;
                        break;
                    case client_1.RatingType.DELIVERER:
                        if (!order.deliveryPersonId)
                            throw new RatingError('This order does not have an assigned deliverer to rate.', 400);
                        ratingData.ratedUserId = order.deliveryPersonId;
                        break;
                    default:
                        throw new RatingError('Invalid rating type specified.', 400);
                }
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        var existingRating;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tx.rating.findUnique({
                                        where: { orderId_type: { orderId: orderId, type: type } }
                                    })];
                                case 1:
                                    existingRating = _a.sent();
                                    if (existingRating) {
                                        throw new RatingError("A " + type.toLowerCase() + " rating for this order already exists.", 409);
                                    }
                                    return [2 /*return*/, ratingModel.createRating(ratingData, tx)];
                            }
                        });
                    }); })];
            case 3: return [2 /*return*/, _a.sent()];
            case 4:
                error_1 = _a.sent();
                if (error_1 instanceof RatingError)
                    throw error_1;
                if (error_1 instanceof client_1.Prisma.PrismaClientKnownRequestError && error_1.code === 'P2002') {
                    throw new RatingError("A " + type.toLowerCase() + " rating for this order already exists.", 409);
                }
                console.error('Error creating rating:', error_1);
                throw new RatingError('Could not create rating.', 500);
            case 5: return [2 /*return*/];
        }
    });
}); };
/**
 * Retrieves a rating by its ID.
 * @param id - The ID of the rating.
 * @returns The rating object or null.
 */
exports.getRatingByIdService = function (id) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, ratingModel.getRatingById(id)];
    });
}); };
/**
 * Retrieves a list of ratings based on filters.
 * @param filters - The filtering criteria.
 * @returns An array of rating objects.
 */
exports.getRatingsService = function (filters) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, ratingModel.getRatings(filters)];
    });
}); };
/**
 * Updates a rating.
 * @param id - The ID of the rating to update.
 * @param raterId - The ID of the user attempting to update, for authorization.
 * @param payload - The data to update.
 * @returns The updated rating.
 */
exports.updateRatingService = function (id, raterId, payload) { return __awaiter(void 0, void 0, Promise, function () {
    var rating;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ratingModel.getRatingById(id)];
            case 1:
                rating = _a.sent();
                if (!rating)
                    throw new RatingError('Rating not found.', 404);
                if (rating.raterId !== raterId)
                    throw new RatingError('You are not authorized to update this rating.', 403);
                return [2 /*return*/, ratingModel.updateRating(id, payload)];
        }
    });
}); };
/**
 * Deletes a rating.
 * @param id - The ID of the rating to delete.
 * @param raterId - The ID of the user attempting to delete, for authorization.
 * @returns The deleted rating.
 */
exports.deleteRatingService = function (id, raterId) { return __awaiter(void 0, void 0, Promise, function () {
    var rating;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ratingModel.getRatingById(id)];
            case 1:
                rating = _a.sent();
                if (!rating)
                    throw new RatingError('Rating not found.', 404);
                if (rating.raterId !== raterId)
                    throw new RatingError('You are not authorized to delete this rating.', 403);
                return [2 /*return*/, ratingModel.deleteRating(id)];
        }
    });
}); };
/**
 * Gets the aggregate rating for a vendor or user.
 * @param filters - Must contain either `ratedVendorId` or `ratedUserId`.
 * @returns An object with average rating and total count.
 */
exports.getAggregateRatingService = function (filters) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        if (!filters.ratedVendorId && !filters.ratedUserId) {
            throw new RatingError('A vendor ID or user ID must be provided to get aggregate ratings.', 400);
        }
        return [2 /*return*/, ratingModel.getAggregateRating(filters)];
    });
}); };
/**
 * Gets aggregate ratings for a list of vendor IDs.
 * @param vendorIds - An array of vendor IDs.
 * @returns A Map where keys are vendor IDs and values are their aggregate rating.
 */
exports.getAggregateRatingsForVendorsService = function (vendorIds) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        if (vendorIds.length === 0)
            return [2 /*return*/, new Map()];
        return [2 /*return*/, ratingModel.getAggregateRatingsForVendors(vendorIds)];
    });
}); };
