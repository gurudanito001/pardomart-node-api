// services/customer.service.ts
import { PrismaClient, User } from '@prisma/client';
import * as customerModel from '../models/customer.model';

const prisma = new PrismaClient();

export interface ListCustomersOptions {
  ownerId?: string; // ID of the vendor owner
  vendorId?: string; // ID of a specific store
}

/**
 * Retrieves a list of customers for a vendor or a specific store.
 * @param options - The filtering options.
 * @returns A list of unique customer users.
 */
export const listCustomersService = async (options: ListCustomersOptions): Promise<Partial<User>[]> => {
  const { ownerId, vendorId } = options;

  if (!ownerId && !vendorId) {
    throw new Error('Either ownerId or vendorId must be provided.');
  }

  // If an owner is making the request for a specific store,
  // ensure they own that store.
  if (ownerId && vendorId) {
    const vendor = await prisma.vendor.findFirst({
      where: {
        id: vendorId,
        userId: ownerId,
      },
    });

    if (!vendor) {
      throw new Error('Unauthorized: You do not own this vendor.');
    }
  }

  return customerModel.listCustomers({ ownerId, vendorId });
};