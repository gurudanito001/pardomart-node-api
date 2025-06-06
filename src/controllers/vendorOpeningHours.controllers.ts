// controllers/vendorOpeningHours.controller.ts
import { Request, Response } from 'express';
import * as vendorOpeningHoursService from '../services/vendorOpeningHours.service';
import { Prisma } from '@prisma/client'; // Import Prisma

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