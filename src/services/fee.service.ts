import { PrismaClient, Fee, FeeType } from '@prisma/client';

const prisma = new PrismaClient();

// --- Interfaces for Payloads ---

export interface CreateFeePayload {
  type: FeeType;
  amount: number;
  isActive?: boolean; // Optional, defaults to false
}

export interface UpdateFeePayload {
  amount?: number;
  isActive?: boolean;
}

// --- Fee Service Functions ---

/**
 * Creates a new fee record. If 'isActive' is true, it deactivates any existing
 * active fee of the same type to ensure only one active fee per type.
 *
 * @param payload The data for the new fee.
 * @returns The newly created Fee object.
 * @throws Error if creation fails or if a unique constraint is violated unexpectedly.
 */
export const createFee = async (payload: CreateFeePayload): Promise<Fee> => {
  return prisma.$transaction(async (tx) => {
    if (payload.isActive) {
      // Deactivate any currently active fee of the same type
      await tx.fee.updateMany({
        where: {
          type: payload.type,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
    }

    // Create the new fee
    const newFee = await tx.fee.create({
      data: {
        type: payload.type,
        amount: payload.amount,
        isActive: payload.isActive ?? false, // Ensure isActive is set, default to false
      },
    });
    return newFee;
  });
};

/**
 * Updates an existing fee record. If 'isActive' is set to true, it deactivates
 * any other currently active fee of the same type.
 *
 * @param id The ID of the fee to update.
 * @param payload The data to update the fee with.
 * @returns The updated Fee object.
 * @throws Error if the fee is not found or update fails.
 */
export const updateFee = async (id: string, payload: UpdateFeePayload): Promise<Fee> => {
  return prisma.$transaction(async (tx) => {
    // Check if the fee exists
    const existingFee = await tx.fee.findUnique({ where: { id } });
    if (!existingFee) {
      throw new Error('Fee not found');
    }

    // If isActive is being set to true, deactivate other fees of the same type
    if (payload.isActive === true) {
      await tx.fee.updateMany({
        where: {
          type: existingFee.type,
          isActive: true,
          id: { not: id }, // Exclude the current fee from deactivation
        },
        data: {
          isActive: false,
        },
      });
    }

    // Update the fee
    const updatedFee = await tx.fee.update({
      where: { id },
      data: payload,
    });
    return updatedFee;
  });
};

/**
 * Deletes a fee record by its ID.
 *
 * @param id The ID of the fee to delete.
 * @returns The deleted Fee object.
 * @throws Error if the fee is not found or deletion fails.
 */
export const deleteFee = async (id: string): Promise<Fee> => {
  try {
    const deletedFee = await prisma.fee.delete({
      where: { id },
    });
    return deletedFee;
  } catch (error: any) {
    if (error.code === 'P2025') { // Prisma error code for record not found
      throw new Error('Fee not found');
    }
    console.error('Error deleting fee:', error);
    throw new Error('Failed to delete fee: ' + error.message);
  }
};

/**
 * Deactivates the currently active fee for a specific type.
 *
 * @param type The FeeType to deactivate.
 * @returns The deactivated Fee object, or null if no active fee was found.
 * @throws Error if deactivation fails.
 */
export const deactivateFee = async (type: FeeType): Promise<Fee | null> => {
  try {
    const activeFee = await prisma.fee.findFirst({
      where: {
        type: type,
        isActive: true,
      },
    });

    if (activeFee) {
      const deactivatedFee = await prisma.fee.update({
        where: { id: activeFee.id },
        data: { isActive: false },
      });
      return deactivatedFee;
    }
    return null; // No active fee found for this type
  } catch (error: any) {
    console.error(`Error deactivating fee of type ${type}:`, error);
    throw new Error(`Failed to deactivate fee of type ${type}: ${error.message}`);
  }
};

/**
 * Retrieves the currently active fee(s).
 *
 * @param type Optional. If provided, retrieves the active fee for that specific type.
 * If not provided, retrieves all currently active fees.
 * @returns A single Fee object if type is provided, or an array of Fee objects.
 * Returns null or an empty array if no active fees are found.
 */
export const getCurrentFees = async (type?: FeeType): Promise<Fee | Fee[] | null> => {
  try {
    if (type) {
      // Retrieve a single active fee by type
      const fee = await prisma.fee.findFirst({
        where: {
          type: type,
          isActive: true,
        },
      });
      return fee;
    } else {
      // Retrieve all active fees
      const fees = await prisma.fee.findMany({
        where: {
          isActive: true,
        },
      });
      return fees;
    }
  } catch (error: any) {
    console.error('Error getting current fees:', error);
    throw new Error('Failed to retrieve current fees: ' + error.message);
  }
};