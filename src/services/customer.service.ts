// services/customer.service.ts
import { PrismaClient, User, Role, Prisma, TransactionType, TransactionStatus } from '@prisma/client';
import * as customerModel from '../models/customer.model';

const prisma = new PrismaClient();

import dayjs from 'dayjs';
export interface ListCustomersOptions {
  ownerId?: string; // ID of the vendor owner
  vendorId?: string; // ID of a specific store
}

/**
 * Retrieves a list of customers for a vendor or a specific store.
 * @param options - The filtering options.
 * @returns A list of unique customer users.
 */
export const listCustomersService = async (options: ListCustomersOptions): Promise<Partial<User>[]> => {
  const { ownerId, vendorId } = options;

  if (!ownerId && !vendorId) {
    throw new Error('Either ownerId or vendorId must be provided.');
  }

  return customerModel.listCustomers(options);
};

/**
 * Retrieves transactions for a specific customer, with role-based authorization.
 * @param requestingUserId - The ID of the user making the request.
 * @param requestingUserRole - The role of the user making the request.
 * @param staffVendorId - The vendor ID from the staff member's token (for store_admin).
 * @param filterByVendorId - An optional store ID to filter by (for vendors).
 * @param customerId - The ID of the customer.
 * @returns A list of transactions.
 */
export const listCustomerTransactionsService = async (
  requestingUserId: string,
  requestingUserRole: Role,
  staffVendorId: string | undefined,
  filterByVendorId: string | undefined,
  customerId: string
) => {
  const modelFilters: customerModel.ListCustomerTransactionsFilters = {
    customerId,
  };

  // 1. Authorize based on role
  switch (requestingUserRole) {
    case Role.vendor:
      modelFilters.ownerId = requestingUserId;
      // If a vendor filters by a specific store, authorize it.
      if (filterByVendorId) {
        const vendor = await prisma.vendor.findFirst({
          where: { id: filterByVendorId, userId: requestingUserId },
        });
        if (!vendor) {
          throw new Error('Forbidden: You do not own this store or store not found.');
        }
        modelFilters.vendorId = filterByVendorId;
      }
      break;

    case Role.store_admin:
      if (!staffVendorId) {
        throw new Error('Forbidden: You are not assigned to a store.');
      }
      // A store admin can ONLY see transactions for their assigned store.
      modelFilters.vendorId = staffVendorId;
      break;

    default:
      throw new Error('Forbidden: You do not have permission to perform this action.');
  }

  // 2. Retrieve transactions using the constructed filters.
  // The model will handle validation of whether the customer has history.
  return customerModel.listCustomerTransactions(modelFilters);
};

/**
 * (Admin) Retrieves an overview of customer data for the platform.
 * @param days The number of days to look back for new customers. Defaults to 7.
 * @returns An object containing total customers, total completed orders, new customers, and total payments.
 */
export const getAdminCustomerOverviewService = async (days = 7) => {
  const startDate = dayjs().subtract(days, 'day').toDate();

  const [totalCustomers, totalCompletedOrders, newCustomers, totalPayments] = await prisma.$transaction([
    // 1. Total number of users with the 'customer' role
    prisma.user.count({
      where: { role: Role.customer },
    }),

    // 2. Total number of completed orders (invoices)
    prisma.order.count({
      where: {
        orderStatus: { in: ['delivered', 'picked_up_by_customer'] },
      },
    }),

    // 3. Total new customers in the last X days
    prisma.user.count({
      where: {
        role: Role.customer,
        createdAt: { gte: startDate },
      },
    }),

    // 4. Total number of payments (Completed ORDER_PAYMENT transactions)
    prisma.transaction.count({
      where: {
        type: TransactionType.ORDER_PAYMENT,
        status: TransactionStatus.COMPLETED,
      },
    }),
  ]);

  return { totalCustomers, totalCompletedOrders, newCustomers, totalPayments };
};

/**
 * (Admin) Retrieves a paginated list of all customers with advanced filtering.
 * @param filters - The filtering criteria.
 * @param pagination - The pagination options.
 * @returns A paginated list of customers.
 */
export const adminListAllCustomersService = async (
  filters: any,
  pagination: { page: number; take: number }
) => {
  const { search, status, createdAtStart, createdAtEnd } = filters;
  const skip = (pagination.page - 1) * pagination.take;

  const where: Prisma.UserWhereInput = {
    role: Role.customer,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { mobileNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status !== undefined) {
    where.active = status;
  }

  if (createdAtStart || createdAtEnd) {
    where.createdAt = {};
    if (createdAtStart) where.createdAt.gte = new Date(createdAtStart);
    if (createdAtEnd) where.createdAt.lte = new Date(createdAtEnd);
  }

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    pagination: {
      total,
      page: pagination.page,
      limit: pagination.take,
      totalPages: Math.ceil(total / pagination.take),
    },
  };
};

/**
 * (Admin) Retrieves detailed information for a single customer.
 * @param customerId The ID of the customer.
 * @returns The customer's details along with order statistics.
 * @throws Error if the customer is not found.
 */
export const adminGetCustomerDetailsService = async (customerId: string) => {
  const customerDetails = await customerModel.adminGetCustomerDetailsById(customerId);

  if (!customerDetails) {
    throw new Error('Customer not found or user is not a customer.');
  }

  return customerDetails;
};

/**
 * (Admin) Updates a customer's profile information.
 * This allows an admin to modify details or suspend/deactivate a customer's account.
 * @param customerId The ID of the customer to update.
 * @param payload The data to update on the customer's profile.
 * @returns The updated customer user object.
 * @throws Error if the user is not found or is not a customer.
 */
export const adminUpdateCustomerProfileService = async (
  customerId: string,
  payload: Prisma.UserUpdateInput
) => {
  const customer = await customerModel.adminGetCustomerDetailsById(customerId);
  if (!customer) {
    throw new Error('Customer not found or user is not a customer.');
  }

  return prisma.user.update({
    where: { id: customerId },
    data: payload,
  });
};

/**
 * (Admin) Retrieves a paginated list of all transactions for a specific customer.
 * @param customerId The ID of the customer.
 * @param pagination The pagination options.
 * @returns A paginated list of transactions.
 * @throws Error if the customer is not found.
 */
export const adminListCustomerTransactionsService = async (
  customerId: string,
  pagination: { page: number; take: number }
) => {
  // First, ensure the user exists and is a customer.
  const customer = await prisma.user.findFirst({
    where: { id: customerId, role: Role.customer },
  });
  if (!customer) {
    throw new Error('Customer not found or user is not a customer.');
  }

  return customerModel.adminListCustomerTransactions(customerId, pagination);
};

/**
 * (Admin) Exports a list of customers to CSV format.
 */
export const exportCustomersService = async (filters: any) => {
  const { search, status, createdAtStart, createdAtEnd } = filters;

  const where: Prisma.UserWhereInput = {
    role: Role.customer,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { mobileNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status !== undefined) where.active = status;

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  const header = ['ID', 'Name', 'Email', 'Mobile Number', 'Active', 'Created At'];
  const rows = users.map((user) => [
    user.id, `"${(user.name || '').replace(/"/g, '""')}"`, user.email, user.mobileNumber, user.active ? 'Yes' : 'No', user.createdAt.toISOString()
  ]);

  return [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
};