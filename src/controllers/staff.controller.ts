// controllers/staff.controller.ts
import { Response } from 'express';
import * as staffService from '../services/staff.service';
import { Role, Transaction } from '@prisma/client';
import { AuthenticatedRequest } from './vendor.controller';

/**
 * @swagger
 * tags:
 *   name: Staff
 *   description: Vendor staff management
 */

/**
 * @swagger
 * /staff:
 *   post:
 *     summary: Create a new staff member (shopper) for a vendor
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, mobileNumber, vendorId]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               mobileNumber: { type: string }
 *               vendorId: { type: string, format: uuid, description: "The ID of the store this staff belongs to." }
 *     responses:
 *       201:
 *         description: Staff account created successfully.
 *       403:
 *         description: Forbidden. The authenticated user does not own the vendor.
 */
export const createStaffController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ownerId = req.userId as string;
    const staff = await staffService.createStaffService({ ...req.body, ownerId });
    res.status(201).json(staff);
  } catch (error: any) {
    console.error('Error creating staff:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /staff/transactions:
 *   get:
 *     summary: List all transactions for a vendor's staff
 *     tags: [Staff, Transactions] 
 *     description: >
 *       Retrieves a list of transactions performed by staff members, with role-based access:
 *       - **Vendor**: Can see transactions from all staff across all their stores. Can filter by `staffUserId` and/or `vendorId`.
 *       - **Store Admin**: Can only see transactions from staff in their assigned store. The `vendorId` filter is ignored if provided.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: staffUserId
 *         schema: { type: string, format: uuid }
 *         description: Optional. Filter transactions for a specific staff member (shopper or admin).
 *       - in: query
 *         name: vendorId
 *         schema: { type: string, format: uuid }
 *         description: Optional. For Vendors, filters transactions for staff at a specific store. For Store Admins, this is ignored.
 *     responses:
 *       200:
 *         description: A list of staff transactions.
 *       403:
 *         description: Forbidden if the user tries to access a vendor or staff they do not own.
 *       404:
 *         description: Not Found if the specified `staffUserId` or `vendorId` does not exist.
 */
export const listStaffTransactionsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ownerId = req.userId as string;
    const userRole = req.userRole as Role;
    const staffVendorId = req.vendorId; // The vendorId from the staff's token
    const { staffUserId, vendorId } = req.query as { staffUserId?: string; vendorId?: string };
    const transactions = await staffService.listStaffTransactionsService({
      requestingUserId: ownerId,
      requestingUserRole: userRole,
      staffVendorId,
      filter: { staffUserId, vendorId },
    });
    res.status(200).json(transactions);
  } catch (error: any) {
    console.error('Error listing staff transactions:', error);
    if (error.message.includes('not found') || error.message.includes('Assigned store not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('not authorized') || error.message.includes('Forbidden')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'An unexpected error occurred while listing staff transactions.' });
  }
};

/**
 * @swagger
 * /staff:
 *   get:
 *     summary: List staff members based on user role
 *     tags: [Staff]
 *     description: >
 *       Retrieves a list of staff members with role-based access control:
 *       - **Vendor**: Can see all staff members across all of their stores. Can filter by a specific `vendorId` they own.
 *       - **Store Admin**: Can only see staff members from their assigned store. The `vendorId` filter is ignored.
 *       - **Store Shopper**: Not authorized to use this endpoint.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         schema: { type: string, format: uuid }
 *         description: Optional. For Vendors, filters staff by a specific store ID. Ignored for other roles.
 *     responses:
 *       200:
 *         description: A list of staff members.
 *       403:
 *         description: Forbidden. The user is not authorized to view staff for the specified store.
 *       500:
 *         description: Internal server error.
 */
export const listStaffForVendorOrAdminController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const userRole = req.userRole as Role;
    const staffVendorId = req.vendorId; // The vendorId from the staff's token
    const { vendorId } = req.query as { vendorId?: string };
    const staffList = await staffService.listStaffService({ userId, userRole, staffVendorId, vendorId });
    res.status(200).json(staffList);
  } catch (error: any) {
    console.error('Error listing staff:', error);
    if (error.message.includes('Unauthorized') || error.message.includes('not associated') || error.message.includes('Forbidden')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'An unexpected error occurred while listing staff.' });
  }
};

/**
 * @swagger
 * /staff/store/{vendorId}:
 *   get:
 *     summary: List all staff members for a specific store
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: A list of staff members for the specified store.
 *       403:
 *         description: Forbidden. The authenticated user does not own the vendor.
 */
export const listStaffByVendorController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ownerId = req.userId as string;
    const { vendorId } = req.params;
    const staffList = await staffService.listStaffByVendorIdService(vendorId, ownerId);
    res.status(200).json(staffList);
  } catch (error: any) {
    console.error('Error listing staff by vendor:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /staff/{staffId}:
 *   get:
 *     summary: Get a single staff member by ID
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: The requested staff member.
 *       404:
 *         description: Staff member not found.
 *       403:
 *         description: Forbidden.
 */
export const getStaffByIdController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ownerId = req.userId as string;
    const { staffId } = req.params;
    const staff = await staffService.getStaffByIdService(staffId, ownerId);
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found.' });
    }
    res.status(200).json(staff);
  } catch (error: any) {
    console.error('Error getting staff by ID:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /staff/{staffId}:
 *   patch:
 *     summary: Update a staff member's details
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               mobileNumber: { type: string }
 *               active: { type: boolean, description: "Use to deactivate/reactivate account" }
 *     responses:
 *       200:
 *         description: The updated staff member.
 */
export const updateStaffController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ownerId = req.userId as string;
    const { staffId } = req.params;
    const updatedStaff = await staffService.updateStaffService({ ...req.body, staffId, ownerId });
    res.status(200).json(updatedStaff);
  } catch (error: any) {
    console.error('Error updating staff:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /staff/{staffId}:
 *   delete:
 *     summary: Delete a staff member's account
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: Staff member deleted successfully.
 */
export const deleteStaffController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ownerId = req.userId as string;
    const { staffId } = req.params;
    await staffService.deleteStaffService(staffId, ownerId);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};