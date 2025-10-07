// models/product.model.ts
import { PrismaClient, Product, VendorProduct, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateProductPayload {
  barcode: string;
  name: string;
  description?: string;
  images?: string[];
  attributes?: any;
  meta?: any;
  categoryIds: string[];
  tagIds?: string[];
}

export interface CreateVendorProductPayload {
  vendorId: string;
  productId: string;
  price: number;
  discountedPrice?: number;
  sku?: string;
  images?: string[];
  isAvailable?: boolean;
  attributes?: any;
  name: string;
  description?: string;
  categoryIds: string[];
  tagIds?: string[];
}


export interface UpdateVendorProductPayload {
  id: string;
  price?: number;
  discountedPrice?: number;
  sku?: string;
  images?: string[];
  isAvailable?: boolean;
  attributes?: any;
  name?: string;
  description?: string;
  categoryIds?: string[];
  tagIds?: string[];
}

export interface UpdateProductBasePayload {
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
  const { categoryIds, tagIds, ...restOfPayload } = payload;
  return prisma.product.create({
    data: {
      ...restOfPayload,
      categories: {
        connect: categoryIds?.map((id) => ({ id })),
      },
      tags: {
        connect: tagIds?.map((id) => ({ id })),
      },
    },
    include: {
      categories: true,
      tags: true
    },
  });
};

export const createVendorProduct = async (payload: CreateVendorProductPayload & { id?: string }): Promise<VendorProduct> => {
  const { id, categoryIds, tagIds, productId, vendorId, ...restOfPayload } = payload;
  return prisma.vendorProduct.create({
    data: {
      ...restOfPayload,
      id: id, // Pass the pre-generated ID to Prisma
      vendorId: vendorId,
      productId: productId,
      categories: {
        connect: categoryIds?.map((id) => ({ id })),
      },
      tags: {
        connect: tagIds?.map((id) => ({ id })),
      },
    },
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

export const getVendorProductsByUserId = async (userId: string): Promise<VendorProduct[]> => {
  return prisma.vendorProduct.findMany({
    where: {
      vendor: {
        userId: userId,
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};


/**
 * Retrieves a paginated list of trending vendor products.
 * Trending is defined by the number of times a product appears in order items.
 *
 * @param filters - Filtering options, currently supports `vendorId`.
 * @param pagination - Pagination options `page` and `take`.
 * @returns A paginated list of vendor products with their trend count.
 */
export const getTrendingVendorProducts = async (
  filters: { vendorId?: string },
  pagination: { page: string; take: string }
): Promise<{ data: (VendorProduct & { orderCount: number })[], total: number, page: number, size: number }> => {
  const { vendorId } = filters;
  const pageNum = parseInt(pagination.page, 10) || 1;
  const takeNum = parseInt(pagination.take, 10) || 5;/*  */
  const skip = (pageNum - 1) * takeNum;

  const orderItemWhere: Prisma.OrderItemWhereInput = {};

  if (vendorId) {
    orderItemWhere.vendorProduct = {
      vendorId: vendorId,
    };
  }

  // 1. Aggregate OrderItems to get the count for each vendorProductId and paginate
  const trendingProductCounts = await prisma.orderItem.groupBy({
    by: ['vendorProductId'],
    where: orderItemWhere,
    _count: {
      vendorProductId: true,
    },
    orderBy: {
      _count: {
        vendorProductId: 'desc',
      },
    },
    
    skip,
    take: takeNum,
  });

  const trendingVendorProductIds = trendingProductCounts.map(
    (item) => item.vendorProductId
  );

  if (trendingVendorProductIds.length === 0) {
    return { data: [], total: 0, page: pageNum, size: takeNum };
  }

  // 2. Fetch the full VendorProduct details for the IDs we found
  const vendorProducts = await prisma.vendorProduct.findMany({
    where: { id: { in: trendingVendorProductIds } },
  });

  // 3. Combine product data with trend count
  const productCountMap = new Map<string, number>();
  trendingProductCounts.forEach(p => {
    productCountMap.set(p.vendorProductId, p._count.vendorProductId);
  });

  const vendorProductsWithCount = vendorProducts.map(vp => ({
    ...vp,
    orderCount: productCountMap.get(vp.id) || 0,
  }));

  // 4. Re-sort the fetched products to match the trending order
  const sortedVendorProducts = vendorProductsWithCount.sort((a, b) => trendingVendorProductIds.indexOf(a.id) - trendingVendorProductIds.indexOf(b.id));

  // 5. Get total count of distinct products for pagination metadata
  const totalDistinctProducts = await prisma.orderItem.groupBy({ by: ['vendorProductId'], where: orderItemWhere });
  const totalCount = totalDistinctProducts.length;

  return { data: sortedVendorProducts, total: totalCount, page: pageNum, size: takeNum };
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
