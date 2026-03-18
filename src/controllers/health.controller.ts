import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { errorLogService } from '../services/errorLog.service';

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: API health check and wake-up endpoint
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     description: A simple endpoint to check if the API is running. Can be used by monitoring services to keep the server from sleeping on free tiers.
 *     responses:
 *       200:
 *         description: API is up and running.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Pardomart API is awake and running!"
 */
export const healthCheckController = async (req: Request, res: Response) => {
  try {
    res.status(StatusCodes.OK).json({
      message: 'Pardomart API is awake and running!',
    });
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed health check',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as any).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
      errorCode: error.code || 'HEALTH_CHECK_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
};