import { Request, Response, NextFunction } from 'express';
import { errorLogService } from '../services/errorLog.service';
import { ApiResponse } from '../utils/apiResponse';
import { catchAsync } from '../utils/catchAsync';

/**
 * @swagger
 * tags:
 *   name: ErrorLogs
 *   description: API for reporting client-side errors and retrieving system logs
 */

/**
 * Report an error from a client application (Frontend/Mobile).
 * POST /api/v1/errors/report
 *
 * @swagger
 * /errors/report:
 *   post:
 *     summary: Report a client-side error
 *     description: Allows frontend (Web/Mobile) applications to report crashes or unexpected errors to the backend for centralized logging.
 *     tags: [ErrorLogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: The human-readable error message.
 *                 example: "Uncaught TypeError: Cannot read property 'map' of undefined"
 *               stackTrace:
 *                 type: string
 *                 description: The raw stack trace from the client application.
 *               metaData:
 *                 type: object
 *                 description: Additional context (e.g., component state, redux store, device info).
 *                 example: { "screen": "Checkout", "os": "iOS 16.0" }
 *               errorCode:
 *                 type: string
 *                 description: A custom error code for categorization.
 *                 example: "UI_CRASH"
 *               statusCode:
 *                 type: integer
 *                 description: The equivalent HTTP status code (default is 400).
 *                 example: 400
 *               requestPath:
 *                 type: string
 *                 description: The route or screen where the error occurred.
 *                 example: "/checkout/payment"
 *               requestMethod:
 *                 type: string
 *                 description: The action or method being performed.
 *                 example: "SUBMIT_ORDER"
 *     responses:
 *       200:
 *         description: Error reported successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Error reported successfully"
 */
export const reportError = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { message, stackTrace, metaData, errorCode, statusCode, requestPath, requestMethod } = req.body;

  // Extract contextual info from the request
  const userId = (req as any).user?.id; // Assuming auth middleware attaches user
  const ipAddress = req.ip || req.socket.remoteAddress;

  await errorLogService.logError({
    message: message || 'Client-side error reported',
    stackTrace,
    metaData: metaData,
    userId,
    ipAddress,
    // Allow client to specify these, or fallback to the reporting endpoint's details
    requestMethod: requestMethod || req.method,
    requestPath: requestPath || 'CLIENT_APP', 
    statusCode: statusCode || 400, // Default to 400 for client errors
    errorCode: errorCode || 'CLIENT_REPORT',
  });

  return ApiResponse.success(res, 'Error reported successfully');
});

/**
 * Get a paginated list of error logs.
 * GET /api/v1/errors
 * Query Params: page, limit, startDate, endDate, statusCode, userId, correlationId
 *
 * @swagger
 * /errors:
 *   get:
 *     summary: Get a list of error logs
 *     description: Retrieve paginated error logs with optional filtering. (Admin only)
 *     tags: [ErrorLogs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of items per page
 *       - in: query
 *         name: statusCode
 *         schema:
 *           type: integer
 *         description: Filter by HTTP status code (e.g., 500)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs created after this date (ISO 8601)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs created before this date (ISO 8601)
 *       - in: query
 *         name: correlationId
 *         schema:
 *           type: string
 *         description: Filter by specific request correlation ID
 *     responses:
 *       200:
 *         description: List of error logs retrieved successfully.
 */
export const getErrorLogs = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    page,
    limit,
    startDate,
    endDate,
    statusCode,
    userId,
    correlationId,
  } = req.query;

  const result = await errorLogService.getErrorLogs({
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 50,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    statusCode: statusCode ? parseInt(statusCode as string, 10) : undefined,
    userId: userId as string,
    correlationId: correlationId as string,
  });

  return ApiResponse.success(res, 'Error logs retrieved successfully', result);
});

/**
 * Get a single error log by ID.
 * GET /api/v1/errors/:id
 *
 * @swagger
 * /errors/{id}:
 *   get:
 *     summary: Get a specific error log
 *     description: Retrieve full details of a single error log by ID. (Admin only)
 *     tags: [ErrorLogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The UUID of the error log
 *     responses:
 *       200:
 *         description: Error log details.
 *       404:
 *         description: Error log not found.
 */
export const getErrorLog = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const log = await errorLogService.getErrorLogById(id);

  if (!log) {
    return ApiResponse.error(res, 'Error log not found', 404);
  }

  return ApiResponse.success(res, 'Error log retrieved successfully', log);
});