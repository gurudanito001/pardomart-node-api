// models/payment.model.ts
import { PrismaClient, Payment, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface ListVendorPaymentsFilters {
  vendorOwnerId: string;
  vendorId?: string;
}

/**
 * Retrieves a list of payments for a vendor user, optionally filtered by a specific vendor ID.
 * @param filters - The filters to apply, including the vendor owner's user ID and an optional vendor ID.
 * @returns A list of payments.
 */
export const listPaymentsForVendor = async (filters: ListVendorPaymentsFilters): Promise<Payment[]> => {
  const where: Prisma.PaymentWhereInput = {
    order: {
      vendor: {
        userId: filters.vendorOwnerId,
        ...(filters.vendorId ? { id: filters.vendorId } : {})
      },
    },
  };

  return prisma.payment.findMany({
    where,
    include: {
      order: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};