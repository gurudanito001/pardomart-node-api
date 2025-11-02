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
exports.adminUpdateDeliveryPersonProfileController = exports.adminGetDeliveryHistoryController = exports.adminGetDeliveryPersonDetailsByIdController = exports.adminListAllDeliveryPersonsController = exports.getAdminDeliveryPersonOverviewController = void 0;
var deliveryPersonService = require("../services/delivery-person.service");
/**
 * @swagger
 * tags:
 *   name: Delivery Persons
 *   description: Admin management of delivery persons
 */
/**
 * @swagger
 * /delivery-persons/admin/overview:
 *   get:
 *     summary: Get platform-wide delivery person overview data (Admin)
 *     tags: [Delivery Persons, Admin]
 *     description: Retrieves aggregate data about delivery persons, such as total count, new sign-ups, and total deliveries. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: The number of past days to count for "new delivery persons".
 *     responses:
 *       200:
 *         description: An object containing the delivery person overview data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalDeliveryPersons: { type: integer }
 *                 newDeliveryPersons: { type: integer }
 *                 totalDeliveries: { type: integer }
 *                 totalReturns: { type: integer }
 *       500:
 *         description: Internal server error.
 */
exports.getAdminDeliveryPersonOverviewController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var days, overviewData, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                days = req.query.days ? parseInt(req.query.days, 10) : 30;
                return [4 /*yield*/, deliveryPersonService.getDeliveryPersonOverviewService(days)];
            case 1:
                overviewData = _a.sent();
                res.status(200).json(overviewData);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error getting delivery person overview data:', error_1);
                res.status(500).json({ error: 'An unexpected error occurred.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /delivery-persons/admin/all:
 *   get:
 *     summary: Get a paginated list of all delivery persons (Admin)
 *     tags: [Delivery Persons, Admin]
 *     description: Retrieves a paginated list of all users with the 'delivery_person' role. Allows filtering by name, status, number of deliveries, and creation date.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: name, schema: { type: string }, description: "Filter by name (case-insensitive)." }
 *       - { in: query, name: status, schema: { type: boolean }, description: "Filter by active status (true/false)." }
 *       - { in: query, name: minDeliveries, schema: { type: integer }, description: "Filter by minimum number of completed deliveries." }
 *       - { in: query, name: maxDeliveries, schema: { type: integer }, description: "Filter by maximum number of completed deliveries." }
 *       - { in: query, name: createdAtStart, schema: { type: string, format: date-time }, description: "Filter users created on or after this date." }
 *       - { in: query, name: createdAtEnd, schema: { type: string, format: date-time }, description: "Filter users created on or before this date." }
 *       - { in: query, name: page, schema: { type: integer, default: 1 }, description: "Page number for pagination." }
 *       - { in: query, name: size, schema: { type: integer, default: 20 }, description: "Number of items per page." }
 *     responses:
 *       200:
 *         description: A paginated list of delivery persons.
 *       500:
 *         description: Internal server error.
 */
exports.adminListAllDeliveryPersonsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, status, minDeliveries, maxDeliveries, createdAtStart, createdAtEnd, parseBoolean, filters, page, take, result, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, name = _a.name, status = _a.status, minDeliveries = _a.minDeliveries, maxDeliveries = _a.maxDeliveries, createdAtStart = _a.createdAtStart, createdAtEnd = _a.createdAtEnd;
                parseBoolean = function (value) {
                    if (value === 'true')
                        return true;
                    if (value === 'false')
                        return false;
                    return undefined;
                };
                filters = {
                    name: name,
                    status: parseBoolean(status),
                    minDeliveries: minDeliveries ? parseInt(minDeliveries) : undefined,
                    maxDeliveries: maxDeliveries ? parseInt(maxDeliveries) : undefined,
                    createdAtStart: createdAtStart,
                    createdAtEnd: createdAtEnd
                };
                page = parseInt(req.query.page) || 1;
                take = parseInt(req.query.size) || 20;
                return [4 /*yield*/, deliveryPersonService.adminListAllDeliveryPersonsService(filters, { page: page, take: take })];
            case 1:
                result = _b.sent();
                res.status(200).json(result);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _b.sent();
                console.error('Error in adminListAllDeliveryPersonsController:', error_2);
                res.status(500).json({ error: 'An unexpected error occurred.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /delivery-persons/admin/{id}:
 *   get:
 *     summary: Get a single delivery person's details (Admin)
 *     tags: [Delivery Persons, Admin]
 *     description: Retrieves detailed information for a specific delivery person, including their profile, delivery statistics, and recent delivery history.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the delivery person to retrieve.
 *     responses:
 *       200:
 *         description: The delivery person's detailed information.
 *       404:
 *         description: Delivery person not found.
 *       500:
 *         description: Internal server error.
 */
exports.adminGetDeliveryPersonDetailsByIdController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, deliveryPersonDetails, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, deliveryPersonService.adminGetDeliveryPersonDetailsByIdService(id)];
            case 1:
                deliveryPersonDetails = _a.sent();
                if (!deliveryPersonDetails) {
                    return [2 /*return*/, res.status(404).json({ error: 'Delivery person not found.' })];
                }
                res.status(200).json(deliveryPersonDetails);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error in adminGetDeliveryPersonDetailsByIdController:', error_3);
                res.status(500).json({ error: 'An unexpected error occurred.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /delivery-persons/admin/{id}/deliveries:
 *   get:
 *     summary: Get a paginated delivery history for a single delivery person (Admin)
 *     tags: [Delivery Persons, Admin]
 *     description: Retrieves a paginated list of all completed deliveries for a specific delivery person.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the delivery person.
 *       - { in: query, name: page, schema: { type: integer, default: 1 }, description: "Page number for pagination." }
 *       - { in: query, name: size, schema: { type: integer, default: 20 }, description: "Number of items per page." }
 *     responses:
 *       200:
 *         description: A paginated list of the delivery person's completed deliveries.
 *       404:
 *         description: Delivery person not found.
 *       500:
 *         description: Internal server error.
 */
exports.adminGetDeliveryHistoryController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, page, take, deliveryPerson, history, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                id = req.params.id;
                page = parseInt(req.query.page) || 1;
                take = parseInt(req.query.size) || 20;
                return [4 /*yield*/, deliveryPersonService.adminGetDeliveryPersonDetailsByIdService(id)];
            case 1:
                deliveryPerson = _a.sent();
                if (!deliveryPerson) {
                    return [2 /*return*/, res.status(404).json({ error: 'Delivery person not found.' })];
                }
                return [4 /*yield*/, deliveryPersonService.adminGetDeliveryHistoryService(id, { page: page, take: take })];
            case 2:
                history = _a.sent();
                res.status(200).json(history);
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                console.error('Error in adminGetDeliveryHistoryController:', error_4);
                res.status(500).json({ error: 'An unexpected error occurred.' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /delivery-persons/admin/{id}:
 *   patch:
 *     summary: Update a delivery person's profile (Admin)
 *     tags: [Delivery Persons, Admin]
 *     description: >
 *       Allows an admin to update a delivery person's profile details.
 *       This is primarily used to suspend or reactivate an account by setting the `active` field to `false` or `true`.
 *       Other fields like `name`, `email`, etc., can also be updated.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the delivery person to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserPayload'
 *     responses:
 *       200:
 *         description: The updated delivery person profile.
 *       404:
 *         description: Delivery person not found.
 *       500:
 *         description: Internal server error.
 */
exports.adminUpdateDeliveryPersonProfileController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, updates, updatedUser, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                updates = req.body;
                return [4 /*yield*/, deliveryPersonService.adminUpdateDeliveryPersonProfileService(id, updates)];
            case 1:
                updatedUser = _a.sent();
                res.status(200).json(updatedUser);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                res.status(error_5.message.includes('not found') ? 404 : 500).json({ error: error_5.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
