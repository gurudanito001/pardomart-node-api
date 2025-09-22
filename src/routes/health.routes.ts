import { Router } from 'express';
import { healthCheckController } from '../controllers/health.controller';

const router = Router();

router.get('/', healthCheckController);

export default router;