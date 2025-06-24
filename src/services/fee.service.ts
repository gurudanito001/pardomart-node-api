import { PrismaClient, Fee, FeeType, FeeCalculationMethod } from '@prisma/client';
import { getDistance } from 'geolib';

const prisma = new PrismaClient();

// --- Interfaces for Payloads ---

export interface CreateFeePayload {
  type: FeeType;
  amount: number;
  method: FeeCalculationMethod;
  unit?: string;                 // Optional, used with PER_UNIT or PER_DISTANCE
  minThreshold?: number;         // Optional
  maxThreshold?: number;         // Optional
  thresholdAppliesTo?: string;   // Optional, e.g., "order_subtotal", "total_item_count", "distance_km"
  isActive: boolean;
}

export interface UpdateFeePayload {
  amount?: number;
  method?: FeeCalculationMethod;
  unit?: string;                 // Optional, used with PER_UNIT or PER_DISTANCE
  minThreshold?: number;         // Optional
  maxThreshold?: number;         // Optional
  thresholdAppliesTo?: string; 
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
    // If the new fee is intended to be active, first deactivate any other active fees of the same type.
    if (payload.isActive) {
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

    // Create the new fee with all provided payload data.
    const newFee = await tx.fee.create({
      data: {
        type: payload.type,
        amount: payload.amount,
        method: payload.method,
        unit: payload.unit,
        minThreshold: payload.minThreshold,
        maxThreshold: payload.maxThreshold,
        thresholdAppliesTo: payload.thresholdAppliesTo,
        isActive: payload.isActive ?? false, // Ensure isActive is explicitly set, defaulting to false if not provided
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












// Interface for the input order item
interface OrderItemInput {
  vendorProductId: string;
  quantity: number;
}

// Interface for the input payload to the service
interface CalculateFeesPayload {
  orderItems: OrderItemInput[];
  vendorId: string;
  deliveryAddressId: string;
}

// Interface for the returned fees calculation
interface FeeCalculationResult {
  subtotal: number;
  shoppingFee: number;
  deliveryFee: number;
  serviceFee: number;
  totalEstimatedCost: number;
}

/**
 * Converts degrees to radians for geographical calculations.
 * @param degrees Angle in degrees.
 * @returns Angle in radians.
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculates the distance between two geographical coordinates using the Haversine formula.
 * @param lat1 Latitude of the first point.
 * @param lon1 Longitude of the first point.
 * @param lat2 Latitude of the second point.
 * @param lon2 Longitude of the second point.
 * @param unit The unit of distance: 'km' for kilometers, 'miles' for miles, defaults to 'km'.
 * @returns The distance between the two points in the specified unit.
 */

/**
 * Service function to calculate all applicable fees for a given order request.
 *
 * @param payload - Contains order items, vendor ID, and delivery address ID.
 * @returns A promise that resolves to an object containing calculated fees.
 * @throws Error if data is invalid, not found, or calculations fail.
 */
export const calculateOrderFeesService = async (
  payload: CalculateFeesPayload
): Promise<FeeCalculationResult> => {
  try {
    const { orderItems, vendorId, deliveryAddressId } = payload;

    // --- 1. Input Validation ---
    if (!orderItems || orderItems.length === 0) {
      throw new Error('Order items cannot be empty.');
    }
    if (!vendorId) {
      throw new Error('Vendor ID is required.');
    }
    if (!deliveryAddressId) {
      throw new Error('Delivery address ID is required.');
    }

    // --- 2. Fetch Necessary Data ---
    // Fetch vendor details
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { latitude: true, longitude: true },
    });
    if (!vendor || vendor.latitude === null || vendor.longitude === null) {
      throw new Error('Vendor location not found or invalid.');
    }

    // Fetch delivery address details
    const deliveryAddress = await prisma.deliveryAddress.findUnique({
      where: { id: deliveryAddressId },
      select: { latitude: true, longitude: true },
    });
    if (!deliveryAddress || deliveryAddress.latitude === null || deliveryAddress.longitude === null) {
      throw new Error('Delivery address location not found or invalid.');
    }

    // Get all unique vendor product IDs from the order items
    const uniqueVendorProductIds = orderItems.map((item) => item.vendorProductId);

    // Fetch all vendor products in a single query for efficiency
    const vendorProducts = await prisma.vendorProduct.findMany({
      where: {
        id: {
          in: uniqueVendorProductIds,
        },
      },
      select: {
        id: true,
        price: true,
      },
    });

    // Create a map for quick price lookup
    const productPriceMap = new Map<string, number>();
    vendorProducts.forEach((vp) => productPriceMap.set(vp.id, vp.price));

    // Fetch active fee configurations
    const activeFees = await prisma.fee.findMany({
      where: {
        isActive: true,
        type: {
            in: [FeeType.shopping, FeeType.delivery, FeeType.service] // Using lowercase enum values
        }
      },
    });

    const feeConfigMap = new Map<FeeType, Fee>();
    activeFees.forEach((fee) => feeConfigMap.set(fee.type, fee));

    // --- 3. Calculate Subtotal & Total Item Count ---
    let subtotal = 0;
    let totalItemCount = 0;

    for (const item of orderItems) {
      const productPrice = productPriceMap.get(item.vendorProductId);
      if (productPrice === undefined) {
        throw new Error(`Price not found for vendor product ID: ${item.vendorProductId}`);
      }
      subtotal += productPrice * item.quantity;
      totalItemCount += item.quantity;
    }

    // --- 4. Calculate Fees ---
    let shoppingFee = 0;
    let deliveryFee = 0;
    let serviceFee = 0;

    // Shopping Fee (based on number of items)
    const shoppingFeeConfig = feeConfigMap.get(FeeType.shopping);
    if (shoppingFeeConfig && shoppingFeeConfig.method === FeeCalculationMethod.per_unit) {
      shoppingFee = totalItemCount * shoppingFeeConfig.amount;
    }

    // Delivery Fee (based on distance)
    const deliveryFeeConfig = feeConfigMap.get(FeeType.delivery);
    if (deliveryFeeConfig && deliveryFeeConfig.method === FeeCalculationMethod.per_distance) {
      // Calculate distance in meters using geolib's getDistance
      const distanceMeters = getDistance(
        { latitude: vendor.latitude!, longitude: vendor.longitude! },
        { latitude: deliveryAddress.latitude!, longitude: deliveryAddress.longitude! }
      );

      let distanceInConfigUnit: number;
      if (deliveryFeeConfig.unit === 'km') {
        distanceInConfigUnit = distanceMeters / 1000; // Convert meters to kilometers
      } else if (deliveryFeeConfig.unit === 'miles') {
        distanceInConfigUnit = distanceMeters / 1609.34; // Convert meters to miles
      } else {
        // Fallback or error if unit is not recognized; defaulting to km
        console.warn(`Unknown unit for delivery fee: ${deliveryFeeConfig.unit}. Defaulting to kilometers.`);
        distanceInConfigUnit = distanceMeters / 1000;
      }

      deliveryFee = distanceInConfigUnit * deliveryFeeConfig.amount;

      // Apply minThreshold if set
      if (deliveryFeeConfig.minThreshold !== null && deliveryFee < deliveryFeeConfig.minThreshold) {
        deliveryFee = deliveryFeeConfig.minThreshold;
      }
    }


    // Service Fee (based on total cost of items purchased - subtotal)
    const serviceFeeConfig = feeConfigMap.get(FeeType.service);
    if (serviceFeeConfig && serviceFeeConfig.method === FeeCalculationMethod.percentage) {
      // Check if subtotal meets the minThreshold for service fee
      if (serviceFeeConfig.minThreshold === null || subtotal >= serviceFeeConfig.minThreshold) {
        serviceFee = subtotal * serviceFeeConfig.amount;
      }
    } else if (serviceFeeConfig && serviceFeeConfig.method === FeeCalculationMethod.flat) {
       if (serviceFeeConfig.minThreshold === null || subtotal >= serviceFeeConfig.minThreshold) {
        serviceFee = serviceFeeConfig.amount;
      }
    }

    // Round fees to two decimal places
    shoppingFee = parseFloat(shoppingFee.toFixed(2));
    deliveryFee = parseFloat(deliveryFee.toFixed(2));
    serviceFee = parseFloat(serviceFee.toFixed(2));


    // --- 5. Total Estimated Cost ---
    const totalEstimatedCost = subtotal + shoppingFee + deliveryFee + serviceFee;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      shoppingFee,
      deliveryFee,
      serviceFee,
      totalEstimatedCost: parseFloat(totalEstimatedCost.toFixed(2)),
    };
  } catch (error: any) {
    console.error('Error calculating order fees:', error);
    throw new Error(`Failed to calculate fees: ${error.message}`);
  }
};
