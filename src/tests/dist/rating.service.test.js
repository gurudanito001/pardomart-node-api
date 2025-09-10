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
var client_1 = require("@prisma/client");
var jest_mock_extended_1 = require("jest-mock-extended");
var ratingService = require("../services/rating.service");
var ratingModel = require("../models/rating.model");
var orderModel = require("../models/order.model");
var rating_service_1 = require("../services/rating.service");
// Mock the models to isolate the service layer for testing
jest.mock('../models/rating.model');
jest.mock('../models/order.model');
// Mock the PrismaClient to control its behavior in tests, especially for transactions
var prismaMock = jest_mock_extended_1.mockDeep();
jest.mock('@prisma/client', function () { return (__assign(__assign({}, jest.requireActual('@prisma/client')), { PrismaClient: jest.fn(function () { return prismaMock; }) })); });
describe('Rating Service', function () {
    // Create typed mocks of the imported models
    var mockRatingModel = ratingModel;
    var mockOrderModel = orderModel;
    // Reset mocks before each test to ensure a clean state
    beforeEach(function () {
        jest.clearAllMocks();
    });
    describe('createRatingService', function () {
        var raterId = 'customer-123';
        var orderId = 'order-abc';
        var vendorId = 'vendor-xyz';
        // A standard mock order object that represents a valid state for rating
        var mockOrder = {
            id: orderId,
            userId: raterId,
            vendorId: vendorId,
            orderStatus: client_1.OrderStatus.delivered,
            shopperId: 'shopper-456',
            deliveryPersonId: 'deliverer-789'
        };
        var createVendorRatingPayload = {
            orderId: orderId,
            type: client_1.RatingType.VENDOR,
            rating: 5,
            comment: 'Great service!'
        };
        it('should create a VENDOR rating successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockOrderModel.getOrderById.mockResolvedValue(mockOrder);
                        // Mock the Prisma transaction to simulate a successful database operation
                        prismaMock.$transaction.mockImplementation(function (callback) { return __awaiter(void 0, void 0, void 0, function () {
                            var tx;
                            var _a;
                            return __generator(this, function (_b) {
                                tx = { rating: { findUnique: jest.fn().mockResolvedValue(null) } };
                                mockRatingModel.createRating.mockResolvedValueOnce(__assign(__assign({ id: 'rating-1' }, createVendorRatingPayload), { raterId: raterId, ratedVendorId: vendorId, ratedUserId: null, comment: (_a = createVendorRatingPayload.comment) !== null && _a !== void 0 ? _a : null, createdAt: new Date(), updatedAt: new Date() }));
                                return [2 /*return*/, callback(tx)];
                            });
                        }); });
                        return [4 /*yield*/, ratingService.createRatingService(raterId, createVendorRatingPayload)];
                    case 1:
                        result = _a.sent();
                        expect(mockOrderModel.getOrderById).toHaveBeenCalledWith(orderId);
                        expect(prismaMock.$transaction).toHaveBeenCalled();
                        expect(mockRatingModel.createRating).toHaveBeenCalledWith(expect.objectContaining(__assign(__assign({}, createVendorRatingPayload), { raterId: raterId, ratedVendorId: vendorId })), expect.anything() // The transaction client
                        );
                        expect(result).toBeDefined();
                        expect(result.rating).toBe(5);
                        expect(result.type).toBe(client_1.RatingType.VENDOR);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw a 404 error if order is not found', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockOrderModel.getOrderById.mockResolvedValue(null);
                        return [4 /*yield*/, expect(ratingService.createRatingService(raterId, createVendorRatingPayload))
                                .rejects.toThrow(new rating_service_1.RatingError('Order not found.', 404))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw a 403 error if user is not authorized to rate the order', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockOrderModel.getOrderById.mockResolvedValue(__assign(__assign({}, mockOrder), { userId: 'another-user' }));
                        return [4 /*yield*/, expect(ratingService.createRatingService(raterId, createVendorRatingPayload))
                                .rejects.toThrow(new rating_service_1.RatingError('You are not authorized to rate this order.', 403))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw a 400 error if order is not delivered', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockOrderModel.getOrderById.mockResolvedValue(__assign(__assign({}, mockOrder), { orderStatus: client_1.OrderStatus.pending }));
                        return [4 /*yield*/, expect(ratingService.createRatingService(raterId, createVendorRatingPayload))
                                .rejects.toThrow(new rating_service_1.RatingError('Order must be delivered before it can be rated.', 400))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw a 400 error for an invalid rating value', function () { return __awaiter(void 0, void 0, void 0, function () {
            var invalidPayload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        invalidPayload = __assign(__assign({}, createVendorRatingPayload), { rating: 6 });
                        mockOrderModel.getOrderById.mockResolvedValue(mockOrder);
                        return [4 /*yield*/, expect(ratingService.createRatingService(raterId, invalidPayload))
                                .rejects.toThrow(new rating_service_1.RatingError('Rating must be between 1 and 5.', 400))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw a 409 error if a rating of the same type already exists', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockOrderModel.getOrderById.mockResolvedValue(mockOrder);
                        // Mock transaction to simulate finding an existing rating
                        prismaMock.$transaction.mockImplementation(function (callback) { return __awaiter(void 0, void 0, void 0, function () {
                            var tx;
                            return __generator(this, function (_a) {
                                tx = { rating: { findUnique: jest.fn().mockResolvedValue({ id: 'existing-rating' }) } };
                                return [2 /*return*/, callback(tx)];
                            });
                        }); });
                        return [4 /*yield*/, expect(ratingService.createRatingService(raterId, createVendorRatingPayload))
                                .rejects.toThrow(new rating_service_1.RatingError('A vendor rating for this order already exists.', 409))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should correctly assign ratedUserId for a SHOPPER rating', function () { return __awaiter(void 0, void 0, void 0, function () {
            var shopperRatingPayload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        shopperRatingPayload = __assign(__assign({}, createVendorRatingPayload), { type: client_1.RatingType.SHOPPER });
                        mockOrderModel.getOrderById.mockResolvedValue(mockOrder);
                        prismaMock.$transaction.mockImplementation(function (callback) { return __awaiter(void 0, void 0, void 0, function () {
                            var tx;
                            return __generator(this, function (_a) {
                                tx = { rating: { findUnique: jest.fn().mockResolvedValue(null) } };
                                return [2 /*return*/, callback(tx)];
                            });
                        }); });
                        return [4 /*yield*/, ratingService.createRatingService(raterId, shopperRatingPayload)];
                    case 1:
                        _a.sent();
                        expect(mockRatingModel.createRating).toHaveBeenCalledWith(expect.objectContaining({
                            ratedUserId: mockOrder.shopperId,
                            ratedVendorId: undefined
                        }), expect.anything());
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw a 400 error if trying to rate a shopper on an order without one', function () { return __awaiter(void 0, void 0, void 0, function () {
            var shopperRatingPayload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        shopperRatingPayload = __assign(__assign({}, createVendorRatingPayload), { type: client_1.RatingType.SHOPPER });
                        mockOrderModel.getOrderById.mockResolvedValue(__assign(__assign({}, mockOrder), { shopperId: null }));
                        return [4 /*yield*/, expect(ratingService.createRatingService(raterId, shopperRatingPayload))
                                .rejects.toThrow(new rating_service_1.RatingError('This order does not have an assigned shopper to rate.', 400))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('updateRatingService', function () {
        var ratingId = 'rating-1';
        var raterId = 'customer-123';
        var updatePayload = { comment: 'Updated comment' };
        var existingRating = { id: ratingId, raterId: raterId };
        it('should update a rating successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockRatingModel.getRatingById.mockResolvedValue(existingRating);
                        mockRatingModel.updateRating.mockResolvedValue(__assign(__assign({}, existingRating), updatePayload));
                        return [4 /*yield*/, ratingService.updateRatingService(ratingId, raterId, updatePayload)];
                    case 1:
                        result = _a.sent();
                        expect(mockRatingModel.getRatingById).toHaveBeenCalledWith(ratingId);
                        expect(mockRatingModel.updateRating).toHaveBeenCalledWith(ratingId, updatePayload);
                        expect(result.comment).toBe('Updated comment');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw a 403 error if user is not authorized to update the rating', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockRatingModel.getRatingById.mockResolvedValue(existingRating);
                        return [4 /*yield*/, expect(ratingService.updateRatingService(ratingId, 'another-user-id', updatePayload))
                                .rejects.toThrow(new rating_service_1.RatingError('You are not authorized to update this rating.', 403))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getAggregateRatingService', function () {
        it('should get aggregate rating for a vendor', function () { return __awaiter(void 0, void 0, void 0, function () {
            var aggregateData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        aggregateData = { average: 4.5, count: 10 };
                        mockRatingModel.getAggregateRating.mockResolvedValue(aggregateData);
                        return [4 /*yield*/, ratingService.getAggregateRatingService({ ratedVendorId: 'vendor-1' })];
                    case 1:
                        result = _a.sent();
                        expect(mockRatingModel.getAggregateRating).toHaveBeenCalledWith({ ratedVendorId: 'vendor-1' });
                        expect(result).toEqual(aggregateData);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw an error if no ID is provided', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expect(ratingService.getAggregateRatingService({}))
                            .rejects.toThrow(new rating_service_1.RatingError('A vendor ID or user ID must be provided to get aggregate ratings.', 400))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
