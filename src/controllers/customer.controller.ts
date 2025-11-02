// controllers/customer.controller.ts
import { Request, Response } from 'express';
import * as customerService from '../services/customer.service';
import { AuthenticatedRequest } from './vendor.controller';
import { Role } from '@prisma/client';
import { AdminListCustomersFilters } from '../models/customer.model';

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

/**
 * @swagger
 * /customers/admin/overview:
 *   get:
 *     summary: Get platform-wide customer overview data (Admin)
 *     tags: [Customers, Admin]
 *     description: Retrieves aggregate data about customers, such as total customers, total completed orders (invoices), and new customers in a given period. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: The number of past days to count for "new customers".
 *     responses:
 *       200:
 *         description: An object containing the customer overview data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCustomers: { type: integer }
 *                 totalCompletedOrders: { type: integer }
 *                 newCustomers: { type: integer }
 *       500:
 *         description: Internal server error.
 */
export const getAdminCustomerOverviewController = async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
    const overviewData = await customerService.getAdminCustomerOverviewService(days);
    res.status(200).json(overviewData);
  } catch (error: any) {
    console.error('Error getting customer overview data:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

/**
 * @swagger
 * /customers/admin/all:
 *   get:
 *     summary: Get a paginated list of all customers (Admin)
 *     tags: [Customers, Admin]
 *     description: Retrieves a paginated list of all users with the 'customer' role. Allows filtering by name, status, amount spent, and creation date. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: name, schema: { type: string }, description: "Filter by customer name (case-insensitive)." }
 *       - { in: query, name: status, schema: { type: boolean }, description: "Filter by active status (true/false)." }
 *       - { in: query, name: minAmountSpent, schema: { type: number }, description: "Filter by minimum total amount spent." }
 *       - { in: query, name: maxAmountSpent, schema: { type: number }, description: "Filter by maximum total amount spent." }
 *       - { in: query, name: createdAtStart, schema: { type: string, format: date-time }, description: "Filter customers created on or after this date." }
 *       - { in: query, name: createdAtEnd, schema: { type: string, format: date-time }, description: "Filter customers created on or before this date." }
 *       - { in: query, name: page, schema: { type: integer, default: 1 }, description: "Page number for pagination." }
 *       - { in: query, name: size, schema: { type: integer, default: 20 }, description: "Number of items per page." }
 *     responses:
 *       200:
 *         description: A paginated list of customers.
 *       500:
 *         description: Internal server error.
 */
export const adminListAllCustomersController = async (req: Request, res: Response) => {
  try {
    const {
      name,
      status,
      minAmountSpent,
      maxAmountSpent,
      createdAtStart,
      createdAtEnd,
    } = req.query;

    const parseBoolean = (value: any): boolean | undefined => {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return undefined;
    };

    const filters: AdminListCustomersFilters = {
      name: name as string | undefined,
      status: parseBoolean(status),
      minAmountSpent: minAmountSpent ? parseFloat(minAmountSpent as string) : undefined,
      maxAmountSpent: maxAmountSpent ? parseFloat(maxAmountSpent as string) : undefined,
      createdAtStart: createdAtStart as string | undefined,
      createdAtEnd: createdAtEnd as string | undefined,
    };

    const page = parseInt(req.query.page as string) || 1;
    const take = parseInt(req.query.size as string) || 20;

    const result = await customerService.adminListAllCustomersService(filters, { page, take });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in adminListAllCustomersController:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

/**
 * @swagger
 * /customers/admin/{customerId}:
 *   get:
 *     summary: Get a single customer's details (Admin)
 *     tags: [Customers, Admin]
 *     description: Retrieves detailed information for a specific customer, including their profile and order statistics (total, completed, cancelled). Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the customer to retrieve.
 *     responses:
 *       200:
 *         description: The customer's detailed information.
 *       404:
 *         description: Customer not found.
 *       500:
 *         description: Internal server error.
 */
export const adminGetCustomerDetailsController = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const customerDetails = await customerService.adminGetCustomerDetailsService(customerId);
    res.status(200).json(customerDetails);
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    console.error('Error in adminGetCustomerDetailsController:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

/**
 * @swagger
 * /customers/admin/{customerId}:
 *   patch:
 *     summary: Update a customer's profile (Admin)
 *     tags: [Customers, Admin]
 *     description: >
 *       Allows an admin to update a customer's profile details.
 *       This is primarily used to suspend or reactivate an account by setting the `active` field to `false` or `true`.
 *       Other fields like `name`, `email`, etc., can also be updated.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the customer to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserPayload'
 *     responses:
 *       200:
 *         description: The updated customer profile.
 *       404:
 *         description: Customer not found.
 *       500:
 *         description: Internal server error.
 */
export const adminUpdateCustomerProfileController = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const updates = req.body;
    const updatedCustomer = await customerService.adminUpdateCustomerProfileService(customerId, updates);
    res.status(200).json(updatedCustomer);
  } catch (error: any) {
    res.status(error.message.includes('not found') ? 404 : 500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /customers/admin/{customerId}/transactions:
 *   get:
 *     summary: Get a paginated list of a customer's transactions (Admin)
 *     tags: [Customers, Admin, Transactions]
 *     description: Retrieves a paginated list of all transactions for a specific customer. Only accessible by admins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The ID of the customer.
 *       - { in: query, name: page, schema: { type: integer, default: 1 }, description: "Page number for pagination." }
 *       - { in: query, name: size, schema: { type: integer, default: 20 }, description: "Number of items per page." }
 *     responses:
 *       200:
 *         description: A paginated list of the customer's transactions.
 *       404:
 *         description: Customer not found.
 *       500:
 *         description: Internal server error.
 */
export const adminListCustomerTransactionsController = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const take = parseInt(req.query.size as string) || 20;

    const result = await customerService.adminListCustomerTransactionsService(customerId, { page, take });
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};