// models/customer.model.ts
import { PrismaClient, User, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface ListCustomersFilters {
  ownerId?: string;
  vendorId?: string;
}

/**
 * Retrieves a list of unique customers who have placed orders
 * with a vendor's store(s).
 * @param filters - The filters to apply, including ownerId or vendorId.
 * @returns A list of unique customer users.
 */
export const listCustomers = async (filters: ListCustomersFilters): Promise<Partial<User>[]> => {
  const { ownerId, vendorId } = filters;

  const where: Prisma.OrderWhereInput = {};

  if (vendorId) {
    // Filter by a specific store ID
    where.vendorId = vendorId;
  } else if (ownerId) {
    // Filter by all stores belonging to a vendor owner
    where.vendor = {
      userId: ownerId,
    };
  } else {
    return []; // Should not happen if service validation is correct
  }

  // Find all orders matching the filter
  const orders = await prisma.order.findMany({
    where,
    select: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          mobileNumber: true,
        },
      },
    },
    distinct: ['userId'], // Get each customer only once
  });

  return orders.map((order) => order.user);
};

export interface ListCustomerTransactionsFilters {
  customerId: string;
  ownerId?: string; // To scope transactions to a vendor owner
  vendorId?: string; // To scope transactions to a specific store
}

/**
 * Retrieves transactions for a specific customer, scoped by vendor or owner.
 * @param filters - The filters to apply, including customerId and owner/vendor scope.
 * @returns A list of transactions.
 */
export const listCustomerTransactions = async (filters: ListCustomerTransactionsFilters) => {
  const { customerId, ownerId, vendorId } = filters;

  const where: Prisma.TransactionWhereInput = {
    userId: customerId,
  };

  if (vendorId) {
    // Highest precedence: filter by a specific store ID.
    where.vendorId = vendorId;
  } else if (ownerId) {
    // Filter by all stores belonging to a vendor owner.
    where.vendor = {
      userId: ownerId,
    };
  } else {
    // This case should be prevented by the service layer.
    return [];
  }

  return prisma.transaction.findMany({
    where,
    include: {
      order: true, // Include order details with the transaction
    },
    orderBy: { createdAt: 'desc' },
  });
};