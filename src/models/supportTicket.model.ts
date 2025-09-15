/**
 * @swagger
 * components:
 *   schemas:
 *     TicketCategory:
 *       type: string
 *       enum: [BUG_REPORT, FEATURE_REQUEST, ORDER_ISSUE, PAYMENT_ISSUE, ACCOUNT_ISSUE, OTHER]
 *
 *     TicketStatus:
 *       type: string
 *       enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED]
 *
 *     SupportTicket:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The unique identifier for the support ticket.
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The ID of the user who submitted the ticket.
 *         title:
 *           type: string
 *           description: A brief title for the support issue.
 *         description:
 *           type: string
 *           description: A detailed description of the issue.
 *         category:
 *           $ref: '#/components/schemas/TicketCategory'
 *         status:
 *           $ref: '#/components/schemas/TicketStatus'
 *         meta:
 *           type: object
 *           description: Optional metadata, e.g., { "orderId": "..." }
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *         userId: "b2c3d4e5-f6a7-8901-2345-67890abcdef"
 *         title: "Cannot update my profile"
 *         description: "When I try to save my new name, I get an error message."
 *         category: "ACCOUNT_ISSUE"
 *         status: "OPEN"
 */
export {};