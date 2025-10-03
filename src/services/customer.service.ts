// services/customer.service.ts
import * as customerModel from '../models/customer.model';
import { User, Role } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sanitizeUser = (user: User): Omit<User, 'rememberToken'> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { rememberToken, ...sanitized } = user;
  return sanitized;
};

/**
 * Retrieves a list of customers for a vendor account, optionally filtered by a specific store.
 * @param ownerId The ID of the user who owns the vendor account.
 * @param vendorId Optional ID of a specific store to filter by.
 * @returns A list of unique, sanitized customer user objects.
 */
export const listCustomersForVendorService = async (
  ownerId: string,
  vendorId?: string
): Promise<Omit<User, 'rememberToken'>[]> => {
  // Authorization: If a vendorId is provided, ensure the ownerId actually owns it.
  if (vendorId) {
    const vendor = await prisma.vendor.findFirst({
      where: { id: vendorId, userId: ownerId },
    });

    if (!vendor) {
      throw new Error('Unauthorized: You do not own this vendor.');
    }
  }

  const customers = await customerModel.listCustomersForVendor({
    ownerId,
    vendorId,
  });

  return customers.map(sanitizeUser);
};