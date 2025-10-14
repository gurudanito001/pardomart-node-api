// src/models/earnings.model.ts
import { PrismaClient, Prisma, Transaction } from '@prisma/client';

const prisma = new PrismaClient();

export interface ListEarningsFilters {
  ownerId: string;
  vendorId?: string;
}

/**
 * Retrieves earnings transactions for a vendor owner.
 * @param filters - The filters to apply, including the ownerId and an optional vendorId.
 * @returns A list of VENDOR_PAYOUT transactions.
 */
export const listEarnings = async (filters: ListEarningsFilters): Promise<Transaction[]> => {
  const { ownerId, vendorId } = filters;

  const where: Prisma.TransactionWhereInput = {
    type: 'VENDOR_PAYOUT',
    vendor: {
      userId: ownerId, // Primary authorization: ensure transactions belong to the owner.
    },
  };

  // If a specific store is requested, add it to the filter.
  if (vendorId) {
    where.vendorId = vendorId;
  }

  return prisma.transaction.findMany({
    where,
    include: {
      order: {
        select: {
          orderCode: true,
        },
      },
      vendor: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};
