import { PrismaClient, MediaType, ReferenceType, Media, Identifier } from '@prisma/client';
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

const getCloudinaryResourceType = (mimeType: string): 'image' | 'video' | 'raw' => {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) {
    return 'video';
  }
  return 'raw';
};

export const uploadMedia = (
  file: Express.Multer.File,
  referenceId: string,
  referenceType: ReferenceType,
  identifier?: Identifier
): Promise<{ cloudinaryResult: UploadApiResponse; dbRecord: Media }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: getCloudinaryResourceType(file.mimetype),
        folder: `pardomart/${referenceType.toLowerCase()}`,
      },
      async (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result) {
          return reject(new Error('Cloudinary upload failed'));
        }

        try {
          const dbRecord = await prisma.media.create({
            data: {
              url: result.secure_url,
              type: getMediaType(file.mimetype),
              mimeType: file.mimetype,
              size: file.size,
              name: file.originalname,
              referenceId,
              referenceType,
              identifier,
            },
          });
          resolve({ cloudinaryResult: result, dbRecord });
        } catch (dbError) {
          reject(dbError);
        }
      }
    );
    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

export const getMediaByReference = async (
  referenceId: string,
  referenceType?: ReferenceType
) => {
  return prisma.media.findMany({
    where: {
      referenceId,
      ...(referenceType ? { referenceType } : {}),
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

const getCloudinaryPublicId = (url: string) => {
  // Regex to capture resource_type and the path after upload/ (handling optional version)
  const regex = /\/([^\/]+)\/upload\/(?:v\d+\/)?(.+)$/;
  const match = url.match(regex);
  if (!match) return null;

  const resourceType = match[1];
  let publicId = match[2];

  // For image and video, remove the extension from publicId
  if (resourceType === 'image' || resourceType === 'video') {
    const lastDotIndex = publicId.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      publicId = publicId.substring(0, lastDotIndex);
    }
  }

  return { resourceType, publicId };
};

export const deleteMedia = async (id: string) => {
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) {
    throw new Error('Media not found');
  }

  const cloudInfo = getCloudinaryPublicId(media.url);
  if (cloudInfo) {
    await cloudinary.uploader.destroy(cloudInfo.publicId, { resource_type: cloudInfo.resourceType });
  }

  return prisma.media.delete({ where: { id } });
};