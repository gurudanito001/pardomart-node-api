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
exports.getRatingByIdController = exports.getAggregateRatingController = exports.getRatingsController = exports.deleteRatingController = exports.updateRatingController = exports.createRatingController = void 0;
var ratingService = require("../services/rating.service");
var rating_service_1 = require("../services/rating.service");
/**
 * @swagger
 * /ratings:
 *   post:
 *     summary: Create a new rating for an order
 *     tags: [Rating]
 *     security:
 *       - bearerAuth: []
 *     description: Allows a customer to submit a rating for a completed order. The rating can be for a VENDOR, SHOPPER, or DELIVERER. A user can only submit one rating of each type per order.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRatingPayload'
 *     responses:
 *       201:
 *         description: The created rating.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rating'
 *       400:
 *         description: Bad request (e.g., invalid rating value, order not delivered).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not the customer for this order).
 *       404:
 *         description: Order not found.
 *       409:
 *         description: Conflict (a rating of this type already exists for this order).
 * components:
 *   schemas:
 *     RatingType:
 *       type: string
 *       enum: [VENDOR, SHOPPER, DELIVERER]
 *     UserSummary:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         name: { type: string, nullable: true }
 *     VendorSummary:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         name: { type: string }
 *     Rating:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         orderId: { type: string, format: uuid }
 *         raterId: { type: string, format: uuid }
 *         ratedVendorId: { type: string, format: uuid, nullable: true }
 *         ratedUserId: { type: string, format: uuid, nullable: true }
 *         rating: { type: integer, minimum: 1, maximum: 5 }
 *         comment: { type: string, nullable: true }
 *         type: { $ref: '#/components/schemas/RatingType' }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     RatingWithRelations:
 *       allOf:
 *         - $ref: '#/components/schemas/Rating'
 *         - type: object
 *           properties:
 *             rater:
 *               $ref: '#/components/schemas/UserSummary'
 *             ratedUser:
 *               $ref: '#/components/schemas/UserSummary'
 *               nullable: true
 *             ratedVendor:
 *               $ref: '#/components/schemas/VendorSummary'
 *               nullable: true
 *     CreateRatingPayload:
 *       type: object
 *       required: [orderId, rating, type]
 *       description: "When creating a rating, either `ratedVendorId` or `ratedUserId` must be provided depending on the `type`."
 *       properties:
 *         orderId: { type: string, format: uuid }
 *         rating: { type: integer, minimum: 1, maximum: 5, description: "The rating score from 1 to 5." }
 *         comment: { type: string, nullable: true }
 *         type: { $ref: '#/components/schemas/RatingType' }
 *         ratedVendorId: { type: string, format: uuid, description: "Required if type is VENDOR." }
 *         ratedUserId: { type: string, format: uuid, description: "Required if type is SHOPPER or DELIVERER." }
 *     UpdateRatingPayload:
 *       type: object
 *       properties:
 *         rating: { type: integer, minimum: 1, maximum: 5 }
 *         comment: { type: string, nullable: true }
 */
exports.createRatingController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var raterId, payload, rating, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                raterId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!raterId) {
                    return [2 /*return*/, res.status(401).json({ error: 'Unauthorized' })];
                }
                payload = req.body;
                return [4 /*yield*/, ratingService.createRatingService(raterId, payload)];
            case 1:
                rating = _b.sent();
                res.status(201).json(rating);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                if (error_1 instanceof rating_service_1.RatingError) {
                    return [2 /*return*/, res.status(error_1.statusCode).json({ error: error_1.message })];
                }
                console.error('Error creating rating:', error_1);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /ratings/{id}:
 *   patch:
 *     summary: Update a rating
 *     tags: [Rating]
 *     security:
 *       - bearerAuth: []
 *     description: Allows a customer to update their own rating for an order.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the rating to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRatingPayload'
 *     responses:
 *       200:
 *         description: The updated rating.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rating'
 *       400:
 *         description: Bad request (e.g., invalid rating value).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not the original rater).
 *       404:
 *         description: Rating not found.
 */
exports.updateRatingController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var raterId, id, payload, updatedRating, error_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                raterId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!raterId) {
                    return [2 /*return*/, res.status(401).json({ error: 'Unauthorized' })];
                }
                id = req.params.id;
                payload = req.body;
                return [4 /*yield*/, ratingService.updateRatingService(id, raterId, payload)];
            case 1:
                updatedRating = _b.sent();
                res.status(200).json(updatedRating);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _b.sent();
                if (error_2 instanceof rating_service_1.RatingError) {
                    return [2 /*return*/, res.status(error_2.statusCode).json({ error: error_2.message })];
                }
                console.error('Error updating rating:', error_2);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /ratings/{id}:
 *   delete:
 *     summary: Delete a rating
 *     tags: [Rating]
 *     security:
 *       - bearerAuth: []
 *     description: Allows a customer to delete their own rating.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the rating to delete.
 *     responses:
 *       200:
 *         description: The deleted rating.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rating'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not the original rater).
 *       404:
 *         description: Rating not found.
 */
