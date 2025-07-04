import { Request, Response } from 'express';
import {
  createFee,
  updateFee,
  deleteFee,
  deactivateFee,
  getCurrentFees,
  CreateFeePayload,
  UpdateFeePayload,
  calculateOrderFeesService
} from '../services/fee.service'; // Adjust the path to your fee service file
import { FeeType } from '@prisma/client'; // Assuming FeeType enum is exported from Prisma client

// --- Fee Controllers ---

/**
 * Controller for creating a new fee.
 * POST /fees
 */
export const createFeeController = async (req: Request, res: Response) => {
  try {
    const payload: CreateFeePayload = req.body;

    // Basic validation (can be expanded with express-validator or similar)
    if (!payload.type || !payload.amount) {
      return res.status(400).json({ error: 'Fee type and amount are required.' });
    }
    if (!Object.values(FeeType).includes(payload.type)) {
      return res.status(400).json({ error: `Invalid FeeType: ${payload.type}` });
    }
    if (typeof payload.amount !== 'number' || payload.amount < 0) {
      return res.status(400).json({ error: 'Amount must be a non-negative number.' });
    }

    const newFee = await createFee(payload);
    res.status(201).json(newFee);
  } catch (error: any) {
    console.error('Error in createFeeController:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * Controller for updating an existing fee.
 * PATCH /fees/:id
 */
export const updateFeeController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload: UpdateFeePayload = req.body;

    // Basic validation
    if (payload.amount !== undefined && (typeof payload.amount !== 'number' || payload.amount < 0)) {
      return res.status(400).json({ error: 'Amount must be a non-negative number if provided.' });
    }
    if (payload.isActive !== undefined && typeof payload.isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean if provided.' });
    }

    const updatedFee = await updateFee(id, payload);
    res.status(200).json(updatedFee);
  } catch (error: any) {
    console.error('Error in updateFeeController:', error);
    if (error.message === 'Fee not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * Controller for deleting a fee.
 * DELETE /fees/:id
 */
export const deleteFeeController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedFee = await deleteFee(id);
    res.status(200).json(deletedFee);
  } catch (error: any) {
    console.error('Error in deleteFeeController:', error);
    if (error.message === 'Fee not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * Controller for deactivating a fee by type.
 * PATCH /fees/deactivate/:type
 */
export const deactivateFeeController = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;

    // Validate FeeType from params
    if (!Object.values(FeeType).includes(type as FeeType)) {
      return res.status(400).json({ error: `Invalid FeeType: ${type}` });
    }

    const deactivatedFee = await deactivateFee(type as FeeType);
    if (deactivatedFee) {
      res.status(200).json(deactivatedFee);
    } else {
      res.status(404).json({ message: `No active fee found for type: ${type}` });
    }
  } catch (error: any) {
    console.error('Error in deactivateFeeController:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * Controller for getting current active fees.
 * GET /fees/current
 * GET /fees/current/:type
 */
export const getCurrentFeesController = async (req: Request, res: Response) => {
  try {
    const { type } = req.params; // Optional type parameter

    let result: any;
    if (type) {
      // Validate FeeType from params if provided
      if (!Object.values(FeeType).includes(type as FeeType)) {
        return res.status(400).json({ error: `Invalid FeeType: ${type}` });
      }
      result = await getCurrentFees(type as FeeType);
    } else {
      result = await getCurrentFees();
    }

    if (result === null || (Array.isArray(result) && result.length === 0)) {
      res.status(404).json({ message: 'No active fees found.' });
    } else {
      res.status(200).json(result);
    }
  } catch (error: any) {
    console.error('Error in getCurrentFeesController:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};


/**
 * Controller to handle the request for calculating order fees.
 * POST /api/orders/calculate-fees
 */
export const calculateFeesController = async (req: Request, res: Response) => {
  try {
    const { orderItems, vendorId, deliveryAddressId } = req.body;

    // Basic validation of incoming request body
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ error: 'orderItems array is required and cannot be empty.' });
    }
    for (const item of orderItems) {
      if (!item.vendorProductId || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return res.status(400).json({ error: 'Each order item must have a valid vendorProductId and a positive quantity.' });
      }
    }
    if (!vendorId || typeof vendorId !== 'string') {
      return res.status(400).json({ error: 'vendorId is required and must be a string.' });
    }
    if (!deliveryAddressId || typeof deliveryAddressId !== 'string') {
      return res.status(400).json({ error: 'deliveryAddressId is required and must be a string.' });
    }

    // Call the service to calculate fees
    const feesResult = await calculateOrderFeesService({
      orderItems,
      vendorId,
      deliveryAddressId,
    });

    res.status(200).json(feesResult);
  } catch (error: any) {
    console.error('Error in calculateFeesController:', error);
    res.status(500).json({ error: error.message || 'Internal server error during fee calculation.' });
  }
};
