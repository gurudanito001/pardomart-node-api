import { Response } from 'express';
import { AuthenticatedRequest } from './vendor.controller';
import * as returnService from '../services/return.service';
import { ReturnStatus, Role } from '@prisma/client';
import { OrderCreationError } from '../services/order.service';

/**
 * @swagger
 * tags:
 *   name: Return
 *   description: Return request management
 */

/**
 * @swagger
 * /returns:
 *   post:
 *     summary: Create a return request
 *     tags: [Return]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, items]
 *             properties:
 *               orderId: { type: string, format: uuid }
 *               reason: { type: string }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [vendorProductId, quantity]
 *                   properties:
 *                     vendorProductId: { type: string, format: uuid }
 *                     quantity: { type: integer }
 *                     reason: { type: string }
 *     responses:
 *       201:
 *         description: Return request created.
 *       400:
 *         description: Bad request.
 *       403:
 *         description: Unauthorized.
 *       404:
 *         description: Order not found.
 */
export const createReturnRequestController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const payload = req.body;
    const returnRequest = await returnService.createReturnRequestService(userId, payload);
    res.status(201).json(returnRequest);
  } catch (error: any) {
    if (error instanceof OrderCreationError) {
        return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Error creating return request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /returns/{requestId}/status:
 *   patch:
 *     summary: Update return request status
 *     tags: [Return]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED, REFUNDED, PICKUP_ASSIGNED, PICKED_UP, RETURNED]
 *     responses:
 *       200:
 *         description: Status updated.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Return request not found.
 */
export const updateReturnRequestStatusController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const userId = req.userId as string;
    const userRole = req.userRole as Role;

    const updatedRequest = await returnService.updateReturnRequestStatusService(requestId, status as ReturnStatus, userId, userRole);
    res.status(200).json(updatedRequest);
  } catch (error: any) {
    if (error instanceof OrderCreationError) {
        return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Error updating return request status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
