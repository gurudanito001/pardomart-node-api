import { PrismaClient, DeliveryAddress, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// --- Interfaces for Payloads ---

export interface CreateDeliveryAddressPayload {
  userId: string;
  label?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface UpdateDeliveryAddressPayload {
  label?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

// --- DeliveryAddress Model Functions ---

/**
 * Creates a new delivery address for a user.
 *
 * @param payload The data for the new delivery address.
 * @param tx Optional Prisma transaction client.
 */
export const createDeliveryAddress = async (
  payload: CreateDeliveryAddressPayload,
  tx?: Prisma.TransactionClient
): Promise<DeliveryAddress> => {
  const prismaClient = tx || prisma;
  return prismaClient.deliveryAddress.create({ data: payload });
};

/**
 * Retrieves a delivery address by its ID.
 *
 * @param id The ID of the delivery address.
 * @returns The DeliveryAddress object or null if not found.
 */
export const getDeliveryAddressById = async (id: string): Promise<DeliveryAddress | null> => {
  return prisma.deliveryAddress.findUnique({
    where: { id },
  });
};

/**
 * Retrieves all delivery addresses for a specific user.
 *
 * @param userId The ID of the user.
 * @returns An array of DeliveryAddress objects.
 */
export const getDeliveryAddressesByUserId = async (userId: string): Promise<DeliveryAddress[]> => {
  return prisma.deliveryAddress.findMany({
    where: { userId },
    orderBy: {
      isDefault: 'desc', // Show default address first
    },
  });
};

/**
 * Retrieves the default delivery address for a specific user.
 *
 * @param userId The ID of the user.
 * @returns The default DeliveryAddress object or null if not found.
 */
export const getDefaultDeliveryAddressByUserId = async (userId: string): Promise<DeliveryAddress | null> => {
  return prisma.deliveryAddress.findFirst({
    where: {
      userId: userId,
      isDefault: true,
    },
  });
};


/**
 * Updates an existing delivery address.
 * If 'isDefault' is set to true, it deactivates any other default address for the user.
 *
 * @param id The ID of the delivery address to update.
 * @param payload The data to update the address with.
 * @returns The updated DeliveryAddress object.
 * @throws Error if the address is not found.
 */
export const updateDeliveryAddress = async (
  id: string,
  payload: UpdateDeliveryAddressPayload
): Promise<DeliveryAddress> => {
  return prisma.$transaction(async (tx) => {
    const existingAddress = await tx.deliveryAddress.findUnique({ where: { id } });
    if (!existingAddress) {
      throw new Error('Delivery address not found');
    }

    if (payload.isDefault === true) {
      // Deactivate any other default address for this user
      await tx.deliveryAddress.updateMany({
        where: {
          userId: existingAddress.userId,
          isDefault: true,
          id: { not: id }, // Exclude the current address from deactivation
        },
        data: {
          isDefault: false,
        },
      });
    }

    const updatedAddress = await tx.deliveryAddress.update({
      where: { id },
      data: payload,
    });
    return updatedAddress;
  });
};

/**
 * Deletes a delivery address by its ID.
 *
 * @param id The ID of the delivery address to delete.
 * @returns The deleted DeliveryAddress object.
 * @throws Error if the address is not found.
 */
export const deleteDeliveryAddress = async (id: string): Promise<DeliveryAddress> => {
  try {
    const deletedAddress = await prisma.deliveryAddress.delete({
      where: { id },
    });
    return deletedAddress;
  } catch (error: any) {
    if (error.code === 'P2025') { // Prisma error code for record not found
      throw new Error('Delivery address not found');
    }
    console.error('Error deleting delivery address:', error);
    throw new Error('Failed to delete delivery address: ' + error.message);
  }
};

/**
 * Sets a specific delivery address as the default for a user.
 * This will deactivate any other default address for that user.
 *
 * @param userId The ID of the user.
 * @param addressId The ID of the address to set as default.
 * @returns The newly defaulted DeliveryAddress object.
 * @throws Error if the address is not found or does not belong to the user.
 */
export const setDefaultDeliveryAddress = async (
  userId: string,
  addressId: string
): Promise<DeliveryAddress> => {
  return prisma.$transaction(async (tx) => {
    // 1. Deactivate current default for the user
    await tx.deliveryAddress.updateMany({
      where: {
        userId: userId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    // 2. Set the specified address as default
    const newDefaultAddress = await tx.deliveryAddress.update({
      where: {
        id: addressId,
        userId: userId, // Ensure the address belongs to the user
      },
      data: {
        isDefault: true,
      },
    });
    return newDefaultAddress;
  });
};
