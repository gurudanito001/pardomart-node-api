import { PrismaClient, Cart  } from '@prisma/client';
const prisma = new PrismaClient();


// --- Cart Model Functions ---
interface CreateCartPayload {
  userId: string;
}

export const createCart = async (payload: CreateCartPayload): Promise<Cart> => {
  return prisma.cart.create({
    data: {
      userId: payload.userId
    }
  });
};

export const getCartByUserId = async (userId: string): Promise<Cart | null> => {
  return prisma.cart.findFirst({
    where: { userId },
    include: {
      items: {
        include:{
          vendorProduct: true
        }
      },
    },
  });
};

export const getCartById = async (id: string): Promise<Cart | null> => {
  return prisma.cart.findUnique({
    where: { id },
    include: {
      items: {
        include:{
          vendorProduct: true
        }
      }
    },
  });
};



export const deleteCart = async (id: string): Promise<Cart> => {
  return prisma.cart.delete({
    where: { id },
  });
};
