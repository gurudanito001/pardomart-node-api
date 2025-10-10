// models/staff.model.ts
import { PrismaClient, User, Role, Prisma } from '@prisma/client';


const prisma = new PrismaClient();

export interface CreateStaffPayload {
  name: string;
  email: string;
  mobileNumber: string;
  vendorId: string; // The store the staff member belongs to
  // Password will be handled in the service layer
}

export interface UpdateStaffPayload {
  name?: string;
  email?: string;
  mobileNumber?: string;
  active?: boolean;
}

/**
 * Creates a new staff user in the database.
 * @param payload - The staff user's details.
 * @returns The newly created user.
 */
export const createStaff = async (payload: CreateStaffPayload): Promise<User> => {
  const staffUser = await prisma.user.create({
    data: {
      ...payload,
      role: Role.store_shopper,
      // The password should be hashed before being passed in the payload
    },
  });

  // We don't need to explicitly connect the vendor,
  // as the `vendorId` field on the User model handles the relation.

  return staffUser;
};

/**
 * Retrieves a list of staff members (shoppers) for a specific store.
 * @param vendorId - The ID of the vendor/store.
 * @returns A list of staff users.
 */
export const listStaffByVendorId = async (vendorId: string): Promise<User[]> => {
  return prisma.user.findMany({
    where: {
      vendorId: vendorId,
      role: Role.store_shopper,
    },
  });
};

/**
 * Retrieves a list of all staff members (shoppers) under a vendor owner's account.
 * @param ownerId - The user ID of the vendor owner.
 * @returns A list of all staff users across all stores owned by the user.
 */
export const listStaffByOwnerId = async (ownerId: string): Promise<User[]> => {
  return prisma.user.findMany({
    where: {
      role: Role.store_shopper,
      vendor: {
        userId: ownerId,
      },
    },
    include: {
      vendor: {
        select: {
          name: true,
        },
      },
    },
  });
};

/**
 * Retrieves a single staff member by their ID.
 * @param staffId - The ID of the staff user.
 * @returns A user object or null if not found or not a staff member.
 */
export const getStaffById = async (staffId: string): Promise<User | null> => {
  return prisma.user.findFirst({
    where: {
      id: staffId,
      role: Role.store_shopper,
    },
  });
};

/**
 * Updates the details of a staff member.
 * @param staffId - The ID of the staff user to update.
 * @param payload - The data to update.
 * @returns The updated user object.
 */
export const updateStaff = async (staffId: string, payload: Prisma.UserUpdateInput): Promise<User> => {
  return prisma.user.update({
    where: { id: staffId },
    data: payload,
  });
};

/**
 * Deletes a staff member's account.
 * @param staffId - The ID of the staff user to delete.
 * @returns The deleted user object.
 */
export const deleteStaff = async (staffId: string): Promise<User> => {
  // Authorization to ensure the user is a staff member should be handled in the service layer
  // before calling this function.
  return prisma.user.delete({
    where: { id: staffId },
  });
};