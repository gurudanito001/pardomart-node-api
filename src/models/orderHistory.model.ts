import { PrismaClient, OrderHistory, OrderStatus, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateOrderHistoryPayload {
  orderId: string;
  status: OrderStatus;
  changedBy?: string;
  notes?: string;
}

export const createOrderHistory = async (payload: CreateOrderHistoryPayload, tx?: Prisma.TransactionClient) => {
  const db = tx || prisma;
  return db.orderHistory.create({
    data: payload,
  });
};

export const getOrderHistoryByOrderId = async (orderId: string) => {
  return prisma.orderHistory.findMany({
    where: { orderId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, name: true, role: true }
      }
    }
  });
};
