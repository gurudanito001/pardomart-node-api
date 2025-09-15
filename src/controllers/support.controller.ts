import { Request, Response } from 'express';
import { AuthenticatedRequest } from './vendor.controller';
import {
  createSupportTicketService,
  getSupportTicketsByUserService,
  getAllSupportTicketsService,
  updateSupportTicketStatusService,
} from '../services/support.service';
import { TicketCategory, TicketStatus } from '@prisma/client';

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
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, category]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "App crashes on checkout"
 *               description:
 *                 type: string
 *                 example: "When I try to checkout my cart, the app closes unexpectedly."
 *               category:
 *                 $ref: '#/components/schemas/TicketCategory'
 *               meta:
 *                 type: object
 *                 description: "Optional. e.g., { \"orderId\": \"uuid-goes-here\" }"
 *     responses:
 *       201:
 *         description: The created support ticket.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupportTicket'
 *       400:
 *         description: Bad request (e.g., invalid input).
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
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
 * /api/v1/support/tickets:
 *   get:
 *     summary: Get all support tickets (Admin)
 *     tags: [Support, Admin]
 *     description: Retrieves a paginated list of all support tickets. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: A paginated list of support tickets.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SupportTicket'
 *                 totalCount:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
export const getAllSupportTicketsController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 20;
    const tickets = await getAllSupportTicketsService(page, size);
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
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 $ref: '#/components/schemas/TicketStatus'
 *     responses:
 *       200:
 *         description: The updated support ticket.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupportTicket'
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