exports.deleteRatingController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var raterId, id, deletedRating, error_3;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                raterId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!raterId) {
                    return [2 /*return*/, res.status(401).json({ error: 'Unauthorized' })];
                }
                id = req.params.id;
                return [4 /*yield*/, ratingService.deleteRatingService(id, raterId)];
            case 1:
                deletedRating = _b.sent();
                res.status(200).json(deletedRating);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _b.sent();
                if (error_3 instanceof rating_service_1.RatingError) {
                    return [2 /*return*/, res.status(error_3.statusCode).json({ error: error_3.message })];
                }
                console.error('Error deleting rating:', error_3);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /ratings:
 *   get:
 *     summary: Get a list of ratings
 *     tags: [Rating]
 *     description: Retrieves a list of ratings, with optional filters.
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema: { type: string, format: uuid }
 *         description: Filter ratings by a specific order ID.
 *       - in: query
 *         name: raterId
 *         schema: { type: string, format: uuid }
 *         description: Filter ratings by the user who submitted them.
 *       - in: query
 *         name: ratedVendorId
 *         schema: { type: string, format: uuid }
 *         description: Filter ratings for a specific vendor.
 *       - in: query
 *         name: ratedUserId
 *         schema: { type: string, format: uuid }
 *         description: Filter ratings for a specific user (shopper or deliverer).
 *       - in: query
 *         name: type
 *         schema: { $ref: '#/components/schemas/RatingType' }
 *         description: Filter by the type of rating.
 *     responses:
 *       200:
 *         description: A list of ratings.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RatingWithRelations'
 */
exports.getRatingsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, orderId, raterId, ratedVendorId, ratedUserId, type, filters_1, ratings, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, orderId = _a.orderId, raterId = _a.raterId, ratedVendorId = _a.ratedVendorId, ratedUserId = _a.ratedUserId, type = _a.type;
                filters_1 = {
                    orderId: orderId,
                    raterId: raterId,
                    ratedVendorId: ratedVendorId,
                    ratedUserId: ratedUserId,
                    type: type
                };
                Object.keys(filters_1).forEach(function (key) {
                    if (filters_1[key] === undefined) {
                        delete filters_1[key];
                    }
                });
                return [4 /*yield*/, ratingService.getRatingsService(filters_1)];
            case 1:
                ratings = _b.sent();
                res.json(ratings);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _b.sent();
                console.error('Error getting ratings:', error_4);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /ratings/aggregate:
 *   get:
 *     summary: Get aggregate rating for a vendor or user
 *     tags: [Rating]
 *     description: Calculates the average rating and total count of ratings for a specific vendor, shopper, or deliverer.
 *     parameters:
 *       - in: query
 *         name: ratedVendorId
 *         schema: { type: string, format: uuid }
 *         description: The ID of the vendor to get aggregate ratings for.
 *       - in: query
 *         name: ratedUserId
 *         schema: { type: string, format: uuid }
 *         description: The ID of the user (shopper/deliverer) to get aggregate ratings for.
 *     responses:
 *       200:
 *         description: The aggregate rating data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 average:
 *                   type: number
 *                   format: float
 *                   description: The average rating score.
 *                 count:
 *                   type: integer
 *                   description: The total number of ratings.
 *       400:
 *         description: Bad request (e.g., neither ratedVendorId nor ratedUserId is provided).
 */
exports.getAggregateRatingController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, ratedVendorId, ratedUserId, filters, aggregate, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, ratedVendorId = _a.ratedVendorId, ratedUserId = _a.ratedUserId;
                filters = {
                    ratedVendorId: ratedVendorId,
                    ratedUserId: ratedUserId
                };
                return [4 /*yield*/, ratingService.getAggregateRatingService(filters)];
            case 1:
                aggregate = _b.sent();
                res.json(aggregate);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _b.sent();
                if (error_5 instanceof rating_service_1.RatingError) {
                    return [2 /*return*/, res.status(error_5.statusCode).json({ error: error_5.message })];
                }
                console.error('Error getting aggregate rating:', error_5);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /ratings/{id}:
 *   get:
 *     summary: Get a single rating by ID
 *     tags: [Rating]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the rating to retrieve.
 *     responses:
 *       200:
 *         description: The requested rating.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rating'
 *       404:
 *         description: Rating not found.
 */
exports.getRatingByIdController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, rating, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, ratingService.getRatingByIdService(id)];
            case 1:
                rating = _a.sent();
                if (!rating) {
                    return [2 /*return*/, res.status(404).json({ error: 'Rating not found' })];
                }
                res.json(rating);
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Error getting rating by ID:', error_6);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
