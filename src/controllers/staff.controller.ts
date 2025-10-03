// controllers/staff.controller.ts
import { Response } from 'express';
import * as staffService from '../services/staff.service';
import { AuthenticatedRequest } from './vendor.controller';

/**
 * @swagger
 * tags:
 *   name: Staff
 *   description: Vendor staff management
 */

/**
 * @swagger
 * /api/v1/staff:
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
 * /api/v1/staff:
 *   get:
 *     summary: List all staff members for the authenticated vendor owner
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all staff members across all stores.
 *       500:
 *         description: Internal server error.
 */
export const listStaffByOwnerController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ownerId = req.userId as string;
    const staffList = await staffService.listStaffByOwnerIdService(ownerId);
    res.status(200).json(staffList);
  } catch (error: any) {
    console.error('Error listing staff by owner:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /api/v1/staff/store/{vendorId}:
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
 * /api/v1/staff/{staffId}:
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
 * /api/v1/staff/{staffId}:
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
 * /api/v1/staff/{staffId}:
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