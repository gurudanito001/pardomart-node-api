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
exports.getSupportTicketOverviewService = exports.updateSupportTicketStatusService = exports.getSupportTicketByIdService = exports.getAllSupportTicketsService = exports.getSupportTicketsByUserService = exports.createSupportTicketService = void 0;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
/**
 * Creates a new support ticket for an authenticated user.
 * @param payload The data for the new support ticket.
 * @returns The created support ticket.
 */
exports.createSupportTicketService = function (payload) { return __awaiter(void 0, void 0, Promise, function () {
    var userId, title, description, category, meta, ticket;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = payload.userId, title = payload.title, description = payload.description, category = payload.category, meta = payload.meta;
                return [4 /*yield*/, prisma.supportTicket.create({
                        data: {
                            userId: userId,
                            title: title,
                            description: description,
                            category: category,
                            meta: meta || {}
                        }
                    })];
            case 1:
                ticket = _a.sent();
                // Optional: Notify support staff via email or another system
                // e.g., `notifySupportTeam(ticket);`
                return [2 /*return*/, ticket];
        }
    });
}); };
/**
 * Retrieves all support tickets for a specific user.
 * @param userId The ID of the user.
 * @returns A list of the user's support tickets.
 */
exports.getSupportTicketsByUserService = function (userId) { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, prisma.supportTicket.findMany({
                where: { userId: userId },
                orderBy: { createdAt: 'desc' }
            })];
    });
}); };
/**
 * Retrieves all support tickets with pagination (for admin use).
 * @param filters - The filtering criteria.
 * @param page - The page number for pagination.
 * @param take - The number of items per page.
 * @returns A paginated list of all support tickets.
 */
exports.getAllSupportTicketsService = function (filters, page, take) { return __awaiter(void 0, void 0, Promise, function () {
    var skip, customerName, status, createdAtStart, createdAtEnd, where, _a, tickets, totalCount, totalPages;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                skip = (page - 1) * take;
                customerName = filters.customerName, status = filters.status, createdAtStart = filters.createdAtStart, createdAtEnd = filters.createdAtEnd;
                where = {};
                if (customerName) {
                    where.user = {
                        name: {
                            contains: customerName,
                            mode: 'insensitive'
                        }
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
                        prisma.supportTicket.findMany({
                            where: where,
                            orderBy: { createdAt: 'desc' },
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true
                                    }
                                }
                            },
                            skip: skip,
                            take: take
                        }),
                        prisma.supportTicket.count({ where: where }),
                    ])];
            case 1:
                _a = _b.sent(), tickets = _a[0], totalCount = _a[1];
                totalPages = Math.ceil(totalCount / take);
                return [2 /*return*/, { data: tickets, totalCount: totalCount, totalPages: totalPages }];
        }
    });
}); };
/**
 * Retrieves a single support ticket by its ID.
 * Performs authorization to ensure only the ticket owner or an admin can view it.
 * @param ticketId The ID of the ticket to retrieve.
 * @param requestingUserId The ID of the user making the request.
 * @param requestingUserRole The role of the user making the request.
 * @returns The support ticket object with user details, or null if not found.
 * @throws Error if the user is not authorized.
 */
exports.getSupportTicketByIdService = function (ticketId, requestingUserId, requestingUserRole) { return __awaiter(void 0, void 0, Promise, function () {
    var ticket;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.supportTicket.findUnique({
                    where: { id: ticketId },
                    include: {
                        user: { select: { id: true, name: true, email: true } }
                    }
                })];
            case 1:
                ticket = _a.sent();
                if (!ticket) {
                    return [2 /*return*/, null];
                }
                // Authorization check: Allow if the requester is the owner or an admin.
                if (ticket.userId !== requestingUserId && requestingUserRole !== client_1.Role.admin) {
                    throw new Error('You are not authorized to view this ticket.');
                }
                return [2 /*return*/, ticket];
        }
    });
}); };
/**
 * Updates the status of a support ticket (for admin use).
 * @param ticketId The ID of the ticket to update.
 * @param status The new status for the ticket.
 * @returns The updated support ticket.
 */
exports.updateSupportTicketStatusService = function (ticketId, status) { return __awaiter(void 0, void 0, Promise, function () {
    var updatedTicket;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.supportTicket.update({
                    where: { id: ticketId },
                    data: { status: status },
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                })];
            case 1:
                updatedTicket = _a.sent();
                // Optional: Notify the user that their ticket status has been updated.
                // e.g., createAndSendNotification({ userId: updatedTicket.userId, ... })
                return [2 /*return*/, updatedTicket];
        }
    });
}); };
/**
 * (Admin) Retrieves an overview of support ticket data for the platform.
 * @returns An object containing total, open, and closed ticket counts.
 */
exports.getSupportTicketOverviewService = function () { return __awaiter(void 0, void 0, Promise, function () {
    var _a, totalTickets, openTickets, closedTickets;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, Promise.all([
                    prisma.supportTicket.count(),
                    prisma.supportTicket.count({
                        where: {
                            status: { "in": [client_1.TicketStatus.OPEN, client_1.TicketStatus.IN_PROGRESS] }
                        }
                    }),
                    prisma.supportTicket.count({
                        where: {
                            status: { "in": [client_1.TicketStatus.RESOLVED, client_1.TicketStatus.CLOSED] }
                        }
                    }),
                ])];
            case 1:
                _a = _b.sent(), totalTickets = _a[0], openTickets = _a[1], closedTickets = _a[2];
                return [2 /*return*/, { totalTickets: totalTickets, openTickets: openTickets, closedTickets: closedTickets }];
        }
    });
}); };
