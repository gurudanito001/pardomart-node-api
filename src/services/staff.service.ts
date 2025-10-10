// services/staff.service.ts
import * as staffModel from '../models/staff.model';
import { User, Role } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateStaffServicePayload {
  name: string;
  email: string;
  mobileNumber: string;
  vendorId: string;
  password?: string; // Password is optional, can be set later
  ownerId: string; // The ID of the user creating the staff (the vendor owner)
}

export interface UpdateStaffServicePayload extends staffModel.UpdateStaffPayload {
  staffId: string;
  ownerId: string;
}

const sanitizeUser = (user: User): Omit<User, 'rememberToken'> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { rememberToken, ...sanitized } = user;
  return sanitized;
};

/**
 * Creates a new staff member for a vendor.
 * @param payload - The details for the new staff member.
 * @returns The created user object, without the password.
 */
export const createStaffService = async (payload: CreateStaffServicePayload): Promise<Omit<User, 'rememberToken'>> => {
  // Authorization: Ensure the ownerId actually owns the vendorId
  const vendor = await prisma.vendor.findFirst({
    where: { id: payload.vendorId, userId: payload.ownerId },
  });

  if (!vendor) {
    throw new Error('Unauthorized: You do not own this vendor.');
  }

  // For now, we'll just create a user without a password.
  // A full implementation would involve sending an invite email.
  const staffData = {
    name: payload.name,
    email: payload.email,
    mobileNumber: payload.mobileNumber,
    vendorId: payload.vendorId,
  };

  const newUser = await staffModel.createStaff(staffData);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { rememberToken, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

/**
 * Retrieves a list of staff members for a specific store, ensuring the requester is the owner.
 * @param vendorId - The ID of the store.
 * @param ownerId - The ID of the user requesting the list.
 * @returns A list of staff users.
 */
export const listStaffByVendorIdService = async (vendorId: string, ownerId: string): Promise<Omit<User, 'rememberToken'>[]> => {
  const vendor = await prisma.vendor.findFirst({
    where: { id: vendorId, userId: ownerId },
  });

  if (!vendor) {
    throw new Error('Unauthorized: You do not own this vendor.');
  }

  const staffList = await staffModel.listStaffByVendorId(vendorId);
  return staffList.map(sanitizeUser);
};

/**
 * Retrieves a list of all staff members across all stores owned by a user.
 * @param ownerId - The user ID of the vendor owner.
 * @returns A list of all staff users.
 */
export const listStaffByOwnerIdService = async (ownerId: string): Promise<Omit<User, 'rememberToken'>[]> => {
  const staffList = await staffModel.listStaffByOwnerId(ownerId);
  return staffList.map(sanitizeUser);
};

/**
 * Retrieves a single staff member, ensuring the requester is the owner.
 * @param staffId - The ID of the staff user.
 * @param ownerId - The ID of the user requesting the staff member.
 * @returns A user object or null if not found.
 */
export const getStaffByIdService = async (staffId: string, ownerId: string): Promise<Omit<User, 'rememberToken'> | null> => {
  const staffUser = await staffModel.getStaffById(staffId);

  if (!staffUser || !staffUser.vendorId) {
    return null; // Staff not found or not associated with any vendor
  }

  // Authorization check
  const vendor = await prisma.vendor.findFirst({
    where: { id: staffUser.vendorId, userId: ownerId },
  });

  if (!vendor) {
    throw new Error('Unauthorized: You do not own the vendor this staff member belongs to.');
  }

  return sanitizeUser(staffUser);
};

/**
 * Updates a staff member's details.
 * @param payload - The update payload containing staffId, ownerId, and new details.
 * @returns The updated user object.
 */
export const updateStaffService = async (payload: UpdateStaffServicePayload): Promise<Omit<User, 'rememberToken'>> => {
  const { staffId, ownerId, ...updateData } = payload;

  const staffUser = await staffModel.getStaffById(staffId);
  if (!staffUser || !staffUser.vendorId) {
    throw new Error('Staff member not found.');
  }

  // Authorization check
  const vendor = await prisma.vendor.findFirst({
    where: { id: staffUser.vendorId, userId: ownerId },
  });

  if (!vendor) {
    throw new Error('Unauthorized: You do not own the vendor this staff member belongs to.');
  }

  const updatedUser = await staffModel.updateStaff(staffId, updateData);
  return sanitizeUser(updatedUser);
};

/**
 * Deletes a staff member's account.
 * @param staffId - The ID of the staff user to delete.
 * @param ownerId - The ID of the user requesting the deletion.
 * @returns The deleted user object.
 */
export const deleteStaffService = async (staffId: string, ownerId: string): Promise<Omit<User, 'rememberToken'>> => {
  const staffUser = await staffModel.getStaffById(staffId);
  if (!staffUser || !staffUser.vendorId) {
    throw new Error('Staff member not found.');
  }

  // Authorization check
  const vendor = await prisma.vendor.findFirst({
    where: { id: staffUser.vendorId, userId: ownerId },
  });

  if (!vendor) {
    throw new Error('Unauthorized: You do not own the vendor this staff member belongs to.');
  }

  // Ensure one cannot delete a user who is not a staff member
  if (staffUser.role !== Role.store_shopper) {
    throw new Error('This user is not a staff member and cannot be deleted through this endpoint.');
  }

  const deletedUser = await staffModel.deleteStaff(staffId);
  return sanitizeUser(deletedUser);
};