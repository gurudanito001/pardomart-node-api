import { Response } from 'express';
import { AuthenticatedRequest } from './vendor.controller';
import { getWalletByUserIdService, getWalletTransactionsService } from '../services/wallet.service';

/**
 * @swagger
 * /wallet/me:
 *   get:
 *     summary: Get my wallet
 *     tags: [Wallet]
 *     description: Retrieves the wallet details and balance for the authenticated user. A wallet is created automatically on first access.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user's wallet.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wallet'
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 * components:
 *   schemas:
 *     TransactionType:
 *       type: string
 *       enum: [CREDIT, DEBIT]
 *     TransactionStatus:
 *       type: string
 *       enum: [PENDING, COMPLETED, FAILED, CANCELLED]
 *     Wallet:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         userId: { type: string, format: uuid }
 *         balance: { type: number, format: float }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     WalletTransaction:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         walletId: { type: string, format: uuid }
 *         amount:
 *           type: number
 *           format: float
 *           description: "Positive for credit, negative for debit."
 *         type:
 *           $ref: '#/components/schemas/TransactionType'
 *         status:
 *           $ref: '#/components/schemas/TransactionStatus'
 *         description:
 *           type: string
 *           nullable: true
 *         meta:
 *           type: object
 *           nullable: true
 *           description: "Extra metadata, like an order ID."
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /wallet/me:
 *   get:
 *     summary: Get my wallet
 *     tags: [Wallet]
 *     description: Retrieves the wallet details and balance for the authenticated user. A wallet is created automatically on first access.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user's wallet.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wallet'
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
export const getMyWalletController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const wallet = await getWalletByUserIdService(userId);
    res.status(200).json(wallet);
  } catch (error: any) {
    console.error('Error getting wallet:', error);
    res.status(500).json({ error: 'Failed to retrieve wallet.' });
  }
};

/**
 * @swagger
 * /wallet/me/transactions:
 *   get:
 *     summary: Get my wallet transactions
 *     tags: [Wallet]
 *     description: Retrieves the transaction history for the authenticated user's wallet.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of wallet transactions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WalletTransaction'
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
export const getMyWalletTransactionsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const transactions = await getWalletTransactionsService(userId);
    res.status(200).json(transactions);
  } catch (error: any) {
    console.error('Error getting wallet transactions:', error);
    res.status(500).json({ error: 'Failed to retrieve wallet transactions.' });
  }
};