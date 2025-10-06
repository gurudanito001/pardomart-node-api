// services/customer.service.ts
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

const sanitizeUser = (user: User): Omit<User, 'rememberToken'> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { rememberToken, ...sanitized } = user;
  return sanitized;
};

/**
 * Lists all customers for a specific vendor or all vendors owned by a user.
 * A customer is defined as a user who has placed at least one order with the vendor.
 *
 * @param ownerId - The ID of the vendor owner making the request.
 * @param vendorId - Optional. The ID of a specific store to filter customers for.
 * @returns A list of unique customer users.
 */
export const listCustomersForVendorService = async (ownerId: string, vendorId?: string): Promise<Omit<User, 'rememberToken'>[]> => {
  // 1. Authorization: Ensure the ownerId owns the vendorId if it's provided.
  if (vendorId) {
    const vendor = await prisma.vendor.findFirst({
      where: { id: vendorId, userId: ownerId },
    });

    if (!vendor) {
      throw new Error('Unauthorized: You do not own this vendor.');
    }
  }

  // 2. Build the query to find orders based on vendor ownership.
  const whereClause: any = {};
  if (vendorId) {
    whereClause.vendorId = vendorId;
  } else {
    // If no vendorId, get customers from all vendors owned by the ownerId
    whereClause.vendor = {
      userId: ownerId,
    };
  }

  // 3. Find all unique user IDs from orders matching the criteria.
  const customerIds = (await prisma.order.findMany({
    where: whereClause,
    select: { userId: true },
    distinct: ['userId'],
  })).map(order => order.userId);

  if (customerIds.length === 0) return [];

  // 4. Fetch and return the full user details for those customer IDs.
  const customers = await prisma.user.findMany({ where: { id: { in: customerIds } } });
  return customers.map(sanitizeUser);
};