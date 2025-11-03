// models/category.model.ts
import { PrismaClient, Category } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateCategoryPayload {
  name: string;
}

interface UpdateCategoryPayload {
  id: string;
  name?: string;
}

/**
 * Retrieves an overview of category counts from the database.
 * @returns An object containing the total number of parent and sub-categories.
 */
export const getCategoryOverview = async () => {
  const [totalParentCategories, totalSubCategories] = await prisma.$transaction([
    prisma.category.count({
      where: { parentId: null },
    }),
    prisma.category.count({
      where: { parentId: { not: null } },
    }),
  ]);

  return {
    totalParentCategories,
    totalSubCategories,
  };
};

/**
 * Retrieves all parent categories (those with no parentId).
 * @returns A list of top-level categories.
 */
export const getAllParentCategories = async (): Promise<Category[]> => {
  return prisma.category.findMany({
    where: {
      parentId: null,
    },
    orderBy: { name: 'asc' },
  });
};

/**
 * Retrieves all sub-categories (those with a parentId).
 * @returns A list of all child categories.
 */
export const getAllSubCategories = async (): Promise<Category[]> => {
  return prisma.category.findMany({
    where: {
      parentId: {
        not: null,
      },
    },
    orderBy: { name: 'asc' },
  });
};
export const createCategoriesBulk = async (categories: { name: string; description?: string, parentId?: string, imageUrl: string  }[]): Promise<Category[]> => {
  const categoryData = categories.map((cat) => ({
    name: cat.name, // Use 'category' from the input
    description: cat.description,
    parentId: cat.parentId,
    imageUrl: cat.imageUrl,
  }));

  await prisma.category.createMany({
    data: categoryData,
    skipDuplicates: true,
  });

  // Fetch all categories created
    const createdCategories = await prisma.category.findMany({
        where: {
            name: {
                in: categories.map(c => c.name)
            }
        }
    })
  return createdCategories;
};

export const createCategory = async (payload: CreateCategoryPayload): Promise<Category> => {
  return prisma.category.create({
    data: payload,
  });
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
  return prisma.category.findUnique({
    where: { id },
    include: {
      products: true,
    },
  });
};

export interface CategoryFilters {
  parentId?: string
  type?: "top" | "sub"
  name?: string
  vendorId?: string
}
export const getAllCategories = async (filters: CategoryFilters): Promise<Category[]> => {
  return prisma.category.findMany({
    where: {
      ...(filters?.parentId && {parentId: filters?.parentId}),
      ...((filters?.type === "top" && !filters?.parentId) && {parentId: null}),
      ...((filters?.type === "sub" && !filters?.parentId) && {parentId: {not: null}}),
      ...filters?.name && {
        name: {
          contains: filters?.name, // Case-insensitive search
          mode: 'insensitive',
        }
      },
      ...(filters?.vendorId && {
        vendorProducts: {
          some: {
            vendorId: filters.vendorId,
          },
        },
      }),
    }
  });
};

export const updateCategory = async (payload: UpdateCategoryPayload): Promise<Category> => {
  return prisma.category.update({
    where: { id: payload.id },
    data: payload,
    include: {
      products: true,
    },
  });
};

export const deleteCategory = async (id: string): Promise<Category> => {
  return prisma.category.delete({
    where: { id },
  });
};