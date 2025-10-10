import { Router } from 'express';
import * as walletController from '../controllers/wallet.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/v1/wallet/me - Get the current user's wallet
router.get('/me', authenticate, walletController.getWalletController);

// GET /api/v1/wallet/me/transactions - Get the current user's transaction history
router.get('/me/transactions', authenticate, walletController.getWalletTransactionsController);

export default router;