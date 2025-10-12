// routes/customer.routes.ts
import { Router } from 'express';
import * as customerController from '../controllers/customer.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', authorize([Role.vendor, Role.store_admin, Role.store_shopper]), customerController.listCustomersController);

export default router;