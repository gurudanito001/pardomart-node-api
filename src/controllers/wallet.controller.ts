import { Response } from 'express';
import { AuthenticatedRequest } from './vendor.controller';
import * as walletService from '../services/wallet.service';

/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: User wallet and transaction management
 */

/**
 * @swagger
 * /wallet/me:
 *   get:
 *     summary: Get the authenticated user's wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves the wallet details and balance for the currently authenticated user. If a wallet does not exist, it will be created automatically.
 *     responses:
 *       200:
 *         description: The user's wallet.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wallet'
 *       500:
 *         description: Internal server error.
 * components:
 *   schemas:
 *     Wallet:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         userId: { type: string, format: uuid }
 *         balance: { type: number, format: float }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */
export const getWalletController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const wallet = await walletService.getWalletByUserIdService(userId);
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
 *     summary: Get the authenticated user's transaction history
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves a list of all financial transactions for the authenticated user.
 *     responses:
 *       200:
 *         description: A list of the user's transactions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TransactionWithRelations'
 *       500:
 *         description: Internal server error.
 */
export const getWalletTransactionsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const transactions = await walletService.getWalletTransactionsService(userId);
    res.status(200).json(transactions);
  } catch (error: any) {
    console.error('Error getting wallet transactions:', error);
    res.status(500).json({ error: 'Failed to retrieve wallet transactions.' });
  }
};