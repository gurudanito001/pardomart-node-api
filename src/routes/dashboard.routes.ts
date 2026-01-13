import { Router } from 'express';
import { 
  getDashboardCardsData, 
  getDashboardTimeframeStats, 
  getDashboardRecentTransactions, 
  getDashboardAverageOrderValue 
} from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Protect all dashboard routes
router.use(authenticate);

// GET /api/v1/dashboard/cards
router.get(
  '/cards',
  authorize([Role.admin]),
  getDashboardCardsData
);

// GET /api/v1/dashboard/stats
router.get(
  '/stats',
  authorize([Role.admin]),
  getDashboardTimeframeStats
);

// GET /api/v1/dashboard/transactions
router.get(
  '/transactions',
  authorize([Role.admin]),
  getDashboardRecentTransactions
);

// GET /api/v1/dashboard/aov
router.get(
  '/aov',
  authorize([Role.admin]),
  getDashboardAverageOrderValue
);

export default router;
