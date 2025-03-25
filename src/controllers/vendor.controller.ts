// controllers/vendor.controller.ts
import { Request, Response } from 'express';
import * as vendorService from '../services/vendor.service';

export const createVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await vendorService.createVendor(req.body);
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
    res.json(vendor);
  } catch (error) {
    console.error('Error getting vendor by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllVendors = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string | undefined;
    const vendors = await vendorService.getAllVendors(userId);
    res.json(vendors);
  } catch (error) {
    console.error('Error getting all vendors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await vendorService.updateVendor({ id: req.params.id, ...req.body });
    res.json(vendor);
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await vendorService.deleteVendor(req.params.id);
    res.json(vendor);
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getVendorsByUserId = async (req: Request, res: Response) => {
  try {
    const vendors = await vendorService.getVendorsByUserId(req.params.userId);
    res.json(vendors);
  } catch (error) {
    console.error('Error getting vendors by userId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};