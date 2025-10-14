// src/services/earnings.service.ts
import { PrismaClient } from '@prisma/client';
import * as earningsModel from '../models/earnings.model';

const prisma = new PrismaClient();

export interface ListEarningsOptions {
  requestingUserId: string;
  filterByVendorId?: string;
}

/**
 * Retrieves earnings for a vendor owner, with optional filtering by store.
 * @param options - The options for listing earnings, including the user ID and optional vendor ID filter.
 * @returns A list of earnings transactions.
 */
export const listEarningsService = async (options: ListEarningsOptions) => {
  const { requestingUserId, filterByVendorId } = options;

  // Authorization: If a vendorId is provided, ensure the requester owns it.
  if (filterByVendorId) {
    const vendor = await prisma.vendor.findFirst({
      where: {
        id: filterByVendorId,
        userId: requestingUserId,
      },
    });

    if (!vendor) {
      throw new Error('Forbidden: You do not own this store or store not found.');
    }
  }

  // The model function handles the primary scoping by ownerId.
  return earningsModel.listEarnings({
    ownerId: requestingUserId,
    vendorId: filterByVendorId,
  });
};

/**
 * Calculates the total earnings for a vendor owner over a specified period.
 * @param ownerId The ID of the vendor owner.
 * @param period An optional time period to filter by.
 * @returns The total earnings amount.
 */
export const getTotalEarningsService = async (ownerId: string, period?: 'today' | '7days' | '1month' | '1year') => {
  return earningsModel.getTotalEarnings(ownerId, period);
};