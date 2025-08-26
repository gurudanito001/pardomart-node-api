// controllers/vendorOpeningHours.controller.ts
import { Request, Response } from 'express';
import * as vendorOpeningHoursService from '../services/vendorOpeningHours.service';
import { Prisma } from '@prisma/client'; // Import Prisma

/**
 * @swagger
 * /openingHours:
 *   patch:
 *     summary: Update opening hours for a specific day
 *     tags: [VendorOpeningHours]
 *     security:
 *       - bearerAuth: []
 *     description: Finds and updates the opening and closing times for a given vendor on a specific day of the week.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vendorId
 *               - day
 *             properties:
 *               vendorId:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the vendor whose opening hours are being updated.
 *               day:
 *                 $ref: '#/components/schemas/Days'
 *                 description: The day of the week to update.
 *               open:
 *                 type: string
 *                 format: "HH:mm"
 *                 description: "The opening time in 24-hour format (e.g., '09:00'). Set to null to mark as closed."
 *               close:
 *                 type: string
 *                 format: "HH:mm"
 *                 description: "The closing time in 24-hour format (e.g., '18:00'). Set to null to mark as closed."
 *     responses:
 *       200:
 *         description: The updated opening hours record.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorOpeningHours'
 *       400:
 *         description: Bad request, vendorId and day are required.
 *       404:
 *         description: Opening hours record not found for the specified vendor and day.
 *       409:
 *         description: Conflict - this should not typically occur on an update.
 *       500:
 *         description: Internal server error.
 */
export const updateVendorOpeningHours = async (req: Request, res: Response) => {
  try {
    const { vendorId, day, open, close } = req.body;

    if (!vendorId || !day) {
      return res.status(400).json({ error: 'Vendor ID and Day are required for updating' });
    }

    // Find the existing record by vendorId and day
    const existingOpeningHours = await vendorOpeningHoursService.getVendorOpeningHoursByVendorIdAndDay(vendorId, day);

    if (!existingOpeningHours) {
      return res.status(404).json({ error: 'Vendor opening hours not found for the specified vendor and day' });
    }

    // Update the record
    const updatedOpeningHours = await vendorOpeningHoursService.updateVendorOpeningHours({
      id: existingOpeningHours.id,
      open,
      close,
    });

    res.json(updatedOpeningHours);

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'Vendor opening hours for this day already exists' });
    }
    console.error('Error updating vendor opening hours:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /openingHours:
 *   get:
 *     summary: Get all opening hours for a specific vendor
 *     tags: [VendorOpeningHours]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the vendor to retrieve opening hours for.
 *     responses:
 *       200:
 *         description: A list of the vendor's opening hours.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VendorOpeningHours'
 *       500:
 *         description: Internal server error.
 */
export const getAllVendorOpeningHours = async (req: Request, res: Response) => {
  try {
    const vendorId = req.query.vendorId as string ;
    const vendorOpeningHours = await vendorOpeningHoursService.getAllVendorOpeningHours(vendorId);
    res.json(vendorOpeningHours);
  } catch (error) {
    console.error('Error getting all vendor opening hours:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* export const getVendorOpeningHoursById = async (req: Request, res: Response) => {
  try {
    const vendorOpeningHours = await vendorOpeningHoursService.getVendorOpeningHoursById(req.params.id);
    if (!vendorOpeningHours) {
      return res.status(404).json({ error: 'Vendor opening hours not found' });
    }
    res.json(vendorOpeningHours);
  } catch (error) {
    console.error('Error getting vendor opening hours by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; */



/* export const updateVendorOpeningHours = async (req: Request, res: Response) => {
  try {
    const vendorOpeningHours = await vendorOpeningHoursService.updateVendorOpeningHours({ id: req.params.id, ...req.body });
    res.json(vendorOpeningHours);
  } catch (error) {
    console.error('Error updating vendor opening hours:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; */

/* export const deleteVendorOpeningHours = async (req: Request, res: Response) => {
  try {
    const vendorOpeningHours = await vendorOpeningHoursService.deleteVendorOpeningHours(req.params.id);
    res.json(vendorOpeningHours);
  } catch (error) {
    console.error('Error deleting vendor opening hours:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; */