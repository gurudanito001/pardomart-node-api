import { PrismaClient, Wallet, WalletTransaction, TransactionType, TransactionStatus, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class WalletError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'WalletError';
    this.statusCode = statusCode;
  }
}

/**
 * Retrieves a user's wallet. Creates one if it doesn't exist.
 * @param userId The ID of the user.
 * @param tx Optional Prisma transaction client.
 * @returns The user's wallet.
 */
export const findOrCreateWalletByUserId = async (userId: string, tx?: Prisma.TransactionClient): Promise<Wallet> => {
  const db = tx || prisma;
  let wallet = await db.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    wallet = await db.wallet.create({
      data: {
        userId,
        balance: 0,
      },
    });
  }

  return wallet;
};

/**
 * Retrieves a user's wallet and balance.
 * @param userId The ID of the user.
 * @returns The user's wallet.
 */
export const getWalletByUserIdService = async (userId: string): Promise<Wallet> => {
  const wallet = await findOrCreateWalletByUserId(userId);
  return wallet;
};

/**
 * Retrieves a list of transactions for a user's wallet.
 * @param userId The ID of the user.
 * @returns A list of wallet transactions.
 */
export const getWalletTransactionsService = async (userId: string): Promise<WalletTransaction[]> => {
  const wallet = await findOrCreateWalletByUserId(userId);

  return prisma.walletTransaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: 'desc' },
  });
};

interface CreditWalletPayload {
  userId: string;
  amount: number;
  description: string;
  meta?: Prisma.JsonValue;
}

/**
 * Credits a user's wallet. This is an internal function to be used by other services.
 * It must be run within a Prisma transaction to ensure atomicity.
 * @param payload The credit payload.
 * @param tx The Prisma transaction client.
 * @returns The created wallet transaction.
 */
export const creditWallet = async ({ userId, amount, description, meta }: CreditWalletPayload, tx: Prisma.TransactionClient): Promise<WalletTransaction> => {
  if (amount <= 0) {
    throw new WalletError('Credit amount must be positive.');
  }

  const wallet = await findOrCreateWalletByUserId(userId, tx);

  await tx.wallet.update({
    where: { id: wallet.id },
    data: { balance: { increment: amount } },
  });

  return tx.walletTransaction.create({
    data: {
      walletId: wallet.id,
      amount,
      type: TransactionType.CREDIT,
      status: TransactionStatus.COMPLETED,
      description,
      meta: meta || {},
    },
  });
};

interface DebitWalletPayload {
  userId: string;
  amount: number;
  description: string;
  meta?: Prisma.JsonValue;
}

/**
 * Debits a user's wallet. This is an internal function to be used by other services.
 * It must be run within a Prisma transaction to ensure atomicity.
 * @param payload The debit payload.
 * @param tx The Prisma transaction client.
 * @returns The created wallet transaction.
 */
export const debitWallet = async ({ userId, amount, description, meta }: DebitWalletPayload, tx: Prisma.TransactionClient): Promise<WalletTransaction> => {
  if (amount <= 0) {
    throw new WalletError('Debit amount must be positive.');
  }

  const wallet = await findOrCreateWalletByUserId(userId, tx);

  if (wallet.balance < amount) {
    throw new WalletError('Insufficient wallet balance.', 402); // 402 Payment Required
  }

  await tx.wallet.update({
    where: { id: wallet.id },
    data: { balance: { decrement: amount } },
  });

  return tx.walletTransaction.create({
    data: {
      walletId: wallet.id,
      amount: -amount,
      type: TransactionType.DEBIT,
      status: TransactionStatus.COMPLETED,
      description,
      meta: meta || {},
    },
  });
};