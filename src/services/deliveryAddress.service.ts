import * as deliveryAddressModel from '../models/deliveryAddress.model'; // Adjust this path as needed
import { DeliveryAddress, Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();



// --- DeliveryAddress Service Functions ---

/**
 * Creates a new delivery address for a user.
 * @param payload The data for the new delivery address.
 * @returns The newly created DeliveryAddress object.
 */
export const createDeliveryAddressService = async (
  payload: deliveryAddressModel.CreateDeliveryAddressPayload,
  tx?: Prisma.TransactionClient
): Promise<DeliveryAddress> => {
  const createAddressInTx = async (prismaClient: Prisma.TransactionClient | PrismaClient) => {
    if (payload.isDefault) {
      // Deactivate any other default address for this user
      await prismaClient.deliveryAddress.updateMany({
        where: {
          userId: payload.userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }
    // The model function now simply creates the record
    return deliveryAddressModel.createDeliveryAddress({ ...payload, isDefault: payload.isDefault ?? false }, prismaClient as Prisma.TransactionClient);
  };

  if (tx) {
    return createAddressInTx(tx);
  } else {
    return prisma.$transaction(createAddressInTx);
  }
};

/**
 * Retrieves a delivery address by its ID.
 * @param id The ID of the delivery address.
 * @returns The DeliveryAddress object or null if not found.
 */
export const getDeliveryAddressByIdService = async (id: string): Promise<DeliveryAddress | null> => {
  return deliveryAddressModel.getDeliveryAddressById(id);
};

/**
 * Retrieves all delivery addresses for a specific user.
 * @param userId The ID of the user.
 * @returns An array of DeliveryAddress objects.
 */
export const getDeliveryAddressesByUserIdService = async (userId: string): Promise<DeliveryAddress[]> => {
  return deliveryAddressModel.getDeliveryAddressesByUserId(userId);
};

/**
 * Retrieves the default delivery address for a specific user.
 * @param userId The ID of the user.
 * @returns The default DeliveryAddress object or null if not found.
 */
export const getDefaultDeliveryAddressByUserIdService = async (userId: string): Promise<DeliveryAddress | null> => {
  return deliveryAddressModel.getDefaultDeliveryAddressByUserId(userId);
};

/**
 * Updates an existing delivery address.
 * @param id The ID of the delivery address to update.
 * @param payload The data to update the address with.
 * @returns The updated DeliveryAddress object.
 */
export const updateDeliveryAddressService = async (
  id: string,
  payload: deliveryAddressModel.UpdateDeliveryAddressPayload
): Promise<DeliveryAddress> => {
  return deliveryAddressModel.updateDeliveryAddress(id, payload);
};

/**
 * Deletes a delivery address by its ID.
 * @param id The ID of the delivery address to delete.
 * @returns The deleted DeliveryAddress object.
 */
export const deleteDeliveryAddressService = async (id: string): Promise<DeliveryAddress> => {
  return deliveryAddressModel.deleteDeliveryAddress(id);
};

/**
 * Sets a specific delivery address as the default for a user.
 * @param userId The ID of the user.
 * @param addressId The ID of the address to set as default.
 * @returns The newly defaulted DeliveryAddress object.
 */
export const setDefaultDeliveryAddressService = async (
  userId: string,
  addressId: string
): Promise<DeliveryAddress> => {
  return deliveryAddressModel.setDefaultDeliveryAddress(userId, addressId);
};