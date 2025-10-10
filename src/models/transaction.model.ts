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