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
 *                 description: The name of the model this media is associated with (e.g., "User", "Product", "Vendor").
 *     responses:
 *       201:
 *         description: File uploaded successfully. Returns Cloudinary response.
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

    res.status(201).json({ message: 'File uploaded successfully', data: result });
  } catch (error: any) {
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
};