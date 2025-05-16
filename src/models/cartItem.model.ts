import { PrismaClient, Order, Cart, CartItem, VendorProduct } from '@prisma/client';
const prisma = new PrismaClient();


// --- CartItem Model Functions ---
export interface CreateCartItemPayload {
  cartId: string;
  vendorProductId: string;
  quantity: number;
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

export const getCartItemById = async (id: string): Promise<CartItem | null> => {
  return prisma.cartItem.findUnique({
    where: { id },
     include:{
      vendorProduct: true
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
  orderId?: string;
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

export const updateCartItemsWithOrderId = async (
  cartId: string,
  orderId: string
): Promise<number> => { // Changed return type to Promise<number>
  const result = await prisma.cartItem.updateMany({
    where: { cartId },
    data: { orderId },
  });
  return result.count;
};

export const deleteCartItem = async (id: string): Promise<CartItem> => {
  return prisma.cartItem.delete({
    where: { id },
  });
};
