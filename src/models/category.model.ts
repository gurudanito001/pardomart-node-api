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

export const createCategoriesBulk = async (names: string[]): Promise<Category[]> => {
  return prisma.category.createMany({
    data: names.map((name) => ({ name })),
    skipDuplicates: true, // Skip categories that already exist
  }).then(() => prisma.category.findMany({ where: { name: { in: names } } }));
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

export const getAllCategories = async (): Promise<Category[]> => {
  return prisma.category.findMany({
    include: {
      products: true,
    },
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