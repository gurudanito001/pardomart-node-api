import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

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
export const healthCheckController = (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    message: 'Pardomart API is awake and running!',
  });
};