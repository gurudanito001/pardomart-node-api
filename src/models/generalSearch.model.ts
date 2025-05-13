


import { PrismaClient, Product, Vendor, Category, VendorProduct } from '@prisma/client';
import { getDistance } from 'geolib'; // You'll need to install the 'geolib' package: npm install geolib

const prisma = new PrismaClient();

interface GeneralSearchResult {
  products: Product[];
  vendors: Vendor[];
  categories: Category[];
}

interface ProductWithVendor {
  product: VendorProduct;
  vendor: {
    id: string;
    name: string;
    distance?: number; // Distance from user
    latitude?: number,
    longitude?: number
  };
}

interface ProductWithVendorInput {
  product: VendorProduct;
  vendor: {
    id: string;
    name: string;
    latitude?: number,
    longitude?: number
  };
}

interface StoreWithDistance extends Vendor {
  distance?: number;
}

interface CategoryWithProducts {
  category: Category;
  products?: ProductWithVendor[];
}

// 1. Product Search Function
const searchProducts = async (keyword: string): Promise<Product[]> => {
  return prisma.product.findMany({
    where: {
      name: {
        contains: keyword,
        mode: 'insensitive',
      },
    },
    orderBy: [
      {
        name: 'asc', // Order by name similarity (ascending for most similar)
      },
    ],
    take: 10, // Limit to top 10 products
  });
};

// 2. Category Search Function
const searchCategories = async (keyword: string): Promise<Category[]> => {
  return prisma.category.findMany({
    where: {
      name: {
        contains: keyword,
        mode: 'insensitive',
      },
    },
    include: {
      children: true
    },
    orderBy: [
      {
        name: 'asc', // Order by name similarity (ascending for most similar)
      },
    ],
    take: 5, // Limit to top 5 categories
  });
};

// 3. Vendor Search Function
const searchVendors = async (
  keyword: string,
  latitude: number,
  longitude: number
): Promise<Vendor[]> => {
  const vendors = await prisma.vendor.findMany({
    where: {
      name: {
        contains: keyword,
        mode: 'insensitive',
      }
    },
    // No need to order here, we will sort in  memory
  });

  // Calculate distances and sort by proximity
  const vendorsWithDistance = vendors.map((vendor) => {
    const distance = getDistance(
      { latitude, longitude },
      { latitude: vendor.latitude || 0, longitude: vendor.longitude || 0 } //handle null lat/long
    );
    return { ...vendor, distance: distance / 1000 };
  });

  // Sort vendors by distance (closest first)
  vendorsWithDistance.sort((a, b) => a.distance - b.distance);

  return vendorsWithDistance;
};

// 4. Main General Search Function
export const getVendorsCategoriesAndProducts = async (
  search: string,
  latitude: number,
  longitude: number
): Promise<GeneralSearchResult> => {
  try {
    const products = await searchProducts(search);
    const categories = await searchCategories(search);
    const vendors = await searchVendors(search, latitude, longitude);

    return { products, vendors, categories };
  } catch (error) {
    console.error('Error during general search:', error);
    throw error; // Re-throw for centralized error handling
  }
};




export const getVendorCategoriesWithProducts = async (
  vendorId: string
): Promise<CategoryWithProducts[]> => {
  try {
    // 1. Find categories that have products from the specified vendor.
    const categories = await prisma.category.findMany({
      where: {
        vendorProducts: {
          some: {
            vendorId: vendorId,
          },
        },
      },
      include: {
        vendorProducts: {
          where: {
            vendorId: vendorId,
          },
          take: 5, // Limit to 5 products per category
          
        },
      },
    });

    // 2.  Map the result to the desired CategoryWithProducts format
    const categoriesWithProducts: CategoryWithProducts[] = categories.map(category => ({
      category: category, // Include the category itself
    }));


    return categoriesWithProducts;
  } catch (error) {
    console.error(
      'Error fetching categories with products for vendor:',
      error
    );
    throw error; // Re-throw for centralized error handling
  }
};






/**
 * Helper function to get products by category ID, with optional vendor and proximity filtering.
 */
export const getProductsByCategoryId = async (
  categoryId: string,
  page: number,
  take: number,
  vendorId?: string,
  userLatitude?: number,
  userLongitude?: number
): Promise<{ products: ProductWithVendor[]; totalPages?: number; currentPage?: number }> => {
  const where = {
    product: {
      categories: {
        some: {
          id: {
            in: [categoryId],
          },
        },
      },
    },
    ...(vendorId && { vendorId }),
  };

  const products = await prisma.vendorProduct.findMany({
    where,
    skip: (page - 1) * take,
    take: take,
    include: {
      vendor: {
        // Include vendor details
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true,
        },
      },
    },
  });

  let productsWithVendor: any[] = products.map((product) => ({
    product: {
      ...product,
      vendor: null, // Set product.vendor to null
    },
    vendor: {
      id: product.vendor.id,
      name: product.vendor.name,
      latitude: product.vendor.latitude,
      longitude: product.vendor.longitude,
    },
  }));

  // Calculate and sort by proximity
  if (userLatitude && userLongitude) {
    productsWithVendor = productsWithVendor
      .map((item) => {
        const distance = item.vendor.latitude && item.vendor.longitude
          ? getDistance(
            { latitude: userLatitude, longitude: userLongitude },
            { latitude: item.vendor.latitude, longitude: item.vendor.longitude }
          )
          : Infinity; //  stores without coordinates will be last
          delete item.product.vendor
        return {
          ...item.product,
          vendor: {
            name: item.vendor.name,
            distance: distance / 1000,
          },
        };
      })
      .sort((a, b) => a.vendor.distance! - b.vendor.distance!); // Sort by distance
  }

  const totalCount = await prisma.vendorProduct.count({ where });
  return { products: productsWithVendor, totalPages: Math.ceil(totalCount / take), currentPage: page };
};

