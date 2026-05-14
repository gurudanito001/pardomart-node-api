// user.service.ts
import * as userModel from '../models/user.model'; // Import functions from user.model.ts
import { Prisma, PrismaClient, Role, ReplacementPreference, MeasurementUnit, User } from '@prisma/client';
import { GetUserFilters, CreateUserPayload, UpdateUserPayload } from '../models/user.model';
import { uploadMedia } from './media.service'; // Assuming you have a media.service.ts file
import { Readable } from 'stream';
import * as emailVerificationService from './emailVerification.service';

const prisma = new PrismaClient();

interface CheckUserFilters {
  mobileNumber: string;
}



export const getAllUsers = async (filters: GetUserFilters & { search?: string }, pagination: { page: number; take: number }) => {
  const { mobileVerified, active, role, language, search, online } = filters;
  const skip = (pagination.page - 1) * pagination.take;

  const where: Prisma.UserWhereInput = {
    deletedAt: null,
  };

  if (mobileVerified !== undefined) where.mobileVerified = mobileVerified;
  if (active !== undefined) where.active = active;
  if (online !== undefined) where.online = online;
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

export const createUser = async (payload: CreateUserPayload, tx?: Prisma.TransactionClient) => {
  return userModel.createUser(payload, tx);
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

/**
 * Deletes a user account.
 * Checks for active orders before allowing deletion to prevent orphaned deliveries or shopping sessions.
 */
export const deleteUser = async (userId: string, tx?: Prisma.TransactionClient) => {
  const db = tx || prisma;
  const user = await userModel.getUserById(userId);
  if (!user) throw new Error('User not found.');

  const terminalStatuses = ['delivered', 'picked_up_by_customer', 'cancelled_by_customer', 'declined_by_vendor', 'no_items_found'];

  // Check personal involvement (Customer, Shopper, or Deliverer)
  const activePersonalOrdersCount = await db.order.count({
    where: {
      OR: [{ userId: userId }, { shopperId: userId }, { deliveryPersonId: userId }],
      orderStatus: { notIn: terminalStatuses as any }
    }
  });

  if (activePersonalOrdersCount > 0) {
    throw new Error('Cannot delete account while you have active orders as a customer, shopper, or delivery person.');
  }

  // Check store involvement for vendors
  if (user.role === Role.vendor) {
    const activeVendorOrdersCount = await db.order.count({
      where: {
        vendor: { userId: userId },
        orderStatus: { notIn: terminalStatuses as any }
      }
    });

    if (activeVendorOrdersCount > 0) {
      throw new Error('Cannot delete account while your store(s) have active orders. Please fulfill or cancel them first.');
    }

    // Deactivate stores
    await db.vendor.updateMany({
      where: { userId },
      data: { isPublished: false, availableForShopping: false }
    });
  }

  return userModel.deleteUser(userId, tx);
};

/**
      orderStatus: {
        notIn: ['delivered', 'picked_up_by_customer', 'cancelled_by_customer', 'declined_by_vendor']
      }
    }
  });

  if (activeOrdersCount > 0) {
    throw new Error('Cannot delete account while you have active orders. Please cancel or wait for them to complete.');
  }

  return userModel.deleteUser(userId);
};

/**
 * Updates user settings such as replacement preference and measurement units.
 * @param userId The ID of the user whose settings are being updated.
 * @param payload The settings to update.
 * @returns The updated user object.
 */
export const updateUserSettings = async (
  userId: string,
  payload: {
    replacementPreference?: ReplacementPreference;
    measurementUnit?: MeasurementUnit;
    biometricEnabled?: boolean;
    darkMode?: boolean;
  }
) => {
  const user = await userModel.getUserById(userId);
  if (!user) {
    throw new Error('User not found.');
  }

  return userModel.updateUser(userId, payload);
};

/**
 * Initiates the account deletion process by sending an OTP to the user's email.
 * @param userId The ID of the user requesting deletion.
 */
export const initiateAccountDeletion = async (userId: string): Promise<void> => {
  const user = await userModel.getUserById(userId);
  if (!user || !user.email) {
    throw new Error('User not found or email not registered.');
  }

  // Fail early if account cannot be deleted
  const terminalStatuses = ['delivered', 'picked_up_by_customer', 'cancelled_by_customer', 'declined_by_vendor', 'no_items_found'];
  const activeCheck = await prisma.order.count({
    where: {
      OR: [
        { userId },
        { shopperId: userId },
        { deliveryPersonId: userId },
        { vendor: { userId: userId } }
      ],
      orderStatus: { notIn: terminalStatuses as any }
    }
  });

  if (activeCheck > 0) {
    throw new Error('Cannot delete account while you have active orders. Please cancel or wait for them to complete.');
  }

  const emailBodyTemplate = (otp: string) => `
    <p>Hello ${user.name},</p>
    <p>You have requested to delete your Pardomart account. To confirm this action, please use the following One-Time Password (OTP):</p>
    <h3>${otp}</h3>
    <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
    <p>Thank you,</p>
    <p>The Pardomart Team</p>
  `;

  await emailVerificationService.generateAndStoreEmailOtp(
    user.email,
    'account_deletion',
    'Pardomart Account Deletion OTP',
    emailBodyTemplate
  );
};

/**
 * Confirms account deletion using an OTP and performs a soft delete.
 * @param userId The ID of the user confirming deletion.
 * @param otp The OTP received by the user.
 * @returns The soft-deleted user object.
 */
export const confirmAccountDeletion = async (userId: string, otp: string): Promise<User> => {
  const user = await userModel.getUserById(userId);
  if (!user || !user.email) {
    throw new Error('User not found or email not registered.');
  }

  // Verify OTP first (outside transaction to avoid unnecessary locking)
  await emailVerificationService.verifyEmailOtp(user.email, otp, 'account_deletion');

  return prisma.$transaction(async (tx) => {
    // Delete record and deactivate user atomically
    await tx.emailVerification.delete({ where: { email: user.email } });
    return deleteUser(userId, tx);
  });
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
  return userModel.createUser({ ...payload, role: Role.admin }, undefined);
};

export const updateAdminService = async (id: string, payload: UpdateUserPayload) => {
  return updateUser(id, payload);
};

export const deactivateAdminService = async (id: string) => {
  return updateUser(id, { active: false });
};