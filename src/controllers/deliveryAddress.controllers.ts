import { Request, Response, Router } from 'express';
import { createDeliveryAddressService, getDeliveryAddressByIdService, getDeliveryAddressesByUserIdService, getDefaultDeliveryAddressByUserIdService, updateDeliveryAddressService, deleteDeliveryAddressService, setDefaultDeliveryAddressService } from "../services/deliveryAddress.service";

import * as deliveryAddressModel from "../models/deliveryAddress.model"


/**
 * Controller for creating a new delivery address.
 * POST /addresses
 */
export const createDeliveryAddressController = async (req: Request, res: Response) => {
  try {
    // Assuming userId comes from authentication middleware
    const userId = (req as any).userId; // Adjust type based on your AuthenticatedRequest
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found.' });
    }

    const payload: deliveryAddressModel.CreateDeliveryAddressPayload = {
      ...req.body,
      userId: userId, // Ensure userId is set from authenticated user
    };

    // Basic validation
    if (!payload.addressLine1 || !payload.city) {
      return res.status(400).json({ error: 'Address Line 1 and City are required.' });
    }

    const newAddress = await createDeliveryAddressService(payload);
    res.status(201).json(newAddress);
  } catch (error: any) {
    console.error('Error in createDeliveryAddressController:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * Controller for getting a delivery address by ID.
 * GET /addresses/:id
 */
export const getDeliveryAddressByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const address = await getDeliveryAddressByIdService(id);
    if (!address) {
      return res.status(404).json({ error: 'Delivery address not found.' });
    }
    res.status(200).json(address);
  } catch (error: any) {
    console.error('Error in getDeliveryAddressByIdController:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * Controller for getting all delivery addresses for the authenticated user.
 * GET /addresses/me
 */
export const getMyDeliveryAddressesController = async (req: Request, res: Response) => {
  try {
    // Assuming userId comes from authentication middleware
    const userId = (req as any).userId; // Adjust type based on your AuthenticatedRequest
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found.' });
    }

    const addresses = await getDeliveryAddressesByUserIdService(userId);
    res.status(200).json(addresses);
  } catch (error: any) {
    console.error('Error in getMyDeliveryAddressesController:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * Controller for getting the default delivery address for the authenticated user.
 * GET /addresses/me/default
 */
export const getMyDefaultDeliveryAddressController = async (req: Request, res: Response) => {
  try {
    // Assuming userId comes from authentication middleware
    const userId = (req as any).userId; // Adjust type based on your AuthenticatedRequest
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found.' });
    }

    const defaultAddress = await getDefaultDeliveryAddressByUserIdService(userId);
    if (!defaultAddress) {
      return res.status(404).json({ message: 'No default address found for this user.' });
    }
    res.status(200).json(defaultAddress);
  } catch (error: any) {
    console.error('Error in getMyDefaultDeliveryAddressController:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * Controller for updating a delivery address.
 * PUT /addresses/:id
 */
export const updateDeliveryAddressController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload: deliveryAddressModel.UpdateDeliveryAddressPayload = req.body;

    // Basic validation
    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ error: 'No update data provided.' });
    }

    const updatedAddress = await updateDeliveryAddressService(id, payload);
    res.status(200).json(updatedAddress);
  } catch (error: any) {
    console.error('Error in updateDeliveryAddressController:', error);
    if (error.message === 'Delivery address not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * Controller for deleting a delivery address.
 * DELETE /addresses/:id
 */
export const deleteDeliveryAddressController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedAddress = await deleteDeliveryAddressService(id);
    res.status(200).json(deletedAddress);
  } catch (error: any) {
    console.error('Error in deleteDeliveryAddressController:', error);
    if (error.message === 'Delivery address not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * Controller for setting a delivery address as default.
 * PATCH /addresses/:id/set-default
 */
export const setDefaultDeliveryAddressController = async (req: Request, res: Response) => {
  try {
    // Assuming userId comes from authentication middleware
    const userId = (req as any).userId; // Adjust type based on your AuthenticatedRequest
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found.' });
    }
    const { id: addressId } = req.params;

    const newDefaultAddress = await setDefaultDeliveryAddressService(userId, addressId);
    res.status(200).json(newDefaultAddress);
  } catch (error: any) {
    console.error('Error in setDefaultDeliveryAddressController:', error);
    if (error.message === 'Delivery address not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};