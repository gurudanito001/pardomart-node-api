// src/routes/earnings.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import { listEarningsController } from '../controllers/earnings.controller';

const router = Router();

router.use(authenticate, authorize([Role.vendor]));

router.get('/', listEarningsController);

export default router;
