import { Request, Response } from 'express';
import * as mediaService from '../services/media.service';
import { ReferenceType } from '@prisma/client';

/**
 * @swagger
 * /media/upload:
 *   post:
 *     summary: Upload a media file
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Uploads a file (image, document, etc.) to the server.
 *       The file is stored on Cloudinary, and a corresponding record is created in the database.
 *       This endpoint requires a `multipart/form-data` request.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file, referenceId, referenceType]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload.
 *               referenceId:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the resource this media is associated with (e.g., a user ID, product ID).
 *               referenceType:
 *                 type: string
 *                 description: The type of resource the media is associated with.
 *                 enum: [bug_report_image, user_image, store_image, product_image, category_image, document, other]
 *     responses:
 *       201:
 *         description: File uploaded successfully. Returns the created media record.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully
 *                 data:
 *                   $ref: '#/components/schemas/Media'
 *       400:
 *         description: Bad request (e.g., no file uploaded, missing referenceId or referenceType).
 *       500:
 *         description: Internal server error.
 */
export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const { referenceId, referenceType } = req.body;

    if (!referenceId || !referenceType) {
      return res
        .status(400)
        .json({ message: 'referenceId and referenceType are required.' });
    }

    // Validate that referenceType is a valid enum value
    if (!Object.values(ReferenceType).includes(referenceType as ReferenceType)) {
      return res.status(400).json({
        message: `Invalid referenceType. Must be one of: ${Object.values(ReferenceType).join(', ')}`,
      });
    }

    const result = await mediaService.uploadMedia(
      req.file,
      referenceId,
      referenceType
    );

    res.status(201).json({ message: 'File uploaded successfully', data: result.dbRecord });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: error.message || 'Error uploading file' });
  }
};

/**
 * @swagger
 * /media:
 *   get:
 *     summary: Get media by reference ID
 *     tags: [Media]
 *     parameters:
 *       - in: query
 *         name: referenceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the resource (e.g., vendor ID).
 *       - in: query
 *         name: referenceType
 *         schema:
 *           type: string
 *           enum: [bug_report_image, user_image, store_image, product_image, category_image, document, other]
 *         description: Filter by type of media.
 *     responses:
 *       200:
 *         description: List of media files.
 *       400:
 *         description: Missing referenceId or invalid referenceType.
 *       500:
 *         description: Internal server error.
 */
export const getMedia = async (req: Request, res: Response) => {
  try {
    const { referenceId, referenceType } = req.query;

    if (!referenceId) {
      return res.status(400).json({ message: 'referenceId is required.' });
    }

    if (referenceType && !Object.values(ReferenceType).includes(referenceType as ReferenceType)) {
      return res.status(400).json({
        message: `Invalid referenceType. Must be one of: ${Object.values(ReferenceType).join(', ')}`,
      });
    }

    const media = await mediaService.getMediaByReference(referenceId as string, referenceType as ReferenceType);
    res.status(200).json(media);
  } catch (error: any) {
    console.error('Error fetching media:', error);
    res.status(500).json({ message: error.message || 'Error fetching media' });
  }
};

/**
 * @swagger
 * /media/{id}:
 *   delete:
 *     summary: Delete a media file
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the media record to delete.
 *     responses:
 *       200:
 *         description: File deleted successfully.
 *       404:
 *         description: Media not found.
 *       500:
 *         description: Internal server error.
 */
export const deleteMedia = async (req: Request, res: Response) => {
  try {
    await mediaService.deleteMedia(req.params.id);
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting media:', error);
    if (error.message === 'Media not found') {
      return res.status(404).json({ message: 'Media not found' });
    }
    res.status(500).json({ message: error.message || 'Error deleting file' });
  }
};