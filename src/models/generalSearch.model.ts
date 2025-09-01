import { PrismaClient, VendorProduct, Category, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Stub for existing function
export const searchByProductName = async (searchTerm: string, userLatitude: number, userLongitude: number) => {
    console.log('searchByProductName called with:', searchTerm, userLatitude, userLongitude);
    // In a real implementation, you would perform a database query here.
    return [];
};

// Stub for existing function
export const searchByStoreName = async (searchTerm: string, userLatitude: number, userLongitude: number) => {
    console.log('searchByStoreName called with:', searchTerm, userLatitude, userLongitude);
    // In a real implementation, you would perform a database query here.
    return [];
};

// Stub for existing function
export const searchByCategoryName = async (searchTerm: string, latitude: number, longitude: number) => {
    console.log('searchByCategoryName called with:', searchTerm, latitude, longitude);
    // In a real implementation, you would perform a database query here.
    return [];
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