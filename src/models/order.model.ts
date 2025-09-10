import { PrismaClient, Order, Cart, CartItem, PaymentMethods, PaymentStatus, OrderStatus, ShoppingMethod, DeliveryMethod, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// --- Order Model Functions ---

export interface CreateOrderPayload {
  userId: string;
  vendorId: string;
  totalAmount: number;
  deliveryFee?: number;
  serviceFee?: number;
  shoppingFee?: number;
  paymentMethod?: PaymentMethods;
  deliveryAddressId?: string;
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

export const getOrderById = async (id: string, tx?: Prisma.TransactionClient): Promise<Order | null> => {
  const db = tx || prisma;
  return db.order.findUnique({
    where: { id },
     include: {
      orderItems: {
        include: {
          vendorProduct: {
            include: {
              product: true
            }
          }
        }
      },
      shopper: true,
      deliveryPerson: true,
      deliveryAddress: true
    },
  });
};

export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
  return prisma.order.findMany({
    where: { userId },
    include: {
      orderItems: {       // Include CartItems
        include: {
           vendorProduct: true
        }
      },
      shopper: true,
      deliveryPerson: true,
      vendor: true
    },
  });
};

export interface UpdateOrderPayload {
  totalAmount?: number;
  deliveryFee?: number;
  serviceFee?: number;
  shoppingFee?: number;
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
  payload: UpdateOrderPayload
): Promise<Order> => {
  return prisma.order.update({
    where: { id },
    data: payload,
  });
};

export const deleteOrder = async (id: string): Promise<Order> => {
  return prisma.order.delete({
    where: { id },
  });
};
