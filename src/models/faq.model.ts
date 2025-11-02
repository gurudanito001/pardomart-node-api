import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';


export interface FaqFilters {
  question?: string;
  answer?: string;
}

export type CreateFaqPayload = Omit<Prisma.FaqCreateInput, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateFaqPayload = Partial<CreateFaqPayload>;

/**
 * Retrieves all active FAQs, ordered by sortOrder.
 */
export const getAll = (filters: FaqFilters) => {
  const where: Prisma.FaqWhereInput = {
    isActive: true,
  };

  if (filters.question) {
    where.question = { contains: filters.question, mode: 'insensitive' };
  }

  if (filters.answer) {
    where.answer = { contains: filters.answer, mode: 'insensitive' };
  }

  return prisma.faq.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  });
};


/**
 * Retrieves a single FAQ by its ID.
 * @param id The ID of the FAQ to retrieve.
 */
export const getById = (id: string) => {
  return prisma.faq.findUnique({ where: { id } });
};

/**
 * Creates a new FAQ.
 * @param data The data for the new FAQ.
 */
export const create = (data: CreateFaqPayload) => {
  return prisma.faq.create({ data });
};

/**
 * Updates an existing FAQ by its ID.
 * @param id The ID of the FAQ to update.
 * @param data The data to update.
 */
export const update = (id: string, data: UpdateFaqPayload) => {
  return prisma.faq.update({ where: { id }, data });
};

/**
 * Deletes an FAQ by its ID.
 * @param id The ID of the FAQ to delete.
 */
export const remove = (id: string) => {
  return prisma.faq.delete({ where: { id } });
};