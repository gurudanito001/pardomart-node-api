// user.service.ts
import * as userModel from '../models/user.model'; // Import functions from user.model.ts
import { Prisma } from '@prisma/client';
import { GetUserFilters, CreateUserPayload, UpdateUserPayload } from '../models/user.model';
import { uploadMedia } from './media.service'; // Assuming you have a media.service.ts file
import { Readable } from 'stream';

interface CheckUserFilters {
  mobileNumber: string;
}



export const getAllUsers = async (filters: GetUserFilters, pagination: { page: number; take: number }) => {
  return userModel.getAllUsers(filters, pagination);
};

export const findMany = async (args: Prisma.UserFindManyArgs) => {
  return userModel.findMany(args);
};

export const getAllVerificationCodes = async (): Promise<any[]> => {
  return userModel.getAllVerificationCodes();
};

export const getUserById = async (userId: string) => {
  return userModel.getUserById(userId);
};

export const createUser = async (payload: CreateUserPayload) => {
  return userModel.createUser(payload);
};

export const updateUser = async (id: string, payload: UpdateUserPayload) => {

  // If a new base64 image is provided, upload it and update the payload.
  if (payload.image && !payload.image.startsWith('http')) {
    try {
      // Create a mock Multer file from the base64 string
      const imageBuffer = Buffer.from(payload.image, 'base64');
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: `${id}-user-image.jpg`,
        encoding: '7bit',
        mimetype: 'image/jpeg', // Assuming jpeg, you can adjust if needed
        buffer: imageBuffer,
        size: imageBuffer.length,
        stream: new Readable(),
        destination: '',
        filename: '',
        path: '',
      };

      const uploadResult = await uploadMedia(mockFile, id, 'user_image');
      payload.image = uploadResult.cloudinaryResult.secure_url; // Update payload with the new URL
    } catch (error) {
      console.error('Error uploading new user image during update:', error);
      // To prevent saving the base64 string, we remove the image from the payload on failure.
      // The user can try uploading again.
      delete payload.image;
    }
  }

  return userModel.updateUser(id, payload);
};

export const deleteUser = async (userId: string) => {
  return userModel.deleteUser(userId);
};