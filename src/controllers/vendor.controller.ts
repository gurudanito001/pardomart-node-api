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
 * components:
 *   schemas:
 *     Role:
 *       type: string
 *       enum: [admin, vendor, vendor_staff, delivery, customer, shopper]
 *     Days:
 *       type: string
 *       enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *     User:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         name: { type: string }
 *         email: { type: string, format: email }
 *         mobileNumber: { type: string }
 *         mobileVerified: { type: boolean }
 *         active: { type: boolean }
 *         language: { type: string, nullable: true }
 *         stripeCustomerId: { type: string, nullable: true }
 *         referralCode: { type: string, nullable: true }
 *         role: { $ref: '#/components/schemas/Role' }
 *         vendorId: { type: string, format: uuid, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     Vendor:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         userId: { type: string, format: uuid }
 *         name: { type: string }
 *         email: { type: string, format: email, nullable: true }
 *         tagline: { type: string, nullable: true }
 *         details: { type: string, nullable: true }
 *         image: { type: string, format: uri, nullable: true }
 *         address: { type: string, nullable: true }
 *         longitude: { type: number, format: float, nullable: true }
 *         latitude: { type: number, format: float, nullable: true }
 *         timezone: { type: string, nullable: true, example: "America/New_York" }
 *         isVerified: { type: boolean }
 *         meta: { type: object, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     VendorOpeningHours:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         vendorId: { type: string, format: uuid }
 *         day: { $ref: '#/components/schemas/Days' }
 *         open: { type: string, format: "HH:mm", nullable: true, example: "09:00" }
 *         close: { type: string, format: "HH:mm", nullable: true, example: "18:00" }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     VendorWithRelations:
 *       allOf:
 *         - $ref: '#/components/schemas/Vendor'
 *         - type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             openingHours:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VendorOpeningHours'
 *     VendorWithDetails:
 *       allOf:
 *         - $ref: '#/components/schemas/VendorWithRelations'
 *         - type: object
 *           properties:
 *             distance:
 *               type: number
 *               format: float
 *               description: "Distance to the vendor from the user's location in kilometers."
 *               nullable: true
 *             rating:
 *               type: object
 *               properties:
 *                 average: { type: number, format: float }
 *                 count: { type: integer }
 *     VendorListItem:
 *       allOf:
 *         - $ref: '#/components/schemas/Vendor'
 *         - type: object
 *           properties:
 *             distance:
 *               type: number
 *               format: float
 *               description: "Distance to the vendor from the user's location in kilometers."
 *               nullable: true
 *             rating:
 *               type: object
 *               properties:
 *                 average: { type: number, format: float }
 *                 count: { type: integer }
 *             cartItemCount:
 *               type: integer
 *               description: "Number of items in the user's cart for this vendor. Only present if user is authenticated."
 *     PaginatedVendors:
 *       type: object
 *       properties:
 *         page: { type: integer }
 *         totalPages: { type: integer }
 *         pageSize: { type: integer }
 *         totalCount: { type: integer }
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/VendorListItem'
 *     CreateVendorPayload:
 *       type: object
 *       required: [name]
 *       properties:
 *         name: { type: string, example: "John's Groceries" }
 *         email: { type: string, format: email, nullable: true, example: "contact@johnsgroceries.com" }
 *         tagline: { type: string, nullable: true, example: "Fresh and Local" }
 *         details: { type: string, nullable: true, example: "Your one-stop shop for fresh produce and daily essentials." }
 *         image: { type: string, format: uri, nullable: true }
 *         address: { type: string, nullable: true, example: "123 Main St, Anytown, USA" }
 *         longitude: { type: number, format: float, nullable: true, example: -73.935242 }
 *         latitude: { type: number, format: float, nullable: true, example: 40.730610 }
 *         meta: { type: object, nullable: true }
 *     UpdateVendorPayload:
 *       type: object
 *       properties:
 *         name: { type: string }
 *         email: { type: string, format: email }
 *         tagline: { type: string }
 *         details: { type: string }
 *         image: { type: string, format: uri }
 *         address: { type: string }
 *         longitude: { type: number, format: float }
 *         latitude: { type: number, format: float }
 *         isVerified: { type: boolean }
 *         meta: { type: object }
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
 *               $ref: '#/components/schemas/VendorWithDetails'
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
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter vendors by the user who owns them.
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
  const {name, latitude, longitude, userId: queryUserId}: getVendorsFilters = req.query;
  const authUserId = req.userId;
  const page = req?.query?.page?.toString() || "1";
  const take = req?.query?.size?.toString() || "20"; 
  try {
    const vendors = await vendorService.getAllVendors({name, latitude, longitude, userId: queryUserId || authUserId}, {page, take});
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
 *               $ref: '#/components/schemas/VendorWithRelations'
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
 *               $ref: '#/components/schemas/VendorWithRelations'
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
 *                 $ref: '#/components/schemas/VendorWithRelations'
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