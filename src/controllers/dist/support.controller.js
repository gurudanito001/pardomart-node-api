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
exports.getSupportTicketOverviewController = exports.updateSupportTicketStatusController = exports.getAllSupportTicketsController = exports.getSupportTicketByIdController = exports.getMySupportTicketsController = exports.createSupportTicketController = void 0;
var support_service_1 = require("../services/support.service");
/**
 * @swagger
 * tags:
 *   name: Support
 *   description: Support ticket management
 */
/**
 * @swagger
 * /support/tickets:
 *   post:
 *     summary: Create a new support ticket
 *     tags: [Support]
 *     description: Allows an authenticated user (customer, vendor, etc.) to submit a support ticket for issues or bugs.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json: { "schema": { "$ref": "#/components/schemas/CreateSupportTicketPayload" } }
 *     responses:
 *       201:
 *         description: The created support ticket.
 *         content:
 *           application/json: { "schema": { "$ref": "#/components/schemas/SupportTicket" } }
 *       400:
 *         description: Bad request (e.g., invalid input).
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 * components:
 *   schemas:
 *     TicketCategory:
 *       type: string
 *       enum: [BUG_REPORT, FEATURE_REQUEST, ORDER_ISSUE, PAYMENT_ISSUE, ACCOUNT_ISSUE, OTHER]
 *     TicketStatus:
 *       type: string
 *       enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED]
 *     SupportTicket:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         userId: { type: string, format: uuid }
 *         title: { type: string }
 *         description: { type: string }
 *         category: { $ref: '#/components/schemas/TicketCategory' }
 *         status: { $ref: '#/components/schemas/TicketStatus' }
 *         meta: { type: object, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     CreateSupportTicketPayload:
 *       type: object
 *       required: [title, description, category]
 *       properties:
 *         title:
 *           type: string
 *           example: "App crashes on checkout"
 *         description:
 *           type: string
 *           example: "When I try to checkout my cart, the app closes unexpectedly."
 *         category:
 *           $ref: '#/components/schemas/TicketCategory'
 *         meta:
 *           type: object
 *           description: "Optional. e.g., { \"orderId\": \"uuid-goes-here\" }"
 *           nullable: true
 *     UpdateSupportTicketStatusPayload:
 *       type: object
 *       required: [status]
 *       properties:
 *         status:
 *           $ref: '#/components/schemas/TicketStatus'
 *     PaginatedSupportTickets:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SupportTicket'
 *         totalCount:
 *           type: integer
 *         totalPages:
 *           type: integer
 */
