import { PrismaClient, User, Prisma, Role, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface AdminListDeliveryPersonsFilters {
  name?: string;
  status?: boolean;
  minDeliveries?: number;
  maxDeliveries?: number;
  createdAtStart?: string;
  createdAtEnd?: string;
}

/**
 * (Admin) Retrieves a paginated list of all delivery persons with advanced filtering.
 * @param filters - The filtering criteria.
 * @param pagination - The pagination options.
 * @returns A paginated list of delivery persons with their total delivery count.
 */
export const adminListAllDeliveryPersons = async (
  filters: AdminListDeliveryPersonsFilters,
  pagination: { page: number; take: number }
) => {
  const { name, status, minDeliveries, maxDeliveries, createdAtStart, createdAtEnd } = filters;
  const { page, take } = pagination;
  const skip = (page - 1) * take;

  // Base WHERE clause for the User model
  const where: Prisma.UserWhereInput = {
    role: Role.delivery_person,
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

  // --- Handle Number of Deliveries Filter ---
  if (minDeliveries !== undefined || maxDeliveries !== undefined) {
    const having: Prisma.OrderScalarWhereWithAggregatesInput = {};
    const countFilter: Prisma.IntFilter = {};

    if (minDeliveries !== undefined) {
      countFilter.gte = minDeliveries;
    }
    if (maxDeliveries !== undefined) {
      countFilter.lte = maxDeliveries;
    }
    having.id = { _count: countFilter };

    const userDeliveries = await prisma.order.groupBy({
      by: ['deliveryPersonId'],
      where: {
        deliveryPersonId: { not: null },
        orderStatus: OrderStatus.delivered,
      },
      _count: { id: true },
      having,
    });

    const userIdsWithMatchingDeliveries = userDeliveries.map((u) => u.deliveryPersonId as string);
    where.id = { in: userIdsWithMatchingDeliveries };
  }

  // --- Fetch Paginated Data and Total Count ---
  const [users, totalCount] = await prisma.$transaction([
    prisma.user.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.user.count({ where }),
  ]);

  // --- Aggregate delivery counts for the fetched users ---
  const userIds = users.map((u) => u.id);
  const deliveryCounts = await prisma.order.groupBy({
    by: ['deliveryPersonId'],
    where: {
      deliveryPersonId: { in: userIds },
      orderStatus: OrderStatus.delivered,
    },
    _count: { id: true },
  });

  const deliveryCountMap = new Map(deliveryCounts.map((agg) => [agg.deliveryPersonId, agg._count.id || 0]));

  const usersWithDeliveryCount = users.map((user) => ({
    ...user,
    totalDeliveries: deliveryCountMap.get(user.id) || 0,
  }));

  const totalPages = Math.ceil(totalCount / take);

  return {
    data: usersWithDeliveryCount,
    page,
    totalPages,
    pageSize: take,
    totalCount,
  };
};

/**
 * (Admin) Retrieves detailed information for a single delivery person, including statistics and recent deliveries.
 * @param deliveryPersonId The ID of the delivery person to retrieve.
 * @returns A delivery person object with their stats and recent deliveries, or null if not found.
 */
export const adminGetDeliveryPersonDetailsById = async (deliveryPersonId: string) => {
  const [deliveryPerson, orderStats, ratingStats, recentDeliveries] = await prisma.$transaction([
    // 1. Fetch the user, ensuring they are a delivery person
    prisma.user.findFirst({
      where: {
        id: deliveryPersonId,
        role: Role.delivery_person,
      },
    }),

    // 2. Aggregate order statistics
    prisma.order.aggregate({
      where: {
        deliveryPersonId: deliveryPersonId,
        orderStatus: OrderStatus.delivered,
      },
      _count: {
        id: true, // Total completed deliveries
      },
      _sum: {
        deliveryPersonTip: true, // Total earnings from tips
      },
    }),

    // 3. Aggregate rating statistics
    prisma.rating.aggregate({
      where: {
        ratedUserId: deliveryPersonId,
        type: 'DELIVERER',
      },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    }),

    // 4. Fetch recent deliveries
    prisma.order.findMany({
      where: {
        deliveryPersonId: deliveryPersonId,
        orderStatus: OrderStatus.delivered,
      },
      include: {
        user: { select: { name: true } }, // Customer name
        vendor: { select: { name: true } }, // Vendor name
      },
      orderBy: {
        actualDeliveryTime: 'desc',
      },
      take: 10, // Get the 10 most recent deliveries
    }),
  ]);

  if (!deliveryPerson) {
    return null;
  }

  return {
    ...deliveryPerson,
    stats: {
      totalDeliveries: orderStats._count.id || 0,
      totalEarnings: orderStats._sum.deliveryPersonTip || 0,
      averageRating: ratingStats._avg.rating || 0,
      totalRatings: ratingStats._count.id || 0,
    },
    recentDeliveries,
  };
};

/**
 * (Admin) Retrieves a paginated delivery history for a single delivery person.
 * @param deliveryPersonId The ID of the delivery person.
 * @param pagination The pagination options (page, take).
 * @returns A paginated list of the delivery person's completed deliveries.
 */
export const adminGetDeliveryHistory = async (
  deliveryPersonId: string,
  pagination: { page: number; take: number }
) => {
  const { page, take } = pagination;
  const skip = (page - 1) * take;

  const where: Prisma.OrderWhereInput = {
    deliveryPersonId: deliveryPersonId,
    orderStatus: OrderStatus.delivered,
  };

  const [deliveries, totalCount] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      select: {
        id: true,
        orderCode: true,
        pickupOtpVerifiedAt: true, // This marks the time the order was picked up from the store
        actualDeliveryTime: true,
        vendor: {
          select: {
            name: true,
            address: true,
          },
        },
        deliveryAddress: {
          select: {
            addressLine1: true,
            city: true,
            state: true,
            label: true,
          },
        },
      },
      orderBy: {
        actualDeliveryTime: 'desc',
      },
      skip,
      take,
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / take);

  return {
    data: deliveries.map((d) => ({
      ...d,
      pickupTime: d.pickupOtpVerifiedAt,
      deliveryTime: d.actualDeliveryTime,
    })),
    page,
    totalPages,
    pageSize: take,
    totalCount,
  };
};
