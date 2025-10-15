import { Router } from 'express';
import * as earningsController from '../controllers/earnings.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// All earnings routes are protected and restricted to users with the 'vendor' role.
router.use(authenticate, authorize([Role.vendor]));

// Route to get total earnings
// GET /earnings/total
router.get('/total', earningsController.getTotalEarningsController);

// Route to list earnings transactions
// GET /earnings
router.get('/', earningsController.listEarningsController);


export default router;
