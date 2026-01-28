import { PrismaClient, Order, Cart, CartItem, PaymentMethods, PaymentStatus, OrderStatus, ShoppingMethod, DeliveryMethod, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// --- Order Model Functions ---

export interface CreateOrderPayload {
  userId: string;
  vendorId: string;
  orderCode: string;
  subtotal: number;
  totalAmount: number;
  deliveryFee?: number;
  serviceFee?: number;
  shoppingFee?: number;
  shopperTip?: number;
  pickupOtp?: string;
  deliveryPersonTip?: number;
  paymentMethod?: PaymentMethods;
  deliveryAddressId?: string | null;
  deliveryInstructions?: string;
  shoppingMethod?: ShoppingMethod;
  deliveryMethod?: DeliveryMethod;
  shoppingStartTime?: Date;
  scheduledDeliveryTime?: Date;
  actualDeliveryTime?: Date;
}

export const createOrder = async (payload: CreateOrderPayload, tx?: Prisma.TransactionClient): Promise<Order> => {
  const db = tx || prisma;
  return db.order.create({
    data: payload,
  });
};

const orderWithRelations = Prisma.validator<Prisma.OrderDefaultArgs>()({
  include: {
    orderItems: {
      include: {
        vendorProduct: {
          include: {
            product: true,
            categories: true,
          },
        },
        chosenReplacement: {
          include: {
            product: true,
          },
        },
        replacements: {
          include: {
            product: true,
          },
        },
      },
    },
    shopper: true,
    deliveryPerson: true,
    deliveryAddress: true,
    vendor: true,
    user: true,
  },
});

export type OrderWithRelations = Prisma.OrderGetPayload<typeof orderWithRelations>;

export const getOrderById = async (id: string, tx?: Prisma.TransactionClient): Promise<OrderWithRelations | null> => {
  const db = tx || prisma;
  return db.order.findUnique({
    where: { id },
    ...orderWithRelations,
  });
};

export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
  return prisma.order.findMany({
    where: { userId },
    include: {
      orderItems: {
        include: {
           vendorProduct: true,
        }
      },
      vendor: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      }
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
};

export interface UpdateOrderPayload {
  subtotal?: number;
  totalAmount?: number;
  deliveryFee?: number;
  serviceFee?: number;
  shoppingFee?: number;
  shopperTip?: number;
  deliveryPersonTip?: number;
  paymentMethod?: PaymentMethods;
  paymentStatus?: PaymentStatus;
  orderStatus?: OrderStatus;
  deliveryAddressId?: string;
  deliveryInstructions?: string;
  shopperId?: string;
  deliveryPersonId?: string;
  shoppingMethod?: ShoppingMethod;
  deliveryMethod?: DeliveryMethod;
  shoppingStartTime?: Date;
  scheduledDeliveryTime?: Date;
  actualDeliveryTime?: Date;
}

export const updateOrder = async (
  id: string,
  payload: UpdateOrderPayload,
  tx?: Prisma.TransactionClient
): Promise<Order> => {
  const db = tx || prisma;
  return db.order.update({
    where: { id },
    data: payload,
  });
};

export const deleteOrder = async (id: string): Promise<Order> => {
  return prisma.order.delete({
    where: { id },
  });
};


export interface GetOrdersForVendorFilters {
  vendorIds?: string[];
  status?: OrderStatus;
  shopperId?: string;
}

/**
 * Finds all orders for a given set of vendor IDs, with optional status filtering.
 * @param filters - The filters to apply, including vendorIds and optional status.
 * @returns A promise that resolves to an array of orders with their relations.
 */
export const findOrdersForVendors = async (filters: GetOrdersForVendorFilters): Promise<OrderWithRelations[]> => {
  const where: Prisma.OrderWhereInput = {
  };

  if (filters.vendorIds && filters.vendorIds.length > 0) {
    where.vendorId = { in: filters.vendorIds };
  }

  if (filters.status) {
    where.orderStatus = filters.status;
  }
  if (filters.shopperId) {
    where.shopperId = filters.shopperId;
  }

  return prisma.order.findMany({
    where,
    ...orderWithRelations,
    orderBy: { createdAt: 'desc' },
  });
};

export interface AdminGetOrdersFilters {
  orderCode?: string;
  status?: OrderStatus;
  customerName?: string;
  createdAtStart?: string;
  createdAtEnd?: string;
}

export interface Pagination {
  page: number;
  take: number;
}



/**
 * (Admin) Retrieves a paginated list of all orders with filtering.
 * @param filters - The filtering criteria.
 * @param pagination - The pagination options.
 * @returns A paginated list of orders.
 */
export const adminGetAllOrders = async (filters: AdminGetOrdersFilters, pagination: Pagination) => {
  const { orderCode, status, customerName, createdAtStart, createdAtEnd } = filters;
  const { page, take } = pagination;

  const skip = (page - 1) * take;

  const where: Prisma.OrderWhereInput = {};

  if (orderCode) {
    where.orderCode = {
      contains: orderCode,
      mode: 'insensitive',
    };
  }

  if (status) {
    where.orderStatus = status;
  }

  if (customerName) {
    where.user = {
      name: {
        contains: customerName,
        mode: 'insensitive',
      },
    };
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

  const [orders, totalCount] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } }, // Include customer details
        vendor: { select: { id: true, name: true } }, // Include store details
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / take);

  return {
    data: orders,
    page,
    totalPages,
    pageSize: take,
    totalCount,
  };
};
