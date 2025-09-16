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
 * @swagger
 * /fees:
 *   post:
 *     summary: Create a new fee
 *     tags: [Fee]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFeePayload'
 *     responses:
 *       201:
 *         description: The created fee.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fee'
 *       400:
 *         description: Bad request, invalid payload.
 *       500:
 *         description: Internal server error.
 * components:
 *   schemas:
 *     FeeType:
 *       type: string
 *       enum: [delivery, service, shopping]
 *     FeeCalculationMethod:
 *       type: string
 *       enum: [flat, percentage, per_unit, per_distance]
 *     Fee:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         type: { $ref: '#/components/schemas/FeeType' }
 *         amount: { type: number, format: float }
 *         method: { $ref: '#/components/schemas/FeeCalculationMethod' }
 *         unit: { type: string, nullable: true, description: "e.g., 'km' for per_distance" }
 *         minThreshold: { type: number, format: float, nullable: true }
 *         maxThreshold: { type: number, format: float, nullable: true }
 *         thresholdAppliesTo: { type: string, nullable: true, description: "e.g., 'order_subtotal'" }
 *         isActive: { type: boolean }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     CreateFeePayload:
 *       type: object
 *       required: [type, amount, method, isActive]
 *       properties:
 *         type: { $ref: '#/components/schemas/FeeType' }
 *         amount: { type: number, format: float }
 *         method: { $ref: '#/components/schemas/FeeCalculationMethod' }
 *         unit: { type: string, nullable: true }
 *         minThreshold: { type: number, format: float, nullable: true }
 *         maxThreshold: { type: number, format: float, nullable: true }
 *         thresholdAppliesTo: { type: string, nullable: true }
 *         isActive: { type: boolean }
 *     UpdateFeePayload:
 *       type: object
 *       properties:
 *         amount: { type: number, format: float }
 *         method: { $ref: '#/components/schemas/FeeCalculationMethod' }
 *         unit: { type: string, nullable: true }
 *         minThreshold: { type: number, format: float, nullable: true }
 *         maxThreshold: { type: number, format: float, nullable: true }
 *         thresholdAppliesTo: { type: string, nullable: true }
 *         isActive: { type: boolean }
 *     CalculateFeesPayload:
 *       type: object
 *       required: [orderItems, vendorId, deliveryAddressId]
 *       properties:
 *         orderItems:
 *           type: array
 *           items:
 *             type: object
 *             required: [vendorProductId, quantity]
 *             properties:
 *               vendorProductId: { type: string, format: uuid }
 *               quantity: { type: integer, minimum: 1 }
 *         vendorId: { type: string, format: uuid }
 *         deliveryAddressId: { type: string, format: uuid }
 *     CalculateFeesResponse:
 *       type: object
 *       properties:
 *         subtotal: { type: number, format: float }
 *         shoppingFee: { type: number, format: float }
 *         deliveryFee: { type: number, format: float }
 *         serviceFee: { type: number, format: float }
 *         totalEstimatedCost: { type: number, format: float }
 */
export const createFeeController = async (req: Request, res: Response) => {
  try {
    const payload: CreateFeePayload = req.body;
    const newFee = await createFee(payload);
    res.status(201).json(newFee);
  } catch (error: any) {
    console.error('Error in createFeeController:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

/**
 * @swagger
 * /fees/{id}:
 *   patch:
 *     summary: Update an existing fee
 *     tags: [Fee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the fee to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFeePayload'
 *     responses:
 *       200:
 *         description: The updated fee.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fee'
 *       400:
 *         description: Bad request, invalid payload.
 *       404:
 *         description: Fee not found.
 *       500:
 *         description: Internal server error.
 */
export const updateFeeController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload: UpdateFeePayload = req.body;

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
 * @swagger
 * /fees/{id}:
 *   delete:
 *     summary: Delete a fee by its ID
 *     tags: [Fee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the fee to delete.
 *     responses:
 *       200:
 *         description: The deleted fee.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fee'
 *       404:
 *         description: Fee not found.
 *       500:
 *         description: Internal server error.
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
 * @swagger
 * /fees/deactivate/{type}:
 *   patch:
 *     summary: Deactivate the current active fee of a specific type
 *     tags: [Fee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [delivery, service, shopping]
 *         description: The type of fee to deactivate.
 *     responses:
 *       200:
 *         description: The deactivated fee.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fee'
 *       400:
 *         description: Invalid fee type provided.
 *       404:
 *         description: No active fee of the specified type was found.
 *       500:
 *         description: Internal server error.
 */
export const deactivateFeeController = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;

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
 * @swagger
 * /fees/current:
 *   get:
 *     summary: Get all current active fees
 *     tags: [Fee]
 *     responses:
 *       200:
 *         description: A list of all active fees.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Fee'
 *       404:
 *         description: No active fees found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /fees/current/{type}:
 *   get:
 *     summary: Get the current active fee for a specific type
 *     tags: [Fee]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [delivery, service, shopping]
 *         description: The type of fee to retrieve.
 *     responses:
 *       200:
 *         description: The requested active fee.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fee'
 *       400:
 *         description: Invalid fee type provided.
 *       404:
 *         description: No active fee of the specified type was found.
 *       500:
 *         description: Internal server error.
 */

// Controller for getting current active fees.
// GET /fees/current
// GET /fees/current/:type
export const getCurrentFeesController = async (req: Request, res: Response) => {
  try {
    const { type } = req.params; // Optional type parameter

    let result: any;
    if (type) {
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
 * @swagger
 * /fees/calculate-fees:
 *   post:
 *     summary: Calculate the total estimated cost for an order
 *     tags: [Fee, Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CalculateFeesPayload'
 *     responses:
 *       200:
 *         description: The calculated fees for the order.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CalculateFeesResponse'
 *       400:
 *         description: Bad request, invalid payload.
 *       500:
 *         description: Internal server error.
 */
export const calculateFeesController = async (req: Request, res: Response) => {
  try {
    const { orderItems, vendorId, deliveryAddressId } = req.body;

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
