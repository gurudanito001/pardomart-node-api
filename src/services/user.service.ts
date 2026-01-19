// user.service.ts
import * as userModel from '../models/user.model'; // Import functions from user.model.ts
import { Prisma, PrismaClient, Role } from '@prisma/client';
import { GetUserFilters, CreateUserPayload, UpdateUserPayload } from '../models/user.model';
import { uploadMedia } from './media.service'; // Assuming you have a media.service.ts file
import { Readable } from 'stream';

const prisma = new PrismaClient();

interface CheckUserFilters {
  mobileNumber: string;
}



export const getAllUsers = async (filters: GetUserFilters & { search?: string }, pagination: { page: number; take: number }) => {
  const { mobileVerified, active, role, language, search } = filters;
  const skip = (pagination.page - 1) * pagination.take;

  const where: Prisma.UserWhereInput = {};

  if (mobileVerified !== undefined) where.mobileVerified = mobileVerified;
  if (active !== undefined) where.active = active;
  if (role) where.role = role;
  if (language) where.language = language;

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { mobileNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({ where, skip, take: pagination.take, orderBy: { createdAt: 'desc' } }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    pagination: { total, page: pagination.page, limit: pagination.take, totalPages: Math.ceil(total / pagination.take) },
  };
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

export const getAdminStatsService = async () => {
  const [totalAdmins, activeAdmins] = await prisma.$transaction([
    prisma.user.count({ where: { role: Role.admin } }),
    prisma.user.count({ where: { role: Role.admin, active: true } }),
  ]);
  return { totalAdmins, activeAdmins };
};

export const exportAdminsService = async () => {
  const admins = await prisma.user.findMany({
    where: { role: Role.admin },
    orderBy: { createdAt: 'desc' },
  });

  const header = ['ID', 'Name', 'Email', 'Mobile Number', 'Active', 'Created At'];
  const rows = admins.map(admin => [
    admin.id,
    `"${(admin.name || '').replace(/"/g, '""')}"`,
    admin.email,
    admin.mobileNumber,
    admin.active ? 'Yes' : 'No',
    admin.createdAt.toISOString()
  ]);

  return [header.join(','), ...rows.map(r => r.join(','))].join('\n');
};

export const createAdminService = async (payload: CreateUserPayload) => {
  return userModel.createUser({ ...payload, role: Role.admin });
};

export const updateAdminService = async (id: string, payload: UpdateUserPayload) => {
  return updateUser(id, payload);
};

export const deactivateAdminService = async (id: string) => {
  return updateUser(id, { active: false });
};