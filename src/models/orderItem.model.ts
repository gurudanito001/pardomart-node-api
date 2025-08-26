import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateOrderItemPayload {
  vendorProductId: string;
  quantity: number;
  orderId: string;
}

export const createManyOrderItems = async (
  payload: CreateOrderItemPayload[],
  tx?: Prisma.TransactionClient
): Promise<{ count: number }> => {
  const db = tx || prisma;
  return db.orderItem.createMany({
    data: payload,
  });
};