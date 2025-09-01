// controllers/vendor.controller.ts
import { Request, Response } from 'express';
import * as vendorService from '../services/vendor.service';
import { getVendorsFilters } from '../models/vendor.model';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
}

/**
 * @swagger
 * /vendors:
 *   post:
 *     summary: Create a new vendor
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     description: Creates a new vendor profile linked to the authenticated user. Default opening hours from 9:00 to 18:00 are created automatically for all days of the week.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVendorPayload'
 *     responses:
 *       201:
 *         description: The created vendor with default opening hours.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorWithRelations'
 *       500:
 *         description: Internal server error.
 */
export const createVendor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const vendor = await vendorService.createVendor({...req.body, userId: req?.userId});
    res.status(201).json(vendor);
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /vendors/{id}:
 *   get:
 *     summary: Get a vendor by its ID
 *     tags: [Vendor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the vendor to retrieve.
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current latitude to calculate distance to the vendor.
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current longitude to calculate distance to the vendor.
 *     responses:
 *       200:
 *         description: The requested vendor with its associated user and opening hours.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorWithRelations'
 *       404:
 *         description: Vendor not found.
 *       500:
 *         description: Internal server error.
 */
export const getVendorById = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.query;
    const vendor = await vendorService.getVendorById(req.params.id, latitude as string | undefined, longitude as string | undefined);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.status(200).json(vendor);
  } catch (error) {
    console.error('Error getting vendor by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* export const getVendorsByProximity = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required.' });
    }

    const customerLatitude = parseFloat(latitude as string);
    const customerLongitude = parseFloat(longitude as string);

    if (isNaN(customerLatitude) || isNaN(customerLongitude)) {
      return res.status(400).json({ error: 'Invalid latitude or longitude format.' });
    }

    const nearbyVendors = await vendorService.getVendorsByProximity(
      customerLatitude,
      customerLongitude
    );

    res.json(nearbyVendors);
  } catch (error) {
    console.error('Error listing vendors by proximity:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}; */

/**
 * @swagger
 * /vendors:
 *   get:
 *     summary: Get a paginated list of vendors
 *     tags: [Vendor]
 *     description: Retrieves a list of vendors. Can be filtered by name and sorted by proximity if latitude and longitude are provided. If the user is authenticated, it also returns the number of items in their cart for each vendor.
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter vendors by name (case-insensitive search).
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current latitude to sort vendors by distance.
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *           format: float
 *         description: User's current longitude to sort vendors by distance.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page.
 *     responses:
 *       200:
 *         description: A paginated list of vendors.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedVendors'
 *       500:
 *         description: Internal server error.
 */
export const getAllVendors = async (req: AuthenticatedRequest, res: Response) => {
  const {name, latitude, longitude}: getVendorsFilters = req.query;
  const userId = req.userId;
  const page = req?.query?.page?.toString() || "1";
  const take = req?.query?.size?.toString() || "20"; 
  try {
    const vendors = await vendorService.getAllVendors({name, latitude, longitude, userId}, {page, take});
    res.status(200).json(vendors);
  } catch (error) {
    console.error('Error getting all vendors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /vendors/{id}:
 *   patch:
 *     summary: Update a vendor's details
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the vendor to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateVendorPayload'
 *     responses:
 *       200:
 *         description: The updated vendor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vendor'
 *       404:
 *         description: Vendor not found.
 *       500:
 *         description: Internal server error.
 */
export const updateVendor = async (req: Request, res: Response) => {
  try {
    const id = req.params.id
    const vendor = await vendorService.updateVendor(id, req.body);
    res.status(200).json(vendor);
  } catch (error: any) {
    console.error('Error updating vendor:', error);
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /vendors/{id}:
 *   delete:
 *     summary: Delete a vendor
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the vendor to delete.
 *     responses:
 *       200:
 *         description: The deleted vendor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vendor'
 *       404:
 *         description: Vendor not found.
 *       500:
 *         description: Internal server error.
 */
export const deleteVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await vendorService.deleteVendor(req.params.id);
    res.status(200).json(vendor);
  } catch (error: any) {
    console.error('Error deleting vendor:', error);
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /vendors/getvendorsby/userId:
 *   get:
 *     summary: Get all vendors for the authenticated user
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves a list of all vendors associated with the currently authenticated user.
 *     responses:
 *       200:
 *         description: A list of the user's vendors.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vendor'
 *       500:
 *         description: Internal server error.
 */
export const getVendorsByUserId = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const vendors = await vendorService.getVendorsByUserId(req.userId);
    res.status(200).json(vendors);
  } catch (error) {
    console.error('Error getting vendors by userId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};