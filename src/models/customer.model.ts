// models/customer.model.ts
import { PrismaClient, User, Prisma, Role, OrderStatus } from '@prisma/client';

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

  console.log('Order where clause:', where);

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

export interface AdminListCustomersFilters {
  name?: string;
  status?: boolean;
  minAmountSpent?: number;
  maxAmountSpent?: number;
  createdAtStart?: string;
  createdAtEnd?: string;
}

/**
 * (Admin) Retrieves a paginated list of all customers with advanced filtering.
 * @param filters - The filtering criteria.
 * @param pagination - The pagination options.
 * @returns A paginated list of customers with their total spent amount.
 */
export const adminListAllCustomers = async (
  filters: AdminListCustomersFilters,
  pagination: { page: number; take: number }
) => {
  const { name, status, minAmountSpent, maxAmountSpent, createdAtStart, createdAtEnd } = filters;
  const { page, take } = pagination;
  const skip = (page - 1) * take;

  // Base WHERE clause for the User model
  const where: Prisma.UserWhereInput = {
    role: Role.customer,
  };

  if (name) {
    where.name = { contains: name, mode: 'insensitive' };
  }
  if (status !== undefined) {
    where.active = status;
  }
  if (createdAtStart || createdAtEnd) {
    where.createdAt = {};
    if (createdAtStart) {
      (where.createdAt as any).gte = new Date(createdAtStart);
    }
    if (createdAtEnd) {
      (where.createdAt as any).lte = new Date(createdAtEnd);
    }
  }

  // --- Handle Amount Spent Filter ---
  // This is a complex filter that requires a separate query to find matching user IDs.
  if (minAmountSpent !== undefined || maxAmountSpent !== undefined) {
    const having: Prisma.OrderScalarWhereWithAggregatesInput = {};
    if (minAmountSpent !== undefined) {
      having.totalAmount = { _sum: { gte: minAmountSpent } };
    }
    if (maxAmountSpent !== undefined) {
      // If there's already a 'gte', we need to use AND
      if (having.totalAmount) {
        (having.totalAmount as any)._sum.lte = maxAmountSpent;
      } else {
        having.totalAmount = { _sum: { lte: maxAmountSpent } };
      }
    }

    const userSpendings = await prisma.order.groupBy({
      by: ['userId'],
      where: {
        orderStatus: { in: [OrderStatus.delivered, OrderStatus.picked_up_by_customer] },
      },
      _sum: {
        totalAmount: true,
      },
      having,
    });

    const userIdsWithMatchingSpend = userSpendings.map((u) => u.userId);

    // Add the list of user IDs to the main `where` clause.
    // If no users match the spending criteria, the query will correctly return no results.
    where.id = { in: userIdsWithMatchingSpend };
  }

  // --- Fetch Paginated Data and Total Count ---
  const [users, totalCount] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  // --- Aggregate spending for the fetched users ---
  const userIds = users.map((u) => u.id);
  const userAggregations = await prisma.order.groupBy({
    by: ['userId'],
    where: {
      userId: { in: userIds },
      orderStatus: { in: [OrderStatus.delivered, OrderStatus.picked_up_by_customer] },
    },
    _sum: { totalAmount: true },
  });

  const totalSpentMap = new Map(userAggregations.map((agg) => [agg.userId, agg._sum.totalAmount || 0]));

  const usersWithTotalSpent = users.map((user) => ({
    ...user,
    totalSpent: totalSpentMap.get(user.id) || 0,
  }));

  const totalPages = Math.ceil(totalCount / take);

  return {
    data: usersWithTotalSpent,
    page,
    totalPages,
    pageSize: take,
    totalCount,
  };
};

/**
 * (Admin) Retrieves detailed information for a single customer, including order statistics.
 * @param customerId The ID of the customer to retrieve.
 * @returns A customer object with their order stats, or null if not found.
 */
export const adminGetCustomerDetailsById = async (customerId: string) => {
  const [customer, orderAggregations] = await prisma.$transaction([
    prisma.user.findFirst({
      where: {
        id: customerId,
        role: Role.customer,
      },
    }),
    prisma.order.groupBy({
      by: ['orderStatus'],
      where: {
        userId: customerId,
      },
      _count: {
        orderStatus: true,
      },
      orderBy: { orderStatus: 'asc' },
    }),
  ]);

  if (!customer) {
    return null;
  }

  let totalOrders = 0;
  let totalCompleted = 0;
  let totalCancelled = 0;

  for (const group of orderAggregations) {
    const count =
      typeof group._count === 'object' ? (group._count.orderStatus ?? 0) : 0;
    totalOrders += count;
    if (([OrderStatus.delivered, OrderStatus.picked_up_by_customer] as OrderStatus[]).includes(group.orderStatus)) {
      totalCompleted += count;
    }
    if (([OrderStatus.cancelled_by_customer, OrderStatus.declined_by_vendor] as OrderStatus[]).includes(group.orderStatus)) {
      totalCancelled += count;
    }
  }

  return {
    ...customer,
    orderStats: {
      totalOrders,
      totalCompleted,
      totalCancelled,
    },
  };
};

/**
 * (Admin) Retrieves a paginated list of all transactions for a specific customer.
 * @param customerId The ID of the customer.
 * @param pagination The pagination options (page, take).
 * @returns A paginated list of the customer's transactions.
 */
export const adminListCustomerTransactions = async (
  customerId: string,
  pagination: { page: number; take: number }
) => {
  const { page, take } = pagination;
  const skip = (page - 1) * take;

  const where: Prisma.TransactionWhereInput = {
    userId: customerId,
  };

  const [transactions, totalCount] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      include: {
        order: { select: { id: true, orderCode: true } },
        vendor: { select: { id: true, name: true } },
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / take);

  return {
    data: transactions,
    page,
    totalPages,
    pageSize: take,
    totalCount,
  };
};