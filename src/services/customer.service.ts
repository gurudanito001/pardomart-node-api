// services/customer.service.ts
import { PrismaClient, User, Role } from '@prisma/client';
import * as customerModel from '../models/customer.model';

const prisma = new PrismaClient();

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