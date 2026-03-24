import { Response } from 'express';
import { AuthenticatedRequest } from './vendor.controller';
import * as walletService from '../services/wallet.service';
import { errorLogService } from '../services/errorLog.service';
import { WalletError } from '../services/wallet.service';

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
    await errorLogService.logError({
      message: error.message || 'Failed to get wallet',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: req.userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'GET_WALLET_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    res.status(500).json({ error: 'Failed to retrieve wallet.' });
  }
};

/**
 * @swagger
 * /wallet/withdraw:
 *   post:
 *     summary: Request a withdrawal from wallet to bank account
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     description: Submits a request to cash out earnings. Deducts the balance immediately and creates a PENDING transaction until processed by an admin.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: The amount to withdraw.
 *     responses:
 *       200:
 *         description: Withdrawal requested successfully.
 *       400:
 *         description: Bad Request (e.g., insufficient funds).
 */
export const requestWithdrawalController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const { amount } = req.body;

    const transaction = await walletService.requestWithdrawalService(userId, amount);
    res.status(200).json(transaction);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to request withdrawal',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: req.userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'WALLET_WITHDRAWAL_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    if (error instanceof WalletError) return res.status(error.statusCode).json({ error: error.message });
    res.status(500).json({ error: 'Failed to request withdrawal.' });
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
    await errorLogService.logError({
      message: error.message || 'Failed to get wallet transactions',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: req.userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'GET_WALLET_TRANSACTIONS_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    res.status(500).json({ error: 'Failed to retrieve wallet transactions.' });
  }
};