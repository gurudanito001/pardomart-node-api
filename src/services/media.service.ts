import { PrismaClient, MediaType } from '@prisma/client';
import cloudinary from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';

const prisma = new PrismaClient();

const getMediaType = (mimeType: string): MediaType => {
  if (mimeType.startsWith('image/')) {
    return MediaType.IMAGE;
  }
  if (mimeType.startsWith('video/')) {
    return MediaType.VIDEO;
  }
  if (mimeType.startsWith('audio/')) {
    return MediaType.AUDIO;
  }
  switch (mimeType) {
    case 'application/pdf':
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'text/plain':
      return MediaType.DOCUMENT;
    default:
      return MediaType.OTHER;
  }
};

export const uploadMedia = (
  file: Express.Multer.File,
  referenceId: string,
  referenceType: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: `pardomart/${referenceType.toLowerCase()}`,
      },
      async (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result) {
          return reject(new Error('Cloudinary upload failed'));
        }

        await prisma.media.create({
          data: {
            url: result.secure_url,
            type: getMediaType(file.mimetype),
            mimeType: file.mimetype,
            size: file.size,
            name: file.originalname,
            referenceId,
            referenceType,
          },
        });
        resolve(result);
      }
    );
    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};