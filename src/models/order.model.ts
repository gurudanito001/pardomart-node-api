import { PrismaClient, Order, Cart, CartItem, PaymentMethods, PaymentStatus, OrderStatus, ShoppingMethod, DeliveryMethod } from '@prisma/client';

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
  scheduledShoppingStartTime?: Date
}

export const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
  const orderPayload = payload;

  // Use a Prisma transaction to ensure atomicity
  const order = await prisma.order.create({
    data: orderPayload
  })
  return order;
};



export const getOrderById = async (id: string): Promise<Order | null> => {
  return prisma.order.findUnique({
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
      deliverer: true,
      deliveryAddress: true
    },
  });
};

export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
  await prisma.order.deleteMany();
  return prisma.order.findMany({
    where: { userId },
    include: {
      orderItems: {       // Include CartItems
        include: {
           vendorProduct: true
        }
      },
      shopper: true,
      deliverer: true,
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
  shoppingHandlerId?: string;
  deliveryHandlerId?: string;
  shoppingMethod?: ShoppingMethod;
  deliveryMethod?: DeliveryMethod;
  scheduledShoppingStartTime?: Date
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
