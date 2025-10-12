// controllers/customer.controller.ts
import { Response } from 'express';
import * as customerService from '../services/customer.service';
import { AuthenticatedRequest } from './vendor.controller';
import { Role } from '@prisma/client';

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
 *     summary: List customers for a vendor, admin, or shopper
 *     tags: [Customers]
 *     description: >
 *       Retrieves a list of unique customers who have patronized a store.
 *       - **Vendor**: Can see customers from all their stores. Can filter by a specific `vendorId`.
 *       - **Store Admin/Shopper**: Can only see customers from their assigned store. The `vendorId` filter is ignored.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         schema: { type: string, format: uuid }
 *         description: Optional. For vendors, filters customers by a specific store ID. For staff, this parameter is ignored.
 *     responses:
 *       200:
 *         description: A list of customers who have made a purchase from the vendor's store(s).
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserSummary'
 *       403:
 *         description: Forbidden. The authenticated user does not have permission.
 *       500:
 *         description: Internal server error.
 */
export const listCustomersController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const userRole = req.userRole as Role;
    const staffVendorId = req.vendorId; // The vendorId from the staff's token
    const { vendorId: queryVendorId } = req.query as { vendorId?: string };

    let vendorIdToQuery: string | undefined;
    let ownerId: string | undefined;

    if (userRole === Role.vendor) {
      ownerId = userId;
      vendorIdToQuery = queryVendorId; // A vendor can filter by any of their stores
    } else {
      // For staff, they can only see customers of their assigned store.
      // Any query for a different store is an error.
      if (queryVendorId && queryVendorId !== staffVendorId) {
        return res.status(403).json({ error: 'Forbidden: You can only access customers for your assigned store.' });
      }
      vendorIdToQuery = staffVendorId;
    }

    const customers = await customerService.listCustomersService({ ownerId, vendorId: vendorIdToQuery });
    res.status(200).json(customers);
  } catch (error: any) {
    console.error('Error listing customers:', error);
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'An unexpected error occurred while listing customers.' });
  }
};