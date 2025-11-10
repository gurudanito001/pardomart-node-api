// src/controllers/ad.controller.ts
import { Request, Response } from 'express';
import * as adService from '../services/ad.service';
import { AdError } from '../services/ad.service';
import { Prisma } from '@prisma/client';

/**
 * @swagger
 * tags:
 *   name: Ads
 *   description: Advertisement management for stores
 */

/**
 * @swagger
 * /ads:
 *   post:
 *     summary: Create a new ad (Admin)
 *     tags: [Ads, Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Creates a new advertisement for a store. Requires admin privileges.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdPayload'
 *     responses:
 *       201:
 *         description: The created ad.
 *         content: { "application/json": { "schema": { "$ref": "#/components/schemas/Ad" } } }
 *       400: { description: "Bad request (e.g., missing fields or image)." }
 */
export const createAdController = async (req: Request, res: Response) => {
  try {
    const payload = {
      ...req.body,
      imageFile: req.file,
    };

    // Convert string booleans/numbers from form-data
    if (payload.isActive) payload.isActive = payload.isActive === 'true';

    const ad = await adService.createAdService(payload);
    res.status(201).json(ad);
  } catch (error) {
    if (error instanceof AdError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Error creating ad:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /ads:
 *   get:
 *     summary: Get a list of ads
 *     tags: [Ads]
 *     description: Retrieves a list of ads. Publicly accessible to get active ads. Admins can filter by status.
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *         description: "Filter by active status. If true, only returns currently running ads."
 *       - in: query
 *         name: vendorId
 *         schema: { type: string, format: uuid }
 *         description: "Filter ads for a specific store."
 *     responses:
 *       200:
 *         description: A list of ads.
 *         content: { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/Ad" } } } }
 */
export const listAdsController = async (req: Request, res: Response) => {
  try {
    const { isActive, vendorId } = req.query;
    const filters: any = {};
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (vendorId) filters.vendorId = vendorId as string;

    const ads = await adService.listAdsService(filters);
    res.status(200).json(ads);
  } catch (error) {
    console.error('Error listing ads:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /ads/{id}:
 *   get:
 *     summary: Get a single ad by ID
 *     tags: [Ads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: The requested ad.
 *         content: { "application/json": { "schema": { "$ref": "#/components/schemas/Ad" } } }
 *       404: { description: "Ad not found." }
 */
export const getAdByIdController = async (req: Request, res: Response) => {
  try {
    const ad = await adService.getAdByIdService(req.params.id);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found.' });
    }
    res.status(200).json(ad);
  } catch (error) {
    console.error('Error getting ad by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /ads/{id}:
 *   patch:
 *     summary: Update an ad (Admin)
 *     tags: [Ads, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema: { $ref: '#/components/schemas/UpdateAdPayload' }
 *     responses:
 *       200: { description: "The updated ad." }
 *       404: { description: "Ad not found." }
 */
export const updateAdController = async (req: Request, res: Response) => {
  try {
    const { isActive, endDate, ...restOfBody } = req.body;
    const payload: any = { ...restOfBody, imageFile: req.file };

    if (isActive !== undefined) {
      payload.isActive = isActive === 'true';
    }
    if (endDate !== undefined) {
      payload.endDate = endDate === 'null' ? null : endDate;
    }
    const ad = await adService.updateAdService(req.params.id, payload as adService.UpdateAdServicePayload);
    res.status(200).json(ad);
  } catch (error) {
    if (error instanceof AdError) return res.status(error.statusCode).json({ error: error.message });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return res.status(404).json({ error: 'Ad not found.' });
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @swagger
 * /ads/{id}:
 *   delete:
 *     summary: Delete an ad (Admin)
 *     tags: [Ads, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204: { description: "Ad deleted successfully." }
 *       404: { description: "Ad not found." }
 */
export const deleteAdController = async (req: Request, res: Response) => {
  try {
    await adService.deleteAdService(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof AdError) return res.status(error.statusCode).json({ error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};