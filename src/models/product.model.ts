// models/product.model.ts
import { PrismaClient, Product, VendorProduct } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateProductPayload {
  barcode: string;
  name: string;
  description?: string;
  images?: string[];
  attributes?: any;
  meta?: any;
  categoryIds: string[];
}

interface CreateVendorProductPayload {
  vendorId: string;
  productId: string;
  price: number;
  discountedPrice?: number;
  sku?: string;
  images?: string[];
  stock?: number;
  isAvailable?: boolean;
  attributes?: any;
  name: string;
  description?: string;
  categoryIds: string[];
}


interface UpdateVendorProductPayload {
  id: string;
  price?: number;
  discountedPrice?: number;
  sku?: string;
  images?: string[];
  stock?: number;
  isAvailable?: boolean;
  attributes?: any;
  name?: string;
  description?: string;
}

interface UpdateProductBasePayload {
  id: string;
  barcode?: string;
  name?: string;
  description?: string;
  images?: string[];
  attributes?: any;
  meta?: any;
  categoryIds?: string[];
}


export const createProduct = async (payload: CreateProductPayload): Promise<Product> => {
  return prisma.product.create({
    data: {
      ...payload,
      categories: {
        connect: payload.categoryIds?.map((id) => ({ id })),
      },
    },
    include: {
      categories: true,
    },
  });
};

export const createVendorProduct = async (payload: CreateVendorProductPayload): Promise<VendorProduct> => {
  return prisma.vendorProduct.create({
    data: {
      ...payload,
      categories: {
        connect: payload.categoryIds?.map((id) => ({ id })),
      },
    },
    include: {
      product: true,
      categories: true,
    },
  });
};

export const createVendorProductWithBarcode = async (
  payload: any
): Promise<VendorProduct> => {
  const product = await prisma.product.findUnique({
    where: { barcode: payload.barcode },
  });

  let productId: string;

  if (!product) {
    const newProduct = await prisma.product.create({
      data: {
        barcode: payload.barcode,
        name: payload.name || 'Default Product Name',
        description: payload.description,
        images: payload.images || [],
        attributes: payload.attributes,
        categories: {
          connect: payload.categoryIds?.map((id: string) => ({ id })),
        },
      },
      include: {
        categories: true,
      },
    });
    productId = newProduct.id;
  } else {
    productId = product.id;
  }

  const vendorProductPayload = {
    vendorId: payload.vendorId,
    productId: productId,
    price: payload.price,
    name: payload.name,
    description: payload.description,
    discountedPrice: payload.discountedPrice,
    sku: payload.sku,
    images: payload.images || [],
    stock: payload.stock,
    isAvailable: payload.isAvailable,
    attributes: payload.attributes,
    categories: {
      connect: payload.categoryIds?.map((id: string) => ({ id })),
    },
  };

  return prisma.vendorProduct.create({
    data: vendorProductPayload,
    include: {
      product: true,
      categories: true,
    },
  });
};


export const getProductByBarcode = async (barcode: string): Promise<Product | null> => {
  return prisma.product.findUnique({
    where: { barcode },
    include: {
      categories: true,
    },
  });
};

export const getVendorProductByBarcode = async (barcode: string, vendorId: string): Promise<VendorProduct | null> => {
  return prisma.vendorProduct.findFirst({
    where: {
      vendorId: vendorId,
      product: { barcode },
    },
    include: { product: true },
  });
};

export const getAllProducts = async (): Promise<Product[]> => {
  return prisma.product.findMany({
    include: {
      categories: true,
      vendorProducts: true,
    },
  });
};

export const getAllVendorProducts = async (vendorId: string): Promise<VendorProduct[]> => {
  return prisma.vendorProduct.findMany({
    where: { vendorId },
    include: {
      product: true,
    },
  });
};

export const getVendorProductsByCategory = async (
  vendorId: string,
  categoryId: string
): Promise<VendorProduct[]> => {
  return prisma.vendorProduct.findMany({
    where: {
      vendorId: vendorId,
      product: {
        categories: {
          some: {
            id: categoryId,
          },
        },
      },
    },
    include: {
      product: true,
    },
  });
};

export const updateProductBase = async (payload: UpdateProductBasePayload): Promise<Product> => {
  return prisma.product.update({
    where: { id: payload.id },
    data: {
      ...payload,
      categories: {
        set: payload.categoryIds?.map((id) => ({ id })),
      },
    },
    include: {
      categories: true,
      vendorProducts: true,
    },
  });
};

export const updateVendorProduct = async (payload: UpdateVendorProductPayload): Promise<VendorProduct> => {
  return prisma.vendorProduct.update({
    where: { id: payload.id },
    data: payload,
    include: {
      product: true,
    },
  });
};

export const deleteProduct = async (id: string): Promise<Product> => {
  return prisma.product.delete({
    where: { id },
  });
};

export const deleteVendorProduct = async (id: string): Promise<VendorProduct> => {
  return prisma.vendorProduct.delete({
    where: { id },
  });
};