exports.createSupportTicketController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, title, description, category, meta, ticket, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = req.userId;
                _a = req.body, title = _a.title, description = _a.description, category = _a.category, meta = _a.meta;
                return [4 /*yield*/, support_service_1.createSupportTicketService({
                        userId: userId,
                        title: title,
                        description: description,
                        category: category,
                        meta: meta
                    })];
            case 1:
                ticket = _b.sent();
                res.status(201).json(ticket);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                console.error('Error creating support ticket:', error_1);
                res.status(500).json({ error: 'Failed to create support ticket.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /support/tickets/me:
 *   get:
 *     summary: Get my support tickets
 *     tags: [Support]
 *     description: Retrieves all support tickets submitted by the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of the user's support tickets.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SupportTicket'
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
exports.getMySupportTicketsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, tickets, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.userId;
                return [4 /*yield*/, support_service_1.getSupportTicketsByUserService(userId)];
            case 1:
                tickets = _a.sent();
                res.status(200).json(tickets);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error getting support tickets:', error_2);
                res.status(500).json({ error: 'Failed to retrieve support tickets.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /support/tickets/{ticketId}:
 *   get:
 *     summary: Get a single support ticket by ID
 *     tags: [Support]
 *     description: Retrieves the details of a specific support ticket. Accessible by the user who created the ticket or an admin.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The ID of the support ticket to retrieve.
 *     responses:
 *       200:
 *         description: The support ticket details.
 *         content: { "application/json": { "schema": { "$ref": "#/components/schemas/SupportTicket" } } }
 *       403:
 *         description: Forbidden (user is not authorized to view this ticket).
 *       404:
 *         description: Ticket not found.
 *       500:
 *         description: Internal server error.
 */
exports.getSupportTicketByIdController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var ticketId, userId, userRole, ticket, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                ticketId = req.params.ticketId;
                userId = req.userId;
                userRole = req.userRole;
                return [4 /*yield*/, support_service_1.getSupportTicketByIdService(ticketId, userId, userRole)];
            case 1:
                ticket = _a.sent();
                if (!ticket) {
                    return [2 /*return*/, res.status(404).json({ error: 'Support ticket not found.' })];
                }
                res.status(200).json(ticket);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                res.status(error_3.message.includes('authorized') ? 403 : 500).json({ error: error_3.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /support/tickets:
 *   get:
 *     summary: Get all support tickets (Admin)
 *     tags: [Support, Admin]
 *     description: Retrieves a paginated list of all support tickets. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: customerName, schema: { type: string }, description: "Filter by customer name (case-insensitive)." }
 *       - { in: query, name: status, schema: { $ref: '#/components/schemas/TicketStatus' }, description: "Filter by ticket status." }
 *       - { in: query, name: createdAtStart, schema: { type: string, format: date-time }, description: "Filter tickets created on or after this date." }
 *       - { in: query, name: createdAtEnd, schema: { type: string, format: date-time }, description: "Filter tickets created on or before this date." }
 *       - { in: query, name: page, schema: { type: integer, default: 1 }, description: "Page number for pagination." }
 *       - { in: query, name: size, schema: { type: integer, default: 20 }, description: "Number of items per page." }
 *     responses:
 *       200:
 *         description: A paginated list of support tickets.
 *         content:
 *           application/json: { "schema": { "$ref": "#/components/schemas/PaginatedSupportTickets" } }
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
exports.getAllSupportTicketsController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, customerName, status, createdAtStart, createdAtEnd, page, size, filters, tickets, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query, customerName = _a.customerName, status = _a.status, createdAtStart = _a.createdAtStart, createdAtEnd = _a.createdAtEnd;
                page = parseInt(req.query.page) || 1;
                size = parseInt(req.query.size) || 20;
                filters = {
                    customerName: customerName,
                    status: status,
                    createdAtStart: createdAtStart,
                    createdAtEnd: createdAtEnd
                };
                return [4 /*yield*/, support_service_1.getAllSupportTicketsService(filters, page, size)];
            case 1:
                tickets = _b.sent();
                res.status(200).json(tickets);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _b.sent();
                console.error('Error getting all support tickets:', error_4);
                res.status(500).json({ error: 'Failed to retrieve support tickets.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /support/tickets/{ticketId}/status:
 *   patch:
 *     summary: Update a support ticket's status (Admin)
 *     tags: [Support, Admin]
 *     description: Updates the status of a specific support ticket. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json: { "schema": { "$ref": "#/components/schemas/UpdateSupportTicketStatusPayload" } }
 *     responses:
 *       200:
 *         description: The updated support ticket.
 *         content: { "application/json": { "schema": { "$ref": "#/components/schemas/SupportTicket" } } }
 *       400:
 *         description: Bad request (e.g., invalid status).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Ticket not found.
 *       500:
 *         description: Internal server error.
 */
exports.updateSupportTicketStatusController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var ticketId, status, updatedTicket, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                ticketId = req.params.ticketId;
                status = req.body.status;
                return [4 /*yield*/, support_service_1.updateSupportTicketStatusService(ticketId, status)];
            case 1:
                updatedTicket = _a.sent();
                res.status(200).json(updatedTicket);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Error updating support ticket status:', error_5);
                if (error_5.code === 'P2025') {
                    // Prisma's record not found error
                    return [2 /*return*/, res.status(404).json({ error: 'Support ticket not found.' })];
                }
                res.status(500).json({ error: 'Failed to update support ticket status.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * @swagger
 * /support/admin/overview:
 *   get:
 *     summary: Get platform-wide support ticket overview (Admin)
 *     tags: [Support, Admin]
 *     description: Retrieves aggregate data about support tickets, such as total count, open tickets, and closed tickets. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: An object containing the support ticket overview data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTickets: { type: integer }
 *                 openTickets: { type: integer }
 *                 closedTickets: { type: integer }
 *       500:
 *         description: Internal server error.
 */
exports.getSupportTicketOverviewController = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var overviewData, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, support_service_1.getSupportTicketOverviewService()];
            case 1:
                overviewData = _a.sent();
                res.status(200).json(overviewData);
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Error getting support ticket overview:', error_6);
                res.status(500).json({ error: 'An unexpected error occurred.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
