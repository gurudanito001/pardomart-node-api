// models/customer.model.ts
import { PrismaClient, User, Prisma, PaymentStatus, Role } from '@prisma/client';

const prisma = new PrismaClient();

export interface ListVendorCustomersFilters {
  ownerId: string;
  vendorId?: string;
}

/**
 * Retrieves a list of unique customers who have made a paid purchase from a vendor's stores.
 * @param filters - The filters to apply, including the vendor owner's user ID and an optional vendor ID.
 * @returns A list of unique customer users.
 */
export const listCustomersForVendor = async (filters: ListVendorCustomersFilters): Promise<User[]> => {
  const where: Prisma.UserWhereInput = {
    role: Role.customer, // Ensure we are only fetching customers
    orders: {
      some: {
        paymentStatus: PaymentStatus.paid,
        vendor: {
          userId: filters.ownerId,
        },
      },
    },
  };

  // If a specific vendorId is provided, add it to the filter
  if (filters.vendorId && where.orders?.some) {
    where.orders.some.vendorId = filters.vendorId;
  }

  return prisma.user.findMany({
    where,
  });
};