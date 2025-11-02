import { PrismaClient, Role, OrderStatus, Prisma, User } from '@prisma/client';
import dayjs from 'dayjs';
import * as deliveryPersonModel from '../models/delivery-person.model';
import * as userModel from '../models/user.model';

const prisma = new PrismaClient();

/**
 * (Admin) Retrieves an overview of delivery person data for the platform.
 * @param days The number of days to look back for new delivery persons. Defaults to 30.
 * @returns An object containing overview data.
 */
export const getDeliveryPersonOverviewService = async (days = 30) => {
  const startDate = dayjs().subtract(days, 'day').toDate();

  const [totalDeliveryPersons, newDeliveryPersons, totalDeliveries] = await prisma.$transaction([
    // 1. Total number of users with the 'delivery_person' role
    prisma.user.count({
      where: { role: Role.delivery_person },
    }),

    // 2. Total new delivery persons in the last X days
    prisma.user.count({
      where: {
        role: Role.delivery_person,
        createdAt: { gte: startDate },
      },
    }),

    // 3. Total number of completed deliveries
    prisma.order.count({
      where: {
        deliveryPersonId: { not: null },
        orderStatus: OrderStatus.delivered,
      },
    }),
  ]);

  // TODO: Implement logic for 'totalReturns' when the definition is clear.
  const totalReturns = 0;

  return {
    totalDeliveryPersons,
    newDeliveryPersons,
    totalDeliveries,
    totalReturns,
  };
};

/**
 * (Admin) Retrieves a paginated list of all delivery persons with advanced filtering.
 * @param filters - The filtering criteria.
 * @param pagination - The pagination options.
 * @returns A paginated list of delivery persons.
 */
export const adminListAllDeliveryPersonsService = async (
  filters: deliveryPersonModel.AdminListDeliveryPersonsFilters,
  pagination: { page: number; take: number }
) => {
  return deliveryPersonModel.adminListAllDeliveryPersons(filters, pagination);
};

/**
 * (Admin) Retrieves detailed information for a single delivery person.
 * @param deliveryPersonId - The ID of the delivery person.
 * @returns A delivery person object with their stats and recent deliveries.
 */
export const adminGetDeliveryPersonDetailsByIdService = async (deliveryPersonId: string) => {
  return deliveryPersonModel.adminGetDeliveryPersonDetailsById(deliveryPersonId);
};

/**
 * (Admin) Retrieves a paginated delivery history for a single delivery person.
 * @param deliveryPersonId - The ID of the delivery person.
 * @param pagination - The pagination options.
 * @returns A paginated list of deliveries.
 */
export const adminGetDeliveryHistoryService = async (
  deliveryPersonId: string,
  pagination: { page: number; take: number }
) => {
  return deliveryPersonModel.adminGetDeliveryHistory(deliveryPersonId, pagination);
};

/**
 * (Admin) Updates a delivery person's profile.
 * This allows an admin to modify details or suspend/deactivate an account.
 * @param deliveryPersonId The ID of the delivery person to update.
 * @param payload The data to update on the user's profile.
 * @returns The updated delivery person user object.
 * @throws Error if the user is not found or is not a delivery person.
 */
export const adminUpdateDeliveryPersonProfileService = async (
  deliveryPersonId: string,
  payload: Prisma.UserUpdateInput
): Promise<User> => {
  // First, verify the user exists and is a delivery person.
  const deliveryPerson = await deliveryPersonModel.adminGetDeliveryPersonDetailsById(deliveryPersonId);
  if (!deliveryPerson) {
    throw new Error('Delivery person not found or user is not a delivery person.');
  }

  return userModel.updateUser(deliveryPersonId, payload);
};
