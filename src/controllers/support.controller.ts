import { Request, Response } from 'express';
import { AuthenticatedRequest } from './vendor.controller';
import {
  createSupportTicketService,
  getSupportTicketsByUserService,
  getAllSupportTicketsService,
  updateSupportTicketStatusService,
  getSupportTicketOverviewService,
  getSupportTicketByIdService,
  GetAllTicketsFilters,
} from '../services/support.service';
import { Role, TicketCategory, TicketStatus } from '@prisma/client';

/**
 * @swagger
 * tags:
 *   name: Support
 *   description: Support ticket management
 */

/**
 * @swagger
 * /api/v1/support/tickets:
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
export const createSupportTicketController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const { title, description, category, meta } = req.body;

    const ticket = await createSupportTicketService({
      userId,
      title,
      description,
      category: category as TicketCategory,
      meta,
    });

    res.status(201).json(ticket);
  } catch (error: any) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ error: 'Failed to create support ticket.' });
  }
};

/**
 * @swagger
 * /api/v1/support/tickets/me:
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
export const getMySupportTicketsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const tickets = await getSupportTicketsByUserService(userId);
    res.status(200).json(tickets);
  } catch (error: any) {
    console.error('Error getting support tickets:', error);
    res.status(500).json({ error: 'Failed to retrieve support tickets.' });
  }
};

/**
 * @swagger
 * /api/v1/support/tickets/{ticketId}:
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
export const getSupportTicketByIdController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { ticketId } = req.params;
    const userId = req.userId as string;
    const userRole = req.userRole as Role;

    const ticket = await getSupportTicketByIdService(ticketId, userId, userRole);

    if (!ticket) {
      return res.status(404).json({ error: 'Support ticket not found.' });
    }

    res.status(200).json(ticket);
  } catch (error: any) {
    res.status(error.message.includes('authorized') ? 403 : 500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/support/tickets:
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
export const getAllSupportTicketsController = async (req: Request, res: Response) => {
  try {
    const { customerName, status, createdAtStart, createdAtEnd } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 20;

    const filters: GetAllTicketsFilters = {
      customerName: customerName as string | undefined,
      status: status as TicketStatus | undefined,
      createdAtStart: createdAtStart as string | undefined,
      createdAtEnd: createdAtEnd as string | undefined,
    };

    const tickets = await getAllSupportTicketsService(filters, page, size);

    res.status(200).json(tickets);
  } catch (error: any) {
    console.error('Error getting all support tickets:', error);
    res.status(500).json({ error: 'Failed to retrieve support tickets.' });
  }
};

/**
 * @swagger
 * /api/v1/support/tickets/{ticketId}/status:
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
export const updateSupportTicketStatusController = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    const updatedTicket = await updateSupportTicketStatusService(ticketId, status as TicketStatus);
    res.status(200).json(updatedTicket);
  } catch (error: any) {
    console.error('Error updating support ticket status:', error);
    if (error.code === 'P2025') {
      // Prisma's record not found error
      return res.status(404).json({ error: 'Support ticket not found.' });
    }
    res.status(500).json({ error: 'Failed to update support ticket status.' });
  }
};

/**
 * @swagger
 * /api/v1/support/admin/overview:
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
export const getSupportTicketOverviewController = async (req: Request, res: Response) => {
  try {
    const overviewData = await getSupportTicketOverviewService();
    res.status(200).json(overviewData);
  } catch (error: any) {
    console.error('Error getting support ticket overview:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};