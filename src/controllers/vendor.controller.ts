// controllers/vendor.controller.ts
import { Request, Response } from 'express';
import * as vendorService from '../services/vendor.service';
import { getVendorsFilters } from '../models/vendor.model';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const createVendor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const vendor = await vendorService.createVendor({...req.body, userId: req?.userId});
    res.status(201).json(vendor);
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getVendorById = async (req: Request, res: Response) => {
  try {
    const vendor = await vendorService.getVendorById(req.params.id);
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

export const getAllVendors = async (req: Request, res: Response) => {
  const {name, latitude, longitude}: getVendorsFilters = req.query;
  const page = req?.query?.page?.toString() || "1";
  const take = req?.query?.size?.toString() || "20"; 
  try {
    const vendors = await vendorService.getAllVendors({name, latitude, longitude}, {page, take});
    res.status(200).json(vendors);
  } catch (error) {
    console.error('Error getting all vendors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateVendor = async (req: Request, res: Response) => {
  try {
    const id = req.params.id
    const vendor = await vendorService.updateVendor(id, req.body);
    res.status(200).json(vendor);
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await vendorService.deleteVendor(req.params.id);
    res.status(200).json(vendor);
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getVendorsByUserId = async (req: Request | any, res: Response) => {
  try {
    const vendors = await vendorService.getVendorsByUserId(req.userId);
    res.status(200).json(vendors);
  } catch (error) {
    console.error('Error getting vendors by userId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};