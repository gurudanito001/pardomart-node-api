// models/product.model.ts
import { PrismaClient, Product, VendorProduct, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateProductPayload {
  barcode: string;
  name: string;
  description?: string;
  images?: string[];
  attributes?: any;
  meta?: any;
  categoryIds: string[];
  tagIds?: string[];
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
  tagIds?: string[];
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
  categoryIds?: string[];
  tagIds?: string[];
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
  tagIds?: string[];
}


export const createProduct = async (payload: CreateProductPayload): Promise<Product> => {
  return prisma.product.create({
    data: {
      ...payload,
      categories: {
        connect: payload.categoryIds?.map((id) => ({ id })),
      },
      tags: {
        connect: payload.tagIds?.map((id) => ({ id })),
      },
    },
    include: {
      categories: true,
      tags: true
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
      tags: {
        connect: payload.tagIds?.map((id) => ({ id })),
      },
    },
    include: {
      product: true,
      categories: true,
      tags: true
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
        tags: {
          connect: payload.tagIds?.map((id: string) => ({ id })),
        },
      },
      include: {
        categories: true,
        tags: true
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
    tags: {
      connect: payload.tagIds?.map((id: string) => ({ id })),
    },
  };

  return prisma.vendorProduct.create({
    data: vendorProductPayload,
    include: {
      product: true,
      categories: true,
      tags: true
    },
  });
};


export const getProductByBarcode = async (barcode: string): Promise<Product | null> => {
  return prisma.product.findUnique({
    where: { barcode },
    include: {
      categories: true,
      tags: true
    },
  });
};

export const getVendorProductByBarcode = async (barcode: string, vendorId: string): Promise<VendorProduct | null> => {
  return prisma.vendorProduct.findFirst({
    where: {
      vendorId: vendorId,
      product: { barcode },
    },
    include: { product: true, categories: true, tags: true },
  });
};


export interface getVendorProductsFilters {
  vendorId?: string,
  productId?: string,
  tagIds?: string[],
  categoryIds?: string[],
  name?: string,
}

export const getAllVendorProducts = async (filters: getVendorProductsFilters, pagination: { page: string, take: string }) => {
  const skip = ((parseInt(pagination.page)) - 1) * parseInt(pagination.take)
  const takeVal = parseInt(pagination.take)

  const where: Prisma.VendorProductWhereInput = {};

  if (filters?.name) {
    where.name = {
      contains: filters.name,
      mode: 'insensitive',
    };
  }

  if (filters?.tagIds && filters.tagIds.length > 0) {
    where.tags = {
      some: {
        id: {
          in: filters.tagIds,
        },
      },
    };
  }

  if (filters?.categoryIds && filters.categoryIds.length > 0) {
    where.product = {
      categories: {
        some: {
          id: {
            in: filters.categoryIds,
          },
        },
      },
    };
  }

  if (filters?.vendorId) {
    where.vendorId = filters.vendorId;
  }

  if (filters?.productId) {
    where.productId = filters.productId;
  }

  const vendorProducts = await prisma.vendorProduct.findMany({
    where,
    include: {
      categories: true
    },
    skip: skip,
    take: takeVal,
  });


  const totalCount = await prisma.vendorProduct.count({
    where,
  });

  const totalPages = Math.ceil( totalCount / parseInt(pagination.take));
  return {page: parseInt(pagination.page), totalPages, pageSize: takeVal, totalCount, data: vendorProducts}
};





export const getProductsByTagIds = async (tagIds: string[]): Promise<Product[]> => {
  return prisma.product.findMany({
    where: {
      tags: {
        some: {
          id: {
            in: tagIds,
          },
        },
      },
    },
    include: {
      tags: true,
      categories: true
    },
  });
};


export const getVendorProductsByTagIds = async (tagIds: string[]): Promise<VendorProduct[]> => {
  return prisma.vendorProduct.findMany({
    where: {
      tags: {
        some: {
          id: {
            in: tagIds,
          },
        },
      },
    },
    include: {
      tags: true,
      categories: true
    },
  });
};

export const getAllProducts = async (): Promise<Product[]> => {
  await prisma.order.deleteMany();
  return prisma.product.findMany({
    include: {
      categories: true,
      tags: true,
      vendorProducts: true,
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
      tags: true,
      categories: true
    },
  });
};

export const getVendorProductById = async (vendorProductId: string): Promise<VendorProduct | null> =>{
  return prisma.vendorProduct.findUnique({
    where: {id: vendorProductId},
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
