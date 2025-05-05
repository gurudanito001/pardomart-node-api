// models/tag.model.ts
import { PrismaClient, Tag } from '@prisma/client';

const prisma = new PrismaClient();

export const createTag = async (name: string): Promise<Tag> => {
  return prisma.tag.create({
    data: { name },
  });
};

export const createTagsBulk = async (names: string[]): Promise<Tag[]> => {
  return prisma.tag.createMany({
    data: names.map((name) => ({ name })),
    skipDuplicates: true, // Skip tags that already exist
  }).then(() => prisma.tag.findMany({ where: { name: { in: names } } }));
};

export const getTagById = async (id: string): Promise<Tag | null> => {
  return prisma.tag.findUnique({
    where: { id },
  });
};


export interface TagFilters {
  name?: string
}
export const getAllTags = async (filters: TagFilters): Promise<Tag[]> => {
  return prisma.tag.findMany({
    where: {
      ...filters?.name && {
        name: {
          contains: filters?.name, // Case-insensitive search
          mode: 'insensitive',
        }
      },
    }
  });
};

export const updateTag = async (id: string, name: string): Promise<Tag> => {
  return prisma.tag.update({
    where: { id },
    data: { name },
  });
};

export const deleteTag = async (id: string): Promise<Tag> => {
  return prisma.tag.delete({
    where: { id },
  });
};