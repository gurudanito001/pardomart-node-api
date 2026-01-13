import { Request, Response } from 'express';
import * as contentService from '../services/content.service';
import { ContentType, UpdateContentPayload } from '../models/content.model';
import { StatusCodes } from 'http-status-codes';

/**
 * @swagger
 * tags:
 *   name: Content
 *   description: Management of static content like Privacy Policy and Terms of Service
 */

/**
 * @swagger
 * /content/{type}:
 *   get:
 *     summary: Get static content by type
 *     tags: [Content]
 *     description: Retrieves the content for a given type, such as PRIVACY_POLICY. This is a public endpoint.
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/ContentType'
 *         description: The type of content to retrieve.
 *     responses:
 *       200:
 *         description: The requested content.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Content'
 *       500:
 *         description: Internal server error.
 */
export const getContentController = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const content = await contentService.getContentService(type as ContentType);
    res.status(StatusCodes.OK).json(content);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching content' });
  }
};

/**
 * @swagger
 * /content/{type}:
 *   patch:
 *     summary: Update static content by type (Admin)
 *     tags: [Content, Admin]
 *     description: Creates or updates the content for a given type. Requires admin privileges. The content should be an HTML string.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/ContentType'
 *         description: The type of content to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateContentPayload'
 *     responses:
 *       200:
 *         description: The updated content.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Content'
 *       400:
 *         description: Bad request (validation error).
 *       500:
 *         description: Internal server error.
 */
export const updateContentController = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const payload: UpdateContentPayload = req.body;
    const updatedContent = await contentService.updateContentService(type as ContentType, payload);
    res.status(StatusCodes.OK).json(updatedContent);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error updating content' });
  }
};

/**
 * @swagger
 * /content/privacy-policy/{app}:
 *   get:
 *     summary: Get privacy policy for a specific app
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: app
 *         required: true
 *         schema:
 *           type: string
 *           enum: [customer, vendor, delivery]
 *         description: The app to retrieve the privacy policy for.
 *     responses:
 *       200:
 *         description: The requested privacy policy.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Content'
 *       400:
 *         description: Invalid app type.
 *       500:
 *         description: Internal server error.
 */
export const getPrivacyPolicyController = async (req: Request, res: Response) => {
  try {
    const { app } = req.params;
    let type: ContentType;
    switch (app) {
      case 'customer': type = 'CUSTOMER_PRIVACY_POLICY' as unknown as ContentType; break;
      case 'vendor': type = 'VENDOR_PRIVACY_POLICY' as unknown as ContentType; break;
      case 'delivery': type = 'DELIVERY_PRIVACY_POLICY' as unknown as ContentType; break;
      default: return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid app type' });
    }
    const content = await contentService.getContentService(type);
    res.status(StatusCodes.OK).json(content);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching content' });
  }
};

/**
 * @swagger
 * /content/privacy-policy/{app}:
 *   patch:
 *     summary: Update privacy policy for a specific app (Admin)
 *     tags: [Content, Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Updates the privacy policy for the specified app. Supports Markdown or HTML.
 *     parameters:
 *       - in: path
 *         name: app
 *         required: true
 *         schema:
 *           type: string
 *           enum: [customer, vendor, delivery]
 *         description: The app to update the privacy policy for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateContentPayload'
 *     responses:
 *       200:
 *         description: The updated content.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Content'
 *       400:
 *         description: Bad request (validation error or invalid app type).
 *       500:
 *         description: Internal server error.
 */
export const updatePrivacyPolicyController = async (req: Request, res: Response) => {
  try {
    const { app } = req.params;
    const payload: UpdateContentPayload = req.body;
    let type: ContentType;
    switch (app) {
      case 'customer': type = 'CUSTOMER_PRIVACY_POLICY' as unknown as ContentType; break;
      case 'vendor': type = 'VENDOR_PRIVACY_POLICY' as unknown as ContentType; break;
      case 'delivery': type = 'DELIVERY_PRIVACY_POLICY' as unknown as ContentType; break;
      default: return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid app type' });
    }
    const updatedContent = await contentService.updateContentService(type, payload);
    res.status(StatusCodes.OK).json(updatedContent);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error updating content' });
  }
};
