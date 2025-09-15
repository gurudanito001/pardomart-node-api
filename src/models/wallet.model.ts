/**
 * @swagger
 * components:
 *   schemas:
 *     Wallet:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The unique identifier for the wallet.
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The ID of the user who owns the wallet.
 *         balance:
 *           type: number
 *           format: float
 *           description: The current balance of the wallet.
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         userId: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *         balance: 150.75
 *         createdAt: "2023-10-27T10:00:00.000Z"
 *         updatedAt: "2023-10-27T12:30:00.000Z"
 *
 *     WalletTransaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         walletId:
 *           type: string
 *           format: uuid
 *         amount:
 *           type: number
 *           format: float
 *           description: The transaction amount. Positive for credit, negative for debit.
 *         type:
 *           type: string
 *           enum: [CREDIT, DEBIT]
 *         status:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED, CANCELLED]
 *         description:
 *           type: string
 *         meta:
 *           type: object
 *           description: Extra metadata, like an order ID.
 *         createdAt:
 *           type: string
 *           format: date-time
 */
export {};