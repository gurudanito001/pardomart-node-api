import { Router } from 'express';
import * as walletController from '../controllers/wallet.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All wallet routes require an authenticated user
router.use(authenticate);

router.get('/me', walletController.getMyWalletController);
router.get('/me/transactions', walletController.getMyWalletTransactionsController);

export default router;