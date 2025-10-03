// routes/customer.routes.ts
import { Router } from 'express';
import * as customerController from '../controllers/customer.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, customerController.listCustomersController);

export default router;