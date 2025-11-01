// services/staff.service.ts
import * as staffModel from '../models/staff.model';
import * as vendorModel from '../models/vendor.model';
import { User, Role, Transaction, Prisma } from '@prisma/client';
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

export interface UpdateStaffServicePayload extends Partial<staffModel.UpdateStaffPayload> {
  staffId: string;
  ownerId: string;
}

export interface ListStaffTransactionsFilter {
  staffUserId?: string; // Filter by a specific staff member
  vendorId?: string; // Filter by a specific store
}

export interface ListStaffOptions {
  userId: string;
  userRole: Role;
  staffVendorId?: string;
  vendorId?: string; // Optional filter for vendors to specify a store
}

export interface ListStaffTransactionsOptions {
  requestingUserId: string;
  requestingUserRole: Role;
  staffVendorId?: string; // The vendorId from the staff's token, for store_admin
  filter: ListStaffTransactionsFilter;
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
export const listStaffService = async (options: ListStaffOptions): Promise<Omit<User, 'rememberToken'>[]> => {
  const { userId, userRole, staffVendorId, vendorId: filterByVendorId } = options;
  let staffList: User[] = [];

  switch (userRole) {
    case Role.vendor:
      // Authorization: If a vendorId is provided for filtering, ensure the requester owns it.
      if (filterByVendorId) {
        const vendor = await vendorModel.getVendorById(filterByVendorId);
        if (!vendor || vendor.userId !== userId) {
          throw new Error('Forbidden: You are not authorized to view staff for this store.');
        }
      }
      // A vendor owner can get all staff, or filter by a specific vendorId they own.
      staffList = await staffModel.listStaffByOwnerId(userId, filterByVendorId);
      break;

    case Role.store_admin:
      // A store admin gets all staff from their assigned store.
      if (!staffVendorId) {
        throw new Error('Store admin is not associated with a vendor.');
      }
      staffList = await staffModel.listStaffByVendorId(staffVendorId);
      break;

    case Role.store_shopper:
      // A store shopper is not permitted to list other staff members.
      throw new Error('Unauthorized role.');

    default:
      throw new Error('Unauthorized role.');
  }

  return staffList.map(sanitizeUser);
}

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
 * (Admin) Retrieves a list of all staff members for any given store.
 * @param vendorId - The ID of the store.
 * @returns A list of staff users.
 * @throws Error if the vendor is not found.
 */
export const adminListStaffByVendorIdService = async (vendorId: string): Promise<Omit<User, 'rememberToken'>[]> => {
  // Admin doesn't need an ownership check, just that the vendor exists.
  const vendor = await vendorModel.getVendorById(vendorId);
  if (!vendor) {
    throw new Error('Vendor not found.');
  }

  const staffList = await staffModel.listStaffByVendorId(vendorId);
  return staffList.map(sanitizeUser);
};

/**
 * (Admin) Retrieves a single staff member by their ID without ownership checks.
 * @param staffId - The ID of the staff user.
 * @returns A user object or null if not found or not a staff member.
 * @throws Error if the user is not a staff member.
 */
export const adminGetStaffByIdService = async (staffId: string): Promise<Omit<User, 'rememberToken'> | null> => {
  const staffUser = await staffModel.getStaffById(staffId);

  if (!staffUser) {
    return null; // Not found
  }

  // The model function already ensures the user has a staff role.
  return sanitizeUser(staffUser);
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

type TransactionQueryScope = {
  ownerId: string;
  vendorId?: string;
};

/**
 * Handles authorization and determines query scope for a vendor.
 * @private
 */
const _getScopeForVendor = async (requestingUserId: string, filter: ListStaffTransactionsFilter): Promise<TransactionQueryScope> => {
  const ownerId = requestingUserId;

  // If a vendor specifies a vendorId, we must verify they own it.
  if (filter.vendorId) {
    const vendor = await prisma.vendor.findFirst({ where: { id: filter.vendorId, userId: ownerId } });
    if (!vendor) {
      throw new Error('Vendor not found or you are not authorized to view its transactions.');
    }
  }

  return { ownerId, vendorId: filter.vendorId };
};

/**
 * Handles authorization and determines query scope for a store admin.
 * @private
 */
const _getScopeForStoreAdmin = async (staffVendorId: string | undefined, filter: ListStaffTransactionsFilter): Promise<TransactionQueryScope> => {
  if (!staffVendorId) {
    throw new Error('Forbidden: You are not assigned to a store.');
  }

  // A store admin can only see transactions for their own store.
  // They cannot query for other stores.
  if (filter.vendorId && filter.vendorId !== staffVendorId) {
    throw new Error('Forbidden: You can only view transactions for your assigned store.');
  }

  // We need the ownerId of the store for the model query.
  const store = await prisma.vendor.findUnique({ where: { id: staffVendorId }, select: { userId: true } });
  if (!store) throw new Error('Assigned store not found.');

  return { ownerId: store.userId, vendorId: staffVendorId };
};

/**
 * Retrieves transactions for staff members based on the requester's role.
 * @param options - The options for listing transactions, including authorization details and filters.
 * @returns A list of transactions.
 */
export const listStaffTransactionsService = async (options: ListStaffTransactionsOptions): Promise<Transaction[]> => {
  const { requestingUserId, requestingUserRole, staffVendorId, filter } = options;
  let scope: TransactionQueryScope;

  switch (requestingUserRole) {
    case Role.vendor:
      scope = await _getScopeForVendor(requestingUserId, filter);
      break;

    case Role.store_admin:
      scope = await _getScopeForStoreAdmin(staffVendorId, filter);
      break;

    default:
      throw new Error('Forbidden: You do not have permission to view staff transactions.');
  }

  // The model function expects the ownerId to correctly scope the query.
  return staffModel.listStaffTransactions({
    ownerId: scope.ownerId,
    vendorId: scope.vendorId,
    staffUserId: filter.staffUserId,
  });
};