import { PrismaClient, Cart  } from '@prisma/client';
const prisma = new PrismaClient();


// --- Cart Model Functions ---
interface CreateCartPayload {
  userId: string;
  vendorId: string;
}

export const createCart = async (payload: CreateCartPayload): Promise<Cart> => {
  return prisma.cart.create({
    data: {
      userId: payload.userId,
      vendorId: payload.vendorId
    }
  });
};

export const getCartsByUserId = async (userId: string): Promise<Cart[]> => {
  return prisma.cart.findMany({
    where: { userId },
    include: {
      items: {
        include:{
          vendorProduct: true
        }
      },
      vendor: true,
    },
  });
};

export const getCartByUserIdAndVendorId = async (userId: string, vendorId: string): Promise<Cart | null> => {
  return prisma.cart.findUnique({
    where: {
      userId_vendorId: {
        userId,
        vendorId,
      },
    },
    include: {
      items: {
        include: {
          vendorProduct: true,
        },
      },
      vendor: true,
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
      },
      vendor: true,
    },
  });
};



export const deleteCart = async (id: string): Promise<Cart> => {
  return prisma.cart.delete({
    where: { id },
  });
};
