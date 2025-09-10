import { PrismaClient, VendorProduct, Vendor, Category, Prisma } from '@prisma/client';
import getDistance from 'geolib/es/getPreciseDistance';

const prisma = new PrismaClient();





interface StoreWithProducts {
  vendor: Vendor & { distance?: number }; // Embed distance in Vendor
  products: VendorProduct[];
}

export const searchByProductName = async (
  searchTerm: string,  // Changed to searchTerm
  userLatitude: number,
  userLongitude: number
): Promise<{ stores: StoreWithProducts[] }> => {
  try {
    // 1. Find the VendorProducts for the given searchTerm.
    const vendorProducts = await prisma.vendorProduct.findMany({
      where: {
        product: {  // Assuming there's a relation to a Product model
          name: {
            contains: searchTerm, // Use 'contains' for searching
            mode: 'insensitive'  //  case-insensitive search
          }
        }
      },
      include: {
        vendor: true,
        product: true // Include the product in the result
      },
    });

    if (!vendorProducts || vendorProducts.length === 0) {
      return { stores: [] };
    }

    // 2.  Create a map of vendors, and vendorProducts
     const vendorProductMap = new Map<string, { vendor: Vendor & { distance?: number }; products: VendorProduct[] }>();

    // Add vendors and products to the map.  Calculate distance here.
    vendorProducts.forEach((vProduct) => {
      const distance = getDistance(
        { latitude: userLatitude, longitude: userLongitude },
        { latitude: vProduct.vendor.latitude || 0, longitude: vProduct.vendor.longitude || 0 }
      );

      const vendorWithDistance = { ...vProduct.vendor, distance: distance / 1000 }; // Create a new object

      if (!vendorProductMap.has(vProduct.vendorId)) {
        vendorProductMap.set(vProduct.vendorId, {
          vendor: vendorWithDistance,
          products: [vProduct],
        });
      } else {
        vendorProductMap.get(vProduct.vendorId)!.products.push(vProduct);
      }
    });

    //3. Convert the map to an array
    const storesWithProducts = Array.from(vendorProductMap.values());

    //4. Fetch other products for each vendor.
    await Promise.all(
      storesWithProducts.map(async (store) => {
        const otherProducts = await prisma.vendorProduct.findMany({
          where: {
            vendorId: store.vendor.id,
            product: {
              name: {
                not: {
                  contains: searchTerm,
                },
                mode: 'insensitive' // Move mode here
              },
            },
          },
          take: 4,
        });
        store.products.push(...otherProducts);
      })
    );

    // Sort by distance (closest first)
    storesWithProducts.sort((a, b) => a.vendor.distance! - b.vendor.distance!);

    //Re-arrange the products.  The product that matches the search term should be the first.

    const sortedStores = storesWithProducts.map(store => {
        const sortedProducts = store.products.sort(a =>
            a.name.toLowerCase().includes(searchTerm.toLowerCase()) ? -1 : 1
        );

        // The 'vendor' and 'product' relations are included in the initial query but not in the base VendorProduct type.
        // We remove them here to clean up the response payload for each product.
        const cleanedProducts = sortedProducts.map(p => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { vendor, product, ...rest } = p as any;
            return rest;
        });
        return { ...store, products: cleanedProducts };
    });

    return { stores: sortedStores };
  } catch (error) {
    console.error('Error in getStoresByProductId:', error);
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

    // 4. For each vendor, fetch up to 5 of their products and create the final structure.
    const storesWithProducts: StoreWithProducts[] = await Promise.all(
      vendorsWithDistance.map(async (vendor) => {
        const products = await prisma.vendorProduct.findMany({
          where: { vendorId: vendor.id },
          take: 5,
          orderBy: { createdAt: 'desc' },
        });

        return { vendor, products };
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
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // 4. Calculate distance, format the output, and sort by proximity.
    const storesWithFormattedProducts: StoreWithProducts[] = vendorsWithProducts.map((vendor) => {
      const distance = getDistance(
        { latitude: userLatitude, longitude: userLongitude },
        { latitude: vendor.latitude || 0, longitude: vendor.longitude || 0 }
      );
      const { vendorProducts, ...storeDetails } = vendor;
      return { vendor: { ...storeDetails, distance: distance / 1000 }, products: vendorProducts };
    }).sort((a, b) => a.vendor.distance! - b.vendor.distance!);

    return { stores: storesWithFormattedProducts };
  } catch (error) {
    console.error('Error in searchByCategoryName:', error);
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