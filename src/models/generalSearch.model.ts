import { VendorProduct, Vendor, Category, Prisma } from '@prisma/client';
import getDistance from 'geolib/es/getPreciseDistance';
import { prisma } from '../config/prisma';





export interface StoreWithProducts {
  vendor: Vendor & { distance?: number }; // Embed distance in Vendor
  products: VendorProduct[];
  totalProducts: number;
}

export const searchByProductName = async (
  searchTerm: string,
  userLatitude: number,
  userLongitude: number
): Promise<{ stores: StoreWithProducts[] }> => {
  try {
    // 1. Find vendors that have products matching the search term.
    const vendors = await prisma.vendor.findMany({
      where: {
        vendorProducts: {
          some: {
            product: {
              name: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
        },
      },
    });

    if (!vendors || vendors.length === 0) {
      return { stores: [] };
    }

    // 2. For each vendor, fetch matching products and count total matching products.
    const storesWithProducts: StoreWithProducts[] = await Promise.all(
      vendors.map(async (vendor) => {
        const [products, totalProducts] = await prisma.$transaction([
          prisma.vendorProduct.findMany({
            where: {
              vendorId: vendor.id,
              product: {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
            },
            take: 10, // Fetch up to 10 matching products
          }),
          prisma.vendorProduct.count({
            where: {
              vendorId: vendor.id,
              product: {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
            },
          }),
        ]);

        const distance = getDistance(
          { latitude: userLatitude, longitude: userLongitude },
          { latitude: vendor.latitude || 0, longitude: vendor.longitude || 0 }
        );

        return {
          vendor: { ...vendor, distance: distance / 1000 },
          products,
          totalProducts,
        };
      })
    );

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
  userLongitude: number
): Promise<{ stores: StoreWithProducts[] }> => {
  try {
    // 1. Find vendors whose name matches the search term.
    const vendors = await prisma.vendor.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
    });

    if (!vendors || vendors.length === 0) {
      return { stores: [] };
    }

    // 2. Calculate distance for each vendor.
    const vendorsWithDistance = vendors.map((vendor) => {
      const distance = getDistance(
        { latitude: userLatitude, longitude: userLongitude },
        { latitude: vendor.latitude || 0, longitude: vendor.longitude || 0 }
      );
      return { ...vendor, distance: distance / 1000 };
    });

    // 3. Sort vendors by distance (closest first).
    vendorsWithDistance.sort((a, b) => a.distance - b.distance);

    // 4. For each vendor, fetch up to 10 of their products and get the total product count.
    const storesWithProducts: StoreWithProducts[] = await Promise.all(
      vendorsWithDistance.map(async (vendor) => {
        const [products, totalProducts] = await prisma.$transaction([
          prisma.vendorProduct.findMany({
            where: { vendorId: vendor.id },
            take: 10,
            orderBy: { createdAt: 'desc' },
          }),
          prisma.vendorProduct.count({
            where: { vendorId: vendor.id },
          }),
        ]);


        return { vendor, products, totalProducts };
      })
    );

    return { stores: storesWithProducts };
  } catch (error) {
    console.error('Error in searchByStoreName:', error);
    throw error;
  }
};

export const searchByCategoryName = async (
  searchTerm: string,
  userLatitude: number,
  userLongitude: number
): Promise<{ stores: StoreWithProducts[] }> => {
  try {
    // 1. Find categories that match the search term, including their children.
    const categories = await prisma.category.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      include: {
        children: true,
      },
    });

    if (!categories.length) {
      return { stores: [] };
    }

    // 2. Collect all relevant category IDs (parent and children).
    const categoryIds = new Set<string>();
    categories.forEach(category => {
      categoryIds.add(category.id);
      category.children.forEach(child => categoryIds.add(child.id));
    });
    const allCategoryIds = Array.from(categoryIds);

    // 3. Find vendors that have products in any of the matched categories.
    const vendorsWithProducts = await prisma.vendor.findMany({
      where: {
        vendorProducts: {
          some: {
            categories: {
              some: {
                id: { in: allCategoryIds },
              },
            },
          },
        },
      },
      include: {
        vendorProducts: {
          where: {
            categories: { some: { id: { in: allCategoryIds } } },
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // 4. Calculate distance, format the output, and sort by proximity.
    const storesWithProducts: StoreWithProducts[] = await Promise.all(
      vendorsWithProducts.map(async (vendor) => {
        const distance = getDistance(
          { latitude: userLatitude, longitude: userLongitude },
          { latitude: vendor.latitude || 0, longitude: vendor.longitude || 0 }
        );
        const { vendorProducts, ...storeDetails } = vendor;

        const totalProducts = await prisma.vendorProduct.count({
          where: {
            vendorId: vendor.id,
            categories: { some: { id: { in: allCategoryIds } } },
          },
        });

        return {
          vendor: { ...storeDetails, distance: distance / 1000 },
          products: vendorProducts,
          totalProducts,
        };
      })
    );

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
  userLongitude: number
): Promise<{ stores: StoreWithProducts[] }> => {
  try {
    // This logic to find descendants can be expensive.
    // For a production system with many categories, consider a recursive CTE in raw SQL
    // or denormalizing the category tree.
    const allCategories = await prisma.category.findMany({
      select: { id: true, parentId: true },
    });
    const childrenMap = new Map<string, string[]>();
    allCategories.forEach(c => {
      if (c.parentId) {
        if (!childrenMap.has(c.parentId)) {
          childrenMap.set(c.parentId, []);
        }
        childrenMap.get(c.parentId)!.push(c.id);
      }
    });

    const getDescendantIds = (catId: string): string[] => {
      const descendants: string[] = [];
      const queue: string[] = [...(childrenMap.get(catId) || [])];
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

    const descendantIds = getDescendantIds(categoryId);
    const allCategoryIds = [categoryId, ...descendantIds];

    // Find vendors that have products in any of the matched categories.
    const vendors = await prisma.vendor.findMany({
      where: {
        vendorProducts: {
          some: {
            categories: {
              some: {
                id: { in: allCategoryIds },
              },
            },
          },
        },
      },
    });

    if (!vendors || vendors.length === 0) {
      return { stores: [] };
    }

    // For each vendor, fetch products and calculate distance.
    const storesWithProducts: StoreWithProducts[] = await Promise.all(
      vendors.map(async (vendor) => {
        const [products, totalProducts] = await prisma.$transaction([
          prisma.vendorProduct.findMany({
            where: {
              vendorId: vendor.id,
              categories: {
                some: { id: { in: allCategoryIds } },
              },
            },
            take: 10,
            orderBy: { createdAt: 'desc' },
          }),
          prisma.vendorProduct.count({
            where: {
              vendorId: vendor.id,
              categories: {
                some: { id: { in: allCategoryIds } },
              },
            },
          }),
        ]);

        const distance = getDistance({ latitude: userLatitude, longitude: userLongitude }, { latitude: vendor.latitude || 0, longitude: vendor.longitude || 0 });

        return { vendor: { ...vendor, distance: distance / 1000 }, products, totalProducts };
      })
    );

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
  categoryId?: string
): Promise<(SearchStoreProductsResult[] | VendorProduct[]) | null> => {
  const vendor = await prisma.vendor.findUnique({ where: { id: storeId } });
  if (!vendor) {
    return null; // Service layer will handle the 404
  }

  const where: Prisma.VendorProductWhereInput = {
    vendorId: storeId,
    isAvailable: true,
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