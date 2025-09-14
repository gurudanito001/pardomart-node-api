/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The unique identifier for the message.
 *         orderId:
 *           type: string
 *           format: uuid
 *           description: The ID of the order this message belongs to.
 *         senderId:
 *           type: string
 *           format: uuid
 *           description: The ID of the user who sent the message.
 *         recipientId:
 *           type: string
 *           format: uuid
 *           description: The ID of the user who is the recipient of the message.
 *         sender:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *           description: The user who sent the message (included in responses).
 *         content:
 *           type: string
 *           description: The text content of the message.
 *         readAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the message was read. Null if unread.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the message was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the message was last updated.
 *       example:
 *         id: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *         orderId: "b2c3d4e5-f6a7-8901-2345-67890abcdef"
 *         senderId: "c3d4e5f6-a7b8-9012-3456-7890abcdef"
 *         recipientId: "d4e5f6a7-b8c9-0123-4567-890abcdef"
 *         sender: { id: "c3d4e5f6-a7b8-9012-3456-7890abcdef", name: "John Doe" }
 *         content: "Hello, I'm running a bit late."
 *         readAt: null
 *         createdAt: "2023-10-27T14:30:00.000Z"
 *         updatedAt: "2023-10-27T14:30:00.000Z"
 */
export {};