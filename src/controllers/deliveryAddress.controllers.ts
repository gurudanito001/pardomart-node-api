import { Request, Response } from 'express';
import { createDeliveryAddressService, getDeliveryAddressByIdService, getDeliveryAddressesByUserIdService, getDefaultDeliveryAddressByUserIdService, updateDeliveryAddressService, deleteDeliveryAddressService, setDefaultDeliveryAddressService } from "../services/deliveryAddress.service";

import * as deliveryAddressModel from "../models/deliveryAddress.model";
import { Prisma } from '@prisma/client';
import { errorLogService } from '../services/errorLog.service';

// A better approach would be to have this in a shared types file
interface AuthenticatedRequest extends Request {
  userId?: string;
}

/**
 * @swagger
 * /deliveryAddress:
 *   post:
 *     summary: Create a new delivery address for the authenticated user
 *     tags: [Delivery Address]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDeliveryAddressPayload'
 *     responses:
 *       201:
 *         description: The created delivery address.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryAddress'
 *       400:
 *         description: Bad request, required fields are missing.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 * components:
 *   schemas:
 *     DeliveryAddress:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         userId: { type: string, format: uuid }
 *         label: { type: string, nullable: true }
 *         addressLine1: { type: string }
 *         addressLine2: { type: string, nullable: true }
 *         city: { type: string }
 *         state: { type: string, nullable: true }
 *         postalCode: { type: string, nullable: true }
 *         country: { type: string }
 *         latitude: { type: number, format: float, nullable: true }
 *         longitude: { type: number, format: float, nullable: true }
 *         isDefault: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     CreateDeliveryAddressPayload:
 *       type: object
 *       required:
 *         - addressLine1
 *         - city
 *       properties:
 *         label: { type: string, nullable: true, example: "Home" }
 *         addressLine1: { type: string, example: "123 Main St" }
 *         addressLine2: { type: string, nullable: true, example: "Apt 4B" }
 *         city: { type: string, example: "Anytown" }
 *         state: { type: string, nullable: true, example: "Anystate" }
 *         postalCode: { type: string, nullable: true, example: "12345" }
 *         country: { type: string, example: "Nigeria" }
 *         latitude: { type: number, format: float, nullable: true }
 *         longitude: { type: number, format: float, nullable: true }
 *         isDefault: { type: boolean, description: "If true, this will become the user's new default address." }
 *     UpdateDeliveryAddressPayload:
 *       type: object
 *       properties:
 *         label: { type: string, nullable: true, example: "Work" }
 *         addressLine1: { type: string, example: "456 Business Rd" }
 *         addressLine2: { type: string, nullable: true }
 *         city: { type: string, example: "Businesstown" }
 *         state: { type: string, nullable: true, example: "Business-state" }
 *         postalCode: { type: string, nullable: true, example: "54321" }
 *         country: { type: string, example: "Nigeria" }
 *         latitude: { type: number, format: float, nullable: true }
 *         longitude: { type: number, format: float, nullable: true }
 *         isDefault: { type: boolean }
 */
export const createDeliveryAddressController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found.' });
    }

    const payload: deliveryAddressModel.CreateDeliveryAddressPayload = {
      ...req.body,
      userId: userId,
    };

    const newAddress = await createDeliveryAddressService(payload);
    res.status(201).json(newAddress);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to create delivery address',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: req.userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'CREATE_DELIVERY_ADDRESS_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /deliveryAddress/{id}:
 *   get:
 *     summary: Get a specific delivery address by its ID
 *     tags: [Delivery Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the delivery address.
 *     responses:
 *       200:
 *         description: The requested delivery address.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryAddress'
 *       404:
 *         description: Delivery address not found.
 */
export const getDeliveryAddressByIdController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const address = await getDeliveryAddressByIdService(id);
    if (!address) {
      return res.status(404).json({ error: 'Delivery address not found.' });
    }
    res.status(200).json(address);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to get delivery address by ID',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: req.userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'GET_DELIVERY_ADDRESS_BY_ID_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /deliveryAddress/me:
 *   get:
 *     summary: Get all delivery addresses for the authenticated user
 *     tags: [Delivery Address]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of the user's delivery addresses.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DeliveryAddress'
 *       401:
 *         description: Unauthorized.
 */
export const getMyDeliveryAddressesController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found.' });
    }

    const addresses = await getDeliveryAddressesByUserIdService(userId);
    res.status(200).json(addresses);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to get my delivery addresses',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: req.userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'GET_MY_DELIVERY_ADDRESSES_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /deliveryAddress/me/default:
 *   get:
 *     summary: Get the default delivery address for the authenticated user
 *     tags: [Delivery Address]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user's default delivery address.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryAddress'
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: No default address found for this user.
 */
