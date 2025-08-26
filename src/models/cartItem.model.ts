import { PrismaClient, Cart, CartItem, VendorProduct, Prisma } from '@prisma/client';
const prisma = new PrismaClient();


// --- CartItem Model Functions ---
export interface CreateCartItemPayload {
  vendorProductId: string;
  quantity: number;
  cartId: string;
}
export const createCartItem = async (
  payload: CreateCartItemPayload
): Promise<CartItem> => {
  return prisma.cartItem.create({
    data: payload,
    include:{
      vendorProduct: true
    }
  });
};


export interface CartItemWithCart extends CartItem {
  cart: {
    userId: string;
  } | null;
  vendorProduct: VendorProduct | null;
}

export const getCartItemById = async (id: string): Promise<CartItemWithCart | null> => {
  return prisma.cartItem.findUnique({
    where: { id },
     include:{
      vendorProduct: true,
      cart: {
        select: { userId: true }
      }
    }
  });
};

export const getCartItemByCartId = async (cartId: string, vendorProductId?: string): Promise<CartItem | null> => {
  return prisma.cartItem.findFirst({
    where: { 
      cartId, 
      vendorProductId 
    }
  });
};

type CartItemWithVendorProduct = CartItem & {
  vendorProduct: VendorProduct | null; //  vendorProduct can be null
};

export const getCartItemsByCartId = async (cartId: string): Promise<CartItemWithVendorProduct []> => {
  return prisma.cartItem.findMany({
    where: { 
      cartId, 
    },
    include: {
      vendorProduct: true
    }
  });
};

export interface UpdateCartItemPayload {
  quantity?: number;
}

export const updateCartItem = async (
  id: string,
  payload: UpdateCartItemPayload
): Promise<CartItem> => {
  return prisma.cartItem.update({
    where: { id },
    data: payload,
     include:{
      vendorProduct: true
    }
  });
};

export const deleteCartItem = async (id: string): Promise<CartItem> => {
  return prisma.cartItem.delete({
    where: { id },
  });
};
