// src/routes/earnings.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import * as earningsController from '../controllers/earnings.controller';


const router = Router();

router.use(authenticate, authorize([Role.vendor]));

router.get('/', earningsController.listEarningsController);
router.get('/total', earningsController.getTotalEarningsController);


export default router;
