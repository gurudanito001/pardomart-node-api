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
exports.adminListCustomerTransactionsController = exports.adminUpdateCustomerProfileController = exports.adminGetCustomerDetailsController = exports.adminListAllCustomersController = exports.getAdminCustomerOverviewController = exports.listCustomerTransactionsController = exports.listCustomersController = void 0;
var customerService = require("../services/customer.service");
var client_1 = require("@prisma/client");
/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management for vendors
 */
/**
 * @swagger
 * /customers:
 *   get:
 *     summary: List customers for a vendor, admin, or shopper
 *     tags: [Customers]
 *     description: >
 *       Retrieves a list of unique customers who have patronized a store.
 *       - **Vendor**: Can see customers from all their stores. Can filter by a specific `vendorId`.
 *       - **Store Admin/Shopper**: Can only see customers from their assigned store. The `vendorId` filter is ignored.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         schema: { type: string, format: uuid }
 *         description: Optional. For vendors, filters customers by a specific store ID. For staff, this parameter is ignored.
 *     responses:
 *       200:
 *         description: A list of customers who have made a purchase from the vendor's store(s).
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserSummary'
 *       403:
 *         description: Forbidden. The authenticated user does not have permission.
 *       500:
 *         description: Internal server error.
 */
exports.listCustomersController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, userRole, staffVendorId, queryVendorId, vendorIdToQuery, ownerId, customers, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                userRole = req.userRole;
                staffVendorId = req.vendorId;
                queryVendorId = req.query.vendorId;
                vendorIdToQuery = void 0;
                ownerId = void 0;
                switch (userRole) {
                    case client_1.Role.vendor:
                        ownerId = userId;
                        vendorIdToQuery = queryVendorId; // A vendor can filter by any of their stores.
                        break;
                    case client_1.Role.store_admin:
                    case client_1.Role.store_shopper:
                        if (!staffVendorId) {
                            return [2 /*return*/, res.status(403).json({ error: 'Forbidden: You are not assigned to a store.' })];
                        }
                        // Staff can only see customers of their assigned store.
                        vendorIdToQuery = staffVendorId;
                        break;
                    default:
                        return [2 /*return*/, res.status(403).json({ error: 'Forbidden: Your role does not permit this action.' })];
                }
                return [4 /*yield*/, customerService.listCustomersService({ ownerId: ownerId, vendorId: vendorIdToQuery })];
            case 1:
                customers = _a.sent();
                res.status(200).json(customers);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error listing customers:', error_1);
                if (error_1.message.includes('Unauthorized')) {
                    return [2 /*return*/, res.status(403).json({ error: error_1.message })];
                }
                res.status(500).json({ error: 'An unexpected error occurred while listing customers.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /customers/{customerId}/transactions:
 *   get:
 *     summary: List all transactions for a specific customer
 *     tags: [Customers, Transactions]
 *     description: >
 *       Retrieves a list of all transactions for a given customer, with role-based access:
 *       - **Vendor**: Can view all transactions for the customer across all their stores. Can optionally filter by a specific `vendorId` (store ID).
 *       - **Store Admin**: Can only view transactions for the customer within their assigned store. The `vendorId` filter is ignored.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The ID of the customer.
 *       - in: query
 *         name: vendorId
 *         schema: { type: string, format: uuid }
 *         description: Optional. For Vendors, filters transactions by a specific store ID. Ignored for other roles.
 *     responses:
 *       200:
 *         description: A list of the customer's transactions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       403:
 *         description: Forbidden. The authenticated user does not have permission.
 *       404:
 *         description: Not Found. The customer has no history with the specified vendor(s).
 *       500:
 *         description: Internal server error.
 */
exports.listCustomerTransactionsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var requestingUserId, requestingUserRole, staffVendorId, customerId, vendorId, transactions, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                requestingUserId = req.userId;
                requestingUserRole = req.userRole;
                staffVendorId = req.vendorId;
                customerId = req.params.customerId;
                vendorId = req.query.vendorId;
                return [4 /*yield*/, customerService.listCustomerTransactionsService(requestingUserId, requestingUserRole, staffVendorId, vendorId, customerId)];
            case 1:
                transactions = _a.sent();
                res.status(200).json(transactions);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error listing customer transactions for vendor:', error_2);
                if (error_2.message.includes('Unauthorized') || error_2.message.includes('Forbidden')) {
                    return [2 /*return*/, res.status(403).json({ error: error_2.message })];
                }
                if (error_2.message.includes('Customer has not placed any orders')) {
                    return [2 /*return*/, res.status(404).json({ error: error_2.message })];
                }
                res.status(500).json({ error: error_2.message || 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /customers/admin/overview:
 *   get:
 *     summary: Get platform-wide customer overview data (Admin)
 *     tags: [Customers, Admin]
 *     description: Retrieves aggregate data about customers, such as total customers, total completed orders (invoices), and new customers in a given period. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: The number of past days to count for "new customers".
 *     responses:
 *       200:
 *         description: An object containing the customer overview data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCustomers: { type: integer }
 *                 totalCompletedOrders: { type: integer }
 *                 newCustomers: { type: integer }
 *       500:
 *         description: Internal server error.
 */
exports.getAdminCustomerOverviewController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var days, overviewData, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                days = req.query.days ? parseInt(req.query.days, 10) : 30;
                return [4 /*yield*/, customerService.getAdminCustomerOverviewService(days)];
            case 1:
                overviewData = _a.sent();
                res.status(200).json(overviewData);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error getting customer overview data:', error_3);
                res.status(500).json({ error: 'An unexpected error occurred.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /customers/admin/all:
 *   get:
 *     summary: Get a paginated list of all customers (Admin)
 *     tags: [Customers, Admin]
 *     description: Retrieves a paginated list of all users with the 'customer' role. Allows filtering by name, status, amount spent, and creation date. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: name, schema: { type: string }, description: "Filter by customer name (case-insensitive)." }
 *       - { in: query, name: status, schema: { type: boolean }, description: "Filter by active status (true/false)." }
 *       - { in: query, name: minAmountSpent, schema: { type: number }, description: "Filter by minimum total amount spent." }
 *       - { in: query, name: maxAmountSpent, schema: { type: number }, description: "Filter by maximum total amount spent." }
 *       - { in: query, name: createdAtStart, schema: { type: string, format: date-time }, description: "Filter customers created on or after this date." }
 *       - { in: query, name: createdAtEnd, schema: { type: string, format: date-time }, description: "Filter customers created on or before this date." }
 *       - { in: query, name: page, schema: { type: integer, default: 1 }, description: "Page number for pagination." }
 *       - { in: query, name: size, schema: { type: integer, default: 20 }, description: "Number of items per page." }
 *     responses:
 *       200:
 *         description: A paginated list of customers.
 *       500:
 *         description: Internal server error.
 */
exports.adminListAllCustomersController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, status, minAmountSpent, maxAmountSpent, createdAtStart, createdAtEnd, parseBoolean, filters, page, take, result, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, name = _a.name, status = _a.status, minAmountSpent = _a.minAmountSpent, maxAmountSpent = _a.maxAmountSpent, createdAtStart = _a.createdAtStart, createdAtEnd = _a.createdAtEnd;
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
                    minAmountSpent: minAmountSpent ? parseFloat(minAmountSpent) : undefined,
                    maxAmountSpent: maxAmountSpent ? parseFloat(maxAmountSpent) : undefined,
                    createdAtStart: createdAtStart,
                    createdAtEnd: createdAtEnd
                };
                page = parseInt(req.query.page) || 1;
                take = parseInt(req.query.size) || 20;
                return [4 /*yield*/, customerService.adminListAllCustomersService(filters, { page: page, take: take })];
            case 1:
                result = _b.sent();
                res.status(200).json(result);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _b.sent();
                console.error('Error in adminListAllCustomersController:', error_4);
                res.status(500).json({ error: 'An unexpected error occurred.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /customers/admin/{customerId}:
 *   get:
 *     summary: Get a single customer's details (Admin)
 *     tags: [Customers, Admin]
 *     description: Retrieves detailed information for a specific customer, including their profile and order statistics (total, completed, cancelled). Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the customer to retrieve.
 *     responses:
 *       200:
 *         description: The customer's detailed information.
 *       404:
 *         description: Customer not found.
 *       500:
 *         description: Internal server error.
 */
exports.adminGetCustomerDetailsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var customerId, customerDetails, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                customerId = req.params.customerId;
                return [4 /*yield*/, customerService.adminGetCustomerDetailsService(customerId)];
            case 1:
                customerDetails = _a.sent();
                res.status(200).json(customerDetails);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                if (error_5.message.includes('not found')) {
                    return [2 /*return*/, res.status(404).json({ error: error_5.message })];
                }
                console.error('Error in adminGetCustomerDetailsController:', error_5);
                res.status(500).json({ error: 'An unexpected error occurred.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /customers/admin/{customerId}:
 *   patch:
 *     summary: Update a customer's profile (Admin)
 *     tags: [Customers, Admin]
 *     description: >
 *       Allows an admin to update a customer's profile details.
 *       This is primarily used to suspend or reactivate an account by setting the `active` field to `false` or `true`.
 *       Other fields like `name`, `email`, etc., can also be updated.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the customer to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserPayload'
 *     responses:
 *       200:
 *         description: The updated customer profile.
 *       404:
 *         description: Customer not found.
 *       500:
 *         description: Internal server error.
 */
exports.adminUpdateCustomerProfileController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var customerId, updates, updatedCustomer, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                customerId = req.params.customerId;
                updates = req.body;
                return [4 /*yield*/, customerService.adminUpdateCustomerProfileService(customerId, updates)];
            case 1:
                updatedCustomer = _a.sent();
                res.status(200).json(updatedCustomer);
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                res.status(error_6.message.includes('not found') ? 404 : 500).json({ error: error_6.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /customers/admin/{customerId}/transactions:
 *   get:
 *     summary: Get a paginated list of a customer's transactions (Admin)
 *     tags: [Customers, Admin, Transactions]
 *     description: Retrieves a paginated list of all transactions for a specific customer. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The ID of the customer.
 *       - { in: query, name: page, schema: { type: integer, default: 1 }, description: "Page number for pagination." }
 *       - { in: query, name: size, schema: { type: integer, default: 20 }, description: "Number of items per page." }
 *     responses:
 *       200:
 *         description: A paginated list of the customer's transactions.
 *       404:
 *         description: Customer not found.
 *       500:
 *         description: Internal server error.
 */
exports.adminListCustomerTransactionsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var customerId, page, take, result, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                customerId = req.params.customerId;
                page = parseInt(req.query.page) || 1;
                take = parseInt(req.query.size) || 20;
                return [4 /*yield*/, customerService.adminListCustomerTransactionsService(customerId, { page: page, take: take })];
            case 1:
                result = _a.sent();
                res.status(200).json(result);
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                if (error_7.message.includes('not found')) {
                    return [2 /*return*/, res.status(404).json({ error: error_7.message })];
                }
                res.status(500).json({ error: 'An unexpected error occurred.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
