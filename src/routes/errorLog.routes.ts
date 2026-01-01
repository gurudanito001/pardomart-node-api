import { Router } from 'express';
import { reportError, getErrorLogs, getErrorLog } from '../controllers/errorLog.controller';

const router = Router();

// Route for frontend/mobile apps to report crashes to the backend
// POST /api/v1/errors/report
router.post('/report', reportError);

// Routes for Admins/Developers to view logs
// You should add your authentication/admin middleware here to protect these routes
// GET /api/v1/errors
router.get('/', getErrorLogs);

// GET /api/v1/errors/:id
router.get('/:id', getErrorLog);

export default router;