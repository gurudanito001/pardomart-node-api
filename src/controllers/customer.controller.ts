// controllers/customer.controller.ts
import { Response } from 'express';
import * as customerService from '../services/customer.service';
import { AuthenticatedRequest } from './vendor.controller';

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management for vendors
 */

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: List customers for a vendor account or a specific store
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional. The ID of a specific store to filter customers for. If omitted, returns customers from all stores.
 *     responses:
 *       200:
 *         description: A list of customers who have made a purchase.
 *       403:
 *         description: Forbidden. The authenticated user does not own the specified vendor.
 *       500:
 *         description: Internal server error.
 */
export const listCustomersController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ownerId = req.userId as string;
    const { vendorId } = req.query;

    const customers = await customerService.listCustomersForVendorService(ownerId, vendorId as string | undefined);
    res.status(200).json(customers);
  } catch (error: any) {
    console.error('Error listing customers:', error);
    if (error.message.startsWith('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};