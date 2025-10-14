// src/controllers/earnings.controller.ts
import { Response } from 'express';
import { AuthenticatedRequest } from './vendor.controller';
import * as earningsService from '../services/earnings.service';

/**
 * @swagger
 * tags:
 *   name: Earnings
 *   description: Vendor earnings management
 */

/**
 * @swagger
 * /earnings:
 *   get:
 *     summary: List earnings for a vendor
 *     tags: [Earnings, Vendor]
 *     description: >
 *       Retrieves a list of all earnings (vendor payouts) for the authenticated vendor owner.
 *       Can be filtered by a specific `vendorId` (store ID) to see earnings for just one store.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         schema: { type: string, format: uuid }
 *         description: Optional. Filter earnings for a specific store.
 *     responses:
 *       200:
 *         description: A list of earnings transactions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       403:
 *         description: Forbidden. The user is not a vendor or does not own the specified store.
 *       500:
 *         description: Internal server error.
 */
export const listEarningsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requestingUserId = req.userId as string;
    const { vendorId } = req.query as { vendorId?: string };

    const earnings = await earningsService.listEarningsService({
      requestingUserId,
      filterByVendorId: vendorId,
    });

    res.status(200).json(earnings);
  } catch (error: any) {
    console.error('Error listing earnings:', error);
    if (error.message.includes('Forbidden')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'An unexpected error occurred while listing earnings.' });
  }
};