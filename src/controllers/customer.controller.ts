// controllers/customer.controller.ts
import { Request, Response } from 'express';
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

    switch (userRole) {
      case Role.vendor:
        ownerId = userId;
        vendorIdToQuery = queryVendorId; // A vendor can filter by any of their stores.
        break;

      case Role.store_admin:
      case Role.store_shopper:
        if (!staffVendorId) {
          return res.status(403).json({ error: 'Forbidden: You are not assigned to a store.' });
        }
        // Staff can only see customers of their assigned store.
        vendorIdToQuery = staffVendorId;
        break;

      default:
        return res.status(403).json({ error: 'Forbidden: Your role does not permit this action.' });
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

 /**
  * @swagger
  * /customers/{customerId}/transactions:
  *   get:
  *     summary: List all transactions for a specific customer
  *     tags: [Customers, Transactions]
  *     description: >
  *       Retrieves a list of all transactions for a given customer, with role-based access:
  *       - **Vendor**: Can view all transactions for the customer across all their stores. Can optionally filter by a specific `vendorId` (store ID).
  *       - **Store Admin**: Can only view transactions for the customer within their assigned store. The `vendorId` filter is ignored.
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - in: path
  *         name: customerId
  *         required: true
  *         schema: { type: string, format: uuid }
  *         description: The ID of the customer.
  *       - in: query
  *         name: vendorId
  *         schema: { type: string, format: uuid }
  *         description: Optional. For Vendors, filters transactions by a specific store ID. Ignored for other roles.
  *     responses:
  *       200:
  *         description: A list of the customer's transactions.
  *         content:
  *           application/json:
  *             schema:
  *               type: array
  *               items:
  *                 $ref: '#/components/schemas/Transaction'
  *       403:
  *         description: Forbidden. The authenticated user does not have permission.
  *       404:
  *         description: Not Found. The customer has no history with the specified vendor(s).
  *       500:
  *         description: Internal server error.
  */
export const listCustomerTransactionsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requestingUserId = req.userId as string;
    const requestingUserRole = req.userRole as Role;
    const staffVendorId = req.vendorId; // from staff token
    const { customerId } = req.params;
    const { vendorId } = req.query as { vendorId?: string };

    const transactions = await customerService.listCustomerTransactionsService(
      requestingUserId,
      requestingUserRole,
      staffVendorId,
      vendorId,
      customerId
    );
    res.status(200).json(transactions);
  } catch (error: any) {
    console.error('Error listing customer transactions for vendor:', error);
    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('Customer has not placed any orders')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};