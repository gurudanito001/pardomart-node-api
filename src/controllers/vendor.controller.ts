// controllers/vendor.controller.ts
import { Request, Response } from 'express';
import * as vendorService from '../services/vendor.service';

interface AuthenticatedRequest extends Request {
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

export const getAllVendors = async (req: Request, res: Response) => {
  try {
    const vendors = await vendorService.getAllVendors();
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

export const getVendorsByUserId = async (req: Request, res: Response) => {
  try {
    const vendors = await vendorService.getVendorsByUserId(req.params.userId);
    res.status(200).json(vendors);
  } catch (error) {
    console.error('Error getting vendors by userId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};