const getStoresByCategoryOrChildren = async (categoryId: string, userLatitude?: number, userLongitude?: number, vendorId?:string) : Promise<StoreWithDistance[]> =>{
      const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { children: true },
    });

       if (!category) {
      throw new Error('Category not found');
    }
    const categoryIds = [categoryId, ...category.children.map(c => c.id)];

    // 1. Find distinct vendor IDs that have products in the given category or its children.
    const vendorIds = await prisma.vendorProduct.findMany({
      where: {
        categories: {
          some: {
            id: {
              in: categoryIds,
            },
          },
        },
        ...(vendorId ? { vendorId: vendorId } : {}),
      },
      distinct: ['vendorId'],
      select: {
        vendorId: true,
      },
    });

    const uniqueVendorIds = vendorIds.map((v) => v.vendorId);

    // 2. Fetch the vendors
    let vendors = await prisma.vendor.findMany({
      where: {
        id: {
          in: uniqueVendorIds,
        },
      },
    });

    //console.log(vendors, vendorIds, categoryIds, "stores that have product in this cat 222")

    // 3. Calculate distances and sort by proximity if user location is provided
    const storesWithDistance: StoreWithDistance[] = userLatitude && userLongitude
      ? vendors.map((vendor) => ({
        ...vendor,
        distance: vendor.latitude && vendor.longitude
          ? getDistance(
            { latitude: userLatitude, longitude: userLongitude },
            { latitude: vendor.latitude || 0, longitude: vendor.longitude || 0 }
          ) / 1000
          : Infinity,
      })).sort((a, b) => a.distance! - b.distance!) // Sort by distance
      : vendors;

    return storesWithDistance;
}


/**
 * Retrieves category details, its children with products (if any),
 * products directly under the category (if no children), and stores
 * that have products in the category or its children, sorted by proximity.
 */

export interface CategoryDetailsWithRelatedData{
  categoryId: string,
  vendorId?: string,
  userLatitude?: number,
  userLongitude?: number,
  page?: number,
  take?: number,
}


export const getCategoryDetailsWithRelatedData = async ({
  categoryId,
  vendorId,
  userLatitude,
  userLongitude,
  page = 1,
  take = 10,
}: CategoryDetailsWithRelatedData): Promise<{
  category: Category;
  children?: CategoryWithProducts[];
  products?: {
    products: ProductWithVendor[];
    totalPages: number;
    currentPage: number;
  };
  stores: StoreWithDistance[];
}> => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { children: true },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    let children: CategoryWithProducts[] | undefined;
    let products: { products: ProductWithVendor[]; totalPages: number; currentPage: number } | undefined;
    let stores: StoreWithDistance[] = [];

    if (category.children.length > 0) {
      // Fetch subcategories and products for each child
      children = await Promise.all(
        category.children.map(async (child): Promise<CategoryWithProducts> => {
          const childProducts = await getProductsByCategoryId(child.id, 1, 5, vendorId, userLatitude, userLongitude); //limit 5
          return {
            category: child,
            products: childProducts.products,
          };
        })
      );
      stores = await getStoresByCategoryOrChildren(categoryId, userLatitude, userLongitude, vendorId);

    } else {
      // Fetch products directly under the category
      const productResult = await getProductsByCategoryId(categoryId, page, take, vendorId, userLatitude, userLongitude);
      products = {
        products: productResult.products,
        totalPages: productResult.totalPages || 0,
        currentPage: productResult.currentPage || 0,
      };
      stores = await getStoresByCategoryOrChildren(categoryId, userLatitude, userLongitude, vendorId);
    }

    return { category: {id: category.id, name: category.name, description: category.description, parentId: category.parentId }, children, products, stores };
  } catch (error) {
    console.error('Error in getCategoryDetailsWithRelatedData:', error);
    throw error;
  }
};





interface StoreWithProducts {
  vendor: Vendor & { distance?: number }; // Embed distance in Vendor
  products: VendorProduct[];
}

export const getStoresByProductId = async (
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
        return { ...store, products: sortedProducts };
    });

    return { stores: sortedStores };
  } catch (error) {
    console.error('Error in getStoresByProductId:', error);
    throw error;
  }
};