export const getMyDefaultDeliveryAddressController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found.' });
    }

    const defaultAddress = await getDefaultDeliveryAddressByUserIdService(userId);
    if (!defaultAddress) {
      return res.status(404).json({ message: 'No default address found for this user.' });
    }
    res.status(200).json(defaultAddress);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to get my default delivery address',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: req.userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'GET_MY_DEFAULT_DELIVERY_ADDRESS_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /deliveryAddress/{id}:
 *   put:
 *     summary: Update a delivery address
 *     tags: [Delivery Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the delivery address to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDeliveryAddressPayload'
 *     responses:
 *       200:
 *         description: The updated delivery address.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryAddress'
 *       404:
 *         description: Delivery address not found.
 */
export const updateDeliveryAddressController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const payload: deliveryAddressModel.UpdateDeliveryAddressPayload = req.body;

    const updatedAddress = await updateDeliveryAddressService(id, payload);
    res.status(200).json(updatedAddress);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to update delivery address',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: req.userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'UPDATE_DELIVERY_ADDRESS_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    // The service/model layer throws a generic error for not found.
    if (error.message.toLowerCase().includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /deliveryAddress/{id}:
 *   delete:
 *     summary: Delete a delivery address by its ID
 *     tags: [Delivery Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the delivery address to delete.
 *     responses:
 *       200:
 *         description: The deleted delivery address.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryAddress'
 *       404:
 *         description: Delivery address not found.
 */
export const deleteDeliveryAddressController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedAddress = await deleteDeliveryAddressService(id);
    res.status(200).json(deletedAddress);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to delete delivery address',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: (req as AuthenticatedRequest).userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'DELETE_DELIVERY_ADDRESS_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    // The service/model layer throws a generic error for not found.
    if (error.message.toLowerCase().includes('not found')) {
      return res.status(404).json({ error: 'Delivery address not found.' });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /deliveryAddress/{id}/set-default:
 *   patch:
 *     summary: Set a delivery address as the default for the authenticated user
 *     tags: [Delivery Address]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the delivery address to set as default.
 *     responses:
 *       200:
 *         description: The updated default delivery address.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryAddress'
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Delivery address not found.
 *       500:
 *         description: Internal server error.
 */
export const setDefaultDeliveryAddressController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found.' });
    }
    const { id: addressId } = req.params;

    const newDefaultAddress = await setDefaultDeliveryAddressService(userId, addressId);
    res.status(200).json(newDefaultAddress);
  } catch (error: any) {
    await errorLogService.logError({
      message: error.message || 'Failed to set default delivery address',
      stackTrace: error.stack,
      metaData: { body: req.body, query: req.query, params: req.params },
      userId: req.userId as string,
      ipAddress: req.ip || req.socket?.remoteAddress,
      requestMethod: req.method,
      requestPath: req.originalUrl || req.path,
      statusCode: error.statusCode || 500,
      errorCode: error.code || 'SET_DEFAULT_DELIVERY_ADDRESS_ERROR'
    }).catch((logErr: any) => console.error('Failed to log error:', logErr));

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Delivery address not found or does not belong to the user.' });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};