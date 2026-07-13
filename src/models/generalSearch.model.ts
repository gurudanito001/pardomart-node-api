import { VendorProduct, Vendor, Category, Prisma, Role } from '@prisma/client';
import getDistance from 'geolib/es/getPreciseDistance';
import { prisma } from '../config/prisma';
import { getDescendantIds } from './category.model';

// Lean product for search results
type LeanVendorProduct = Pick<VendorProduct, 'id' | 'name' | 'price' | 'discountedPrice' | 'images' | 'weight' | 'weightUnit'>;

// Lean vendor for search results
type LeanVendor = Pick<Vendor, 'id' | 'name' | 'latitude' | 'longitude' | 'image'>;



export interface StoreWithProducts {
  vendor: LeanVendor & { distance?: number }; // Embed distance in Vendor
  products: LeanVendorProduct[];
  totalProducts: number;
}

export const searchByProductName = async (
  searchTerm: string,
  userLatitude: number,
  userLongitude: number,
  productLimit: number
): Promise<{ stores: StoreWithProducts[] }> => {
  try {
    // 1. Find vendors that have products matching the search term.
    const vendors = await prisma.vendor.findMany({
      where: {
        isPublished: true,
        vendorProducts: {
          some: {
            published: true,
            product: {
              name: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        image: true,
      },
    });

    if (!vendors || vendors.length === 0) {
      return { stores: [] };
    }

    const vendorIds = vendors.map((v) => v.id);

    const [totalProductCounts, products] = await prisma.$transaction([
      prisma.vendorProduct.groupBy({
        by: ['vendorId'],
        where: { vendorId: { in: vendorIds }, published: true, product: { name: { contains: searchTerm, mode: 'insensitive' } } },
        _count: { _all: true },
        orderBy: { vendorId: 'asc' },
      }),
      prisma.vendorProduct.findMany({
        where: { vendorId: { in: vendorIds }, published: true, product: { name: { contains: searchTerm, mode: 'insensitive' } } },
        select: { id: true, name: true, price: true, discountedPrice: true, images: true, weight: true, weightUnit: true, vendorId: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalProductCountMap = new Map(totalProductCounts.map((item) => [item.vendorId, typeof item._count === 'object' ? item._count?._all ?? 0 : 0]));
    const productsByVendor = new Map<string, LeanVendorProduct[]>();
    products.forEach(p => {
        if (!productsByVendor.has(p.vendorId!)) productsByVendor.set(p.vendorId!, []);
        if (productsByVendor.get(p.vendorId!)!.length < productLimit) {
            productsByVendor.get(p.vendorId!)!.push(p);
        }
    });

    const storesWithProducts: StoreWithProducts[] = vendors.map((vendor) => {
      const distance = getDistance({ latitude: userLatitude, longitude: userLongitude }, { latitude: vendor.latitude || 0, longitude: vendor.longitude || 0 });
      return {
        vendor: { ...vendor, distance: distance / 1000 },
        products: productsByVendor.get(vendor.id) || [],
        totalProducts: totalProductCountMap.get(vendor.id) || 0,
      };
    });

    // 3. Sort stores by distance
    storesWithProducts.sort((a, b) => a.vendor.distance! - b.vendor.distance!);

    return { stores: storesWithProducts };
  } catch (error) {
    console.error('Error in searchByProductName:', error);
    throw error;
  }
};

export const searchByStoreName = async (
  searchTerm: string,
  userLatitude: number,
  userLongitude: number,
  productLimit: number
): Promise<{ stores: StoreWithProducts[] }> => {
  try {
    // 1. Find vendors whose name matches the search term.
    const vendors = await prisma.vendor.findMany({
      where: {
        isPublished: true,
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        image: true,
      },
    });

    if (!vendors || vendors.length === 0) {
      return { stores: [] };
    }

    const vendorIds = vendors.map((v) => v.id);

    const [totalProductCounts, products] = await prisma.$transaction([
      prisma.vendorProduct.groupBy({
        by: ['vendorId'],
        where: { vendorId: { in: vendorIds }, published: true },
        _count: { _all: true },
        orderBy: { vendorId: 'asc' },
      }),
      prisma.vendorProduct.findMany({
        where: { vendorId: { in: vendorIds }, published: true },
        select: { id: true, name: true, price: true, discountedPrice: true, images: true, weight: true, weightUnit: true, vendorId: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalProductCountMap = new Map(totalProductCounts.map((item) =>  [item.vendorId, typeof item._count === 'object' ? item._count?._all ?? 0 : 0]));
    const productsByVendor = new Map<string, LeanVendorProduct[]>();
    products.forEach(p => {
        if (!productsByVendor.has(p.vendorId!)) productsByVendor.set(p.vendorId!, []);
        if (productsByVendor.get(p.vendorId!)!.length < productLimit) {
            productsByVendor.get(p.vendorId!)!.push(p);
        }
    });

    const storesWithProducts: StoreWithProducts[] = vendors.map((vendor) => {
      const distance = getDistance({ latitude: userLatitude, longitude: userLongitude }, { latitude: vendor.latitude || 0, longitude: vendor.longitude || 0 });
      return {
        vendor: { ...vendor, distance: distance / 1000 },
        products: productsByVendor.get(vendor.id) || [],
        totalProducts: totalProductCountMap.get(vendor.id) || 0,
      };
    }).sort((a, b) => a.vendor.distance! - b.vendor.distance!);
    
    return { stores: storesWithProducts };
  } catch (error) {
    console.error('Error in searchByStoreName:', error);
    throw error;
  }
};

export const searchByCategoryName = async (
  searchTerm: string,
  userLatitude: number,
  userLongitude: number,
  productLimit: number
): Promise<{ stores: StoreWithProducts[] }> => {
  try {
    // 1. Find initial categories matching the search term.
    const initialCategories = await prisma.category.findMany({
      where: { name: { contains: searchTerm, mode: 'insensitive' } },
      select: { id: true },
    });

    if (initialCategories.length === 0) {
      return { stores: [] };
    }

    // 2. For each initial category, get its descendants from the cache and collect all unique IDs.
    const allCategoryIds = new Set<string>();
    for (const cat of initialCategories) {
      allCategoryIds.add(cat.id);
      const descendantIds = await getDescendantIds(cat.id);
      descendantIds.forEach(id => allCategoryIds.add(id));
    }

    const allCategoryIdsArray = Array.from(allCategoryIds);

    if (allCategoryIdsArray.length === 0) {
      return { stores: [] };
    }


    // 3. Find vendors that have products in any of the matched categories. (No change from here on in this function)
    const vendors = await prisma.vendor.findMany({
      where: {
        isPublished: true,
        vendorProducts: {
          some: {
            published: true,
            categories: {
              some: {
                id: { in: allCategoryIdsArray },
              },
            },
          },
        },
      },
      select: { id: true, name: true, latitude: true, longitude: true, image: true },
    });

    if (!vendors.length) return { stores: [] };

    const vendorIds = vendors.map(v => v.id);

    const [totalProductCounts, products] = await prisma.$transaction([
        prisma.vendorProduct.groupBy({
            by: ['vendorId'],
            where: { vendorId: { in: vendorIds }, published: true, categories: { some: { id: { in: allCategoryIdsArray } } } },
            _count: { _all: true },
            orderBy: { vendorId: 'asc' },
        }),
        prisma.vendorProduct.findMany({
            where: { vendorId: { in: vendorIds }, published: true, categories: { some: { id: { in: allCategoryIdsArray } } } },
            select: { id: true, name: true, price: true, discountedPrice: true, images: true, weight: true, weightUnit: true, vendorId: true },
            orderBy: { createdAt: 'desc' },
        }),
    ]);

    const totalProductCountMap = new Map(totalProductCounts.map((item) => [item.vendorId, typeof item._count === 'object' ? item._count?._all ?? 0 : 0]));
    const productsByVendor = new Map<string, LeanVendorProduct[]>();
    products.forEach(p => {
        if (!productsByVendor.has(p.vendorId!)) productsByVendor.set(p.vendorId!, []);
        if (productsByVendor.get(p.vendorId!)!.length < productLimit) {
            productsByVendor.get(p.vendorId!)!.push(p);
        }
    });
    
    // 4. Calculate distance, format the output, and sort by proximity.
    const storesWithProducts: StoreWithProducts[] = vendors.map((vendor) => {
      const distance = getDistance({ latitude: userLatitude, longitude: userLongitude }, { latitude: vendor.latitude || 0, longitude: vendor.longitude || 0 });
      return {
        vendor: { ...vendor, distance: distance / 1000 },
        products: productsByVendor.get(vendor.id) || [],
        totalProducts: totalProductCountMap.get(vendor.id) || 0,
      };
    });

    storesWithProducts.sort((a, b) => a.vendor.distance! - b.vendor.distance!);
    return { stores: storesWithProducts };
  } catch (error) {
    console.error('Error in searchByCategoryName:', error);
    throw error;
  }
};

export const searchByCategoryId = async (
  categoryId: string,
  userLatitude: number,
  userLongitude: number,
  productLimit: number
): Promise<{ stores: StoreWithProducts[] }> => {
  try {
    // 1. Use the cached category tree to find all descendants.
    const descendantIds = await getDescendantIds(categoryId);
    const allCategoryIds = [categoryId, ...descendantIds];

    // 2. Find vendors that have products in any of the matched categories.
    // Find vendors that have products in any of the matched categories.
    const vendors = await prisma.vendor.findMany({
      where: {
        isPublished: true,
        vendorProducts: {
          some: {
            published: true,
            categories: {
              some: {
                id: { in: allCategoryIds },
              },
            },
          },
        },
      },
      select: { id: true, name: true, latitude: true, longitude: true, image: true },
    });

    if (!vendors || vendors.length === 0) {
      return { stores: [] };
    }

    const vendorIds = vendors.map(v => v.id);

    const [totalProductCounts, products] = await prisma.$transaction([
        prisma.vendorProduct.groupBy({
            by: ['vendorId'],
            where: { vendorId: { in: vendorIds }, published: true, categories: { some: { id: { in: allCategoryIds } } } },
            _count: { _all: true },
            orderBy: { vendorId: 'asc' },
        }),
        prisma.vendorProduct.findMany({
            where: { vendorId: { in: vendorIds }, published: true, categories: { some: { id: { in: allCategoryIds } } } },
            select: { id: true, name: true, price: true, discountedPrice: true, images: true, weight: true, weightUnit: true, vendorId: true },
            orderBy: { createdAt: 'desc' },
        }),
    ]);

    const totalProductCountMap = new Map(totalProductCounts.map((item) => [item.vendorId, typeof item._count === 'object' ? item._count?._all ?? 0 : 0]));
    const productsByVendor = new Map<string, LeanVendorProduct[]>();
    products.forEach(p => {
        if (!productsByVendor.has(p.vendorId!)) productsByVendor.set(p.vendorId!, []);
        if (productsByVendor.get(p.vendorId!)!.length < productLimit) {
            productsByVendor.get(p.vendorId!)!.push(p);
        }
    });

    // For each vendor, fetch products and calculate distance.
    const storesWithProducts: StoreWithProducts[] = vendors.map((vendor) => {
      const distance = getDistance({ latitude: userLatitude, longitude: userLongitude }, { latitude: vendor.latitude || 0, longitude: vendor.longitude || 0 });
      return {
        vendor: { ...vendor, distance: distance / 1000 },
        products: productsByVendor.get(vendor.id) || [],
        totalProducts: totalProductCountMap.get(vendor.id) || 0,
      };
    });

    // Sort stores by distance
    storesWithProducts.sort((a, b) => a.vendor.distance! - b.vendor.distance!);

    return { stores: storesWithProducts };
  } catch (error) {
    console.error('Error in searchByCategoryId:', error);
    throw error;
  }
};

interface CategoryWithProducts {
  category: Category;
  products: VendorProduct[];
}


export const vendorCategoryWithProducts = async (
  vendorId: string,
  parentCategoryId?: string
): Promise<CategoryWithProducts[]> => {
  try {
    // 1. Fetch all categories to build the tree structure in memory.
    const allCategories = await prisma.category.findMany();
    const childrenMap = new Map<string, string[]>();

    allCategories.forEach(c => {
      if (c.parentId) {
        if (!childrenMap.has(c.parentId)) {
          childrenMap.set(c.parentId, []);
        }
        childrenMap.get(c.parentId)!.push(c.id);
      }
    });

    const getDescendantIds = (categoryId: string): string[] => {
      const descendants: string[] = [];
      const queue: string[] = [...(childrenMap.get(categoryId) || [])];
      const visited = new Set<string>(queue);

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        descendants.push(currentId);
        const children = childrenMap.get(currentId) || [];
        for (const childId of children) {
          if (!visited.has(childId)) {
            visited.add(childId);
            queue.push(childId);
          }
        }
      }
      return descendants;
    };

    // 2. Determine the starting categories for grouping.
    const baseCategories: Category[] = parentCategoryId
      ? allCategories.filter(c => c.parentId === parentCategoryId)
      : allCategories.filter(c => c.parentId === null);

    const results: CategoryWithProducts[] = [];

    for (const baseCategory of baseCategories) {
      // 3. For each base category, find all its descendants.
      const descendantIds = getDescendantIds(baseCategory.id);
      const categoryIdsToFetch = [baseCategory.id, ...descendantIds];

      // 4. Fetch all vendor products within this category sub-tree.
      const products = await prisma.vendorProduct.findMany({
        where: {
          vendorId: vendorId,
          published: true,
          categories: {
            some: {
              id: { in: categoryIdsToFetch }
            }
          }
        }
      });

      // 5. If there are products, add to results.
      if (products.length > 0) {
        results.push({
          category: baseCategory,
          products: products
        });
      }
    }

    return results;
  } catch (error) {
    console.error(
      'Error fetching categories with products for vendor:',
      error
    );
    throw error; // Re-throw for centralized error handling
  }
};





/**
 * Searches for products within a specific store.
 * If searchTerm and/or categoryId are provided, it returns a flat list of matching products.
 * If no filters are provided, it returns all products for the store, grouped by their parent category.
 * @param storeId - The ID of the vendor/store.
 * @param searchTerm - Optional search term for product name.
 * @param categoryId - Optional category ID to filter by.
 * @returns A list of products or null if the store is not found.
 */

interface SearchStoreProductsResult {
  category: Category;
  products: VendorProduct[];
}


export const searchStoreProducts = async (
  storeId: string,
  searchTerm?: string,
  categoryId?: string,
  requestor?: { userId?: string; userRole?: Role; staffVendorId?: string }
): Promise<(SearchStoreProductsResult[] | VendorProduct[]) | null> => {
  const vendor = await prisma.vendor.findUnique({ where: { id: storeId } });
  if (!vendor) {
    return null; // Service layer will handle the 404
  }

  // Authorization: Differentiate between customer/guest and store owners/staff
  const isPrivileged = requestor?.userRole === Role.admin || 
                       vendor.userId === requestor?.userId || 
                       requestor?.staffVendorId === storeId;

  const where: Prisma.VendorProductWhereInput = {
    vendorId: storeId,
    isAvailable: true,
    ...(!isPrivileged && { published: true }),
  };

  if (searchTerm) {
    where.product = {
      name: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    };
  }

  if (categoryId) {
    where.categories = {
      some: {
        id: categoryId,
      },
    };
  }

  // If searchTerm or categoryId is provided, return a flat list of products.
  if (searchTerm || categoryId) {
    return prisma.vendorProduct.findMany({
      where,
    });
  }

  // If no filters are provided, fetch all products and group them by parent category.
  const productsWithIncludes = await prisma.vendorProduct.findMany({
    where, // This will only have vendorId and isAvailable
    include: {
      product: true,
      categories: {
        include: {
          parent: true,
        },
      },
    },
  });

  const groupedByParentCategory = new Map<string, SearchStoreProductsResult>();

  for (const vendorProductWithIncludes of productsWithIncludes) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { categories, product, ...cleanedVendorProduct } = vendorProductWithIncludes;

    if (!categories || categories.length === 0) continue;

    for (const category of categories) {
      // Use the parent category for grouping, or the category itself if it's a top-level one.
      const groupCategory = category.parent ?? category;

      if (!groupedByParentCategory.has(groupCategory.id)) {
        groupedByParentCategory.set(groupCategory.id, {
          category: groupCategory,
          products: [],
        });
      }

      const group = groupedByParentCategory.get(groupCategory.id)!;
      // Avoid adding the same product multiple times under the same parent category group
      if (!group.products.find(p => p.id === cleanedVendorProduct.id)) {
        group.products.push(cleanedVendorProduct);
      }
    }
  }

  return Array.from(groupedByParentCategory.values());
};