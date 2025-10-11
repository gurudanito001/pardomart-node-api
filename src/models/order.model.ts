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
          },
        },
        chosenReplacement: {
          include: { product: true },
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
     include: {
      orderItems: {
        include: {
          vendorProduct: {
            include: { 
              categories: true,  
              product: true
            }
          },
          chosenReplacement: {
            include: { product: true }
          },
          replacements: {
            include: {
              product: true,
            },
          }
        }
      },
      shopper: true,
      deliveryPerson: true,
      deliveryAddress: true,
      vendor: true,
      user: true
    },
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
  vendorIds: string[];
  status?: OrderStatus;
}

/**
 * Finds all orders for a given set of vendor IDs, with optional status filtering.
 * @param filters - The filters to apply, including vendorIds and optional status.
 * @returns A promise that resolves to an array of orders with their relations.
 */
export const findOrdersForVendors = async (filters: GetOrdersForVendorFilters): Promise<OrderWithRelations[]> => {
  const where: Prisma.OrderWhereInput = {
    vendorId: {
      in: filters.vendorIds,
    },
  };

  if (filters.status) {
    where.orderStatus = filters.status;
  }

  return prisma.order.findMany({
    where,
    ...orderWithRelations,
    orderBy: { createdAt: 'desc' },
  });
};
