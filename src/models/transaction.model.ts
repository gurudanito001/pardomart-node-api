import { PrismaClient, Transaction, Prisma, TransactionType, TransactionSource, TransactionStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateTransactionPayload {
  userId: string;
  amount: number;
  type: TransactionType;
  source: TransactionSource;
  status?: TransactionStatus;
  description?: string;
  orderId?: string;
  externalId?: string;
  meta?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined;
  walletId?: string;
}

export const createTransaction = (payload: CreateTransactionPayload, tx?: Prisma.TransactionClient) => {
  const db = tx || prisma;
  return db.transaction.create({
    data: payload,
  });
};

export const listTransactionsForUser = (userId: string) => {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      order: {
        select: { id: true, orderCode: true, totalAmount: true },
      },
    },
  });
};

const transactionWithRelations = Prisma.validator<Prisma.TransactionDefaultArgs>()({
  include: {
    order: {
      include: {
        vendor: true,
        user: true,
      },
    },
    user: true,
  },
});

export type TransactionWithRelations = Prisma.TransactionGetPayload<typeof transactionWithRelations>;

export interface ListVendorTransactionsFilters {
  vendorOwnerId: string;
  vendorId?: string;
}

/**
 * Retrieves a list of transactions for a vendor user, optionally filtered by a specific vendor ID.
 * @param filters - The filters to apply, including the vendor owner's user ID and an optional vendor ID.
 * @returns A list of transactions.
 */
export const listTransactionsForVendor = async (filters: ListVendorTransactionsFilters): Promise<TransactionWithRelations[]> => {
  const where: Prisma.TransactionWhereInput = {
    order: {
      vendor: {
        userId: filters.vendorOwnerId,
        ...(filters.vendorId ? { id: filters.vendorId } : {})
      },
    },
    // Only include transactions that are relevant to a vendor
    type: {
      in: ['ORDER_PAYMENT', 'VENDOR_PAYOUT']
    }
  };

  return prisma.transaction.findMany({
    where,
    ...transactionWithRelations,
    orderBy: { createdAt: 'desc' },
  });
};




export interface ListTransactionsModelFilters {
  ownerId?: string; // The vendor owner's ID
  vendorId?: string; // A specific store ID
  userId?: string; // A specific user's ID (customer or staff)
}

/**
 * Retrieves a list of transactions based on various filters for vendors and their staff.
 * @param filters - The filters to apply to the query.
 * @returns A list of transactions.
 */
export const listTransactions = async (filters: ListTransactionsModelFilters): Promise<Transaction[]> => {
  const { ownerId, vendorId, userId } = filters;

  const where: Prisma.TransactionWhereInput = {};

  // If a specific user (customer or staff) is being filtered, this is the primary condition.
  if (userId) {
    where.userId = userId;
  }

  // The main filtering logic for vendors/stores.
  // This should capture transactions related to orders in a store,
  // AND transactions made directly by staff of that store.
  const vendorFilter: Prisma.TransactionWhereInput = {
    OR: [
      // Condition 1: Transaction is linked to an order from the specified vendor/owner.
      {
        order: {
          vendor: {
            ...(vendorId ? { id: vendorId } : {}),
            ...(ownerId ? { userId: ownerId } : {}),
          },
        },
      },
      // Condition 2: Transaction was performed by a user (staff) who belongs to the specified vendor/owner.
      {
        user: {
          vendor: {
            ...(vendorId ? { id: vendorId } : {}),
            ...(ownerId ? { userId: ownerId } : {}),
          },
        },
      },
    ],
  };

  // If there's a vendor or owner filter, combine it with the main `where` clause.
  if (vendorId || ownerId) {
    where.AND = [where.AND || {}, vendorFilter].flat();
  }

  return prisma.transaction.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      order: { select: { id: true, orderCode: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};