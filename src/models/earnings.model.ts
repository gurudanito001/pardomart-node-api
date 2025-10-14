// src/models/earnings.model.ts
import { PrismaClient, Prisma, Transaction } from '@prisma/client';
import dayjs from 'dayjs';

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

/**
 * Calculates the sum of earnings for a vendor owner over a given period.
 * @param ownerId - The ID of the vendor owner.
 * @param period - The time period to filter by.
 * @returns The total sum of earnings.
 */
export const getTotalEarnings = async (ownerId: string, period?: 'today' | '7days' | '1month' | '1year'): Promise<number> => {
  const where: Prisma.TransactionWhereInput = {
    type: 'VENDOR_PAYOUT',
    vendor: {
      userId: ownerId,
    },
  };

  if (period) {
    let startDate: Date;
    const now = dayjs();

    switch (period) {
      case 'today':
        startDate = now.startOf('day').toDate();
        break;
      case '7days':
        startDate = now.subtract(7, 'day').startOf('day').toDate();
        break;
      case '1month':
        startDate = now.subtract(1, 'month').startOf('day').toDate();
        break;
      case '1year':
        startDate = now.subtract(1, 'year').startOf('day').toDate();
        break;
    }

    where.createdAt = {
      gte: startDate,
      lte: now.toDate(), // Ensure we don't include future-dated transactions
    };
  }

  const aggregate = await prisma.transaction.aggregate({
    _sum: {
      amount: true,
    },
    where,
  });

  return aggregate._sum.amount || 0;
};
