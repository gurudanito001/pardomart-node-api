// models/vendor.model.ts
import { PrismaClient, Vendor, Days, User, VendorOpeningHours, Prisma } from '@prisma/client';
import { uploadMedia } from '../services/media.service';


const prisma = new PrismaClient();

export interface CreateVendorPayload {
  userId: string;
  name: string;
  email?: string;
  tagline?: string;
  details?: string;
  image?: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  meta?: any;
}

export interface UpdateVendorPayload {
  name?: string;
  email?: string;
  tagline?: string;
  details?: string;
  image?: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  isVerified?: boolean;
  isPublished?: boolean;
  meta?: any;
}

export const createVendor = async (payload: CreateVendorPayload): Promise<Vendor> => {
  const vendor = await prisma.vendor.create({
    data: {
      ...payload,
      image: payload.image ? 'placeholder' : undefined, // Use a placeholder, will be updated later
    }
  });

  // Generate and create VendorOpeningHours records
  const openingHoursData = Object.values(Days).map((day) => ({
    vendorId: vendor?.id,
    day: day,
    open: '09:00', // Default open time
    close: '18:00', // Default close time
  }));

  await prisma.vendorOpeningHours.createMany({
    data: openingHoursData,
  });

  // If an image is provided, upload it via media.service and update the vendor
  if (payload.image) {
    try {
      // Create a mock Multer file from the base64 string
      const imageBuffer = Buffer.from(payload.image, 'base64');
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: `${vendor.id}-store-image.jpg`,
        encoding: '7bit',
        mimetype: 'image/jpeg', // Assuming jpeg, adjust if you handle other types
        buffer: imageBuffer,
        size: imageBuffer.length,
        stream: new (require('stream').Readable)(), // Dummy stream
        destination: '',
        filename: '',
        path: '',
      };

      const uploadResult = await uploadMedia(mockFile, vendor.id, 'store_image');

      // Update the vendor with the final image URL
      await updateVendor(vendor.id, { image: uploadResult.cloudinaryResult.secure_url });
    } catch (error) {
      console.error('Error uploading vendor image:', error);
      // Decide on error handling: should the vendor creation be rolled back?
      // For now, we'll let the vendor exist without an image.
    }
  }

  // Fetch the created vendor with opening hours included
  const data = await prisma.vendor.findUnique({
    where: {
      id: vendor.id,
    },
    include: {
      openingHours: true,
    },
  });

  return data as Vendor
};


export type VendorWithRelations = Vendor & {
  user: User;
  openingHours: VendorOpeningHours[];
  _count: { vendorProducts: number; };
};
export const getVendorById = async (id: string): Promise<VendorWithRelations | null> => {
  return prisma.vendor.findUnique({
    where: { id },
    include: {
      user: true,
      openingHours: true,
      _count: {
        select: {
          vendorProducts: true,
        },
      },
    },
  });
};


export interface getVendorsFilters {
  name?: string,
  longitude?: string,
  latitude?: string,
  userId?: string;
}

export const getAllVendors = async (filters: getVendorsFilters, pagination: {page: string, take: string}) => {
  const skip = ( (parseInt(pagination.page) ) - 1) * parseInt(pagination.take) 
  const takeVal = parseInt(pagination.take)

  const where: Prisma.VendorWhereInput = {
    // isVerified: true,
  };

  if (filters?.name) {
    where.name = {
      contains: filters.name,
      mode: 'insensitive',
    };
  }
  if (filters?.userId) {
    where.userId = filters.userId;
  }

  /* const include = filters.userId ? {
    carts: {
      where: { userId: filters.userId },
      select: {
        _count: { select: { items: true } }
      }
    }
  } : undefined; */

  const vendors = await prisma.vendor.findMany({
    where,
    //include,
    skip: skip,
    take: takeVal,
    orderBy: {
      createdAt: "desc"
    }
  });

  const totalCount = await prisma.vendor.count({
    where,
  });

  const totalPages = Math.ceil( totalCount / parseInt(pagination.take));
  return {page: parseInt(pagination.page), totalPages, pageSize: takeVal, totalCount, data: vendors}
};


export const getFullListOfVendors = async ()=> {
  return prisma.vendor.findMany({
    where: {
      // isVerified: true
    }
  });
};


export const getVendorsByUserId = async (userId: string): Promise<Vendor[]> => {
  return prisma.vendor.findMany({
    where: { userId, /* isVerified: true */ },
  });
};

export const updateVendor = async (id: string, payload: UpdateVendorPayload): Promise<Vendor> => {
  // If a new base64 image is provided, upload it and update the payload.
  if (payload.image && !payload.image.startsWith('http')) {
    try {
      const imageBuffer = Buffer.from(payload.image, 'base64');
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: `${id}-store-image.jpg`,
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: imageBuffer,
        size: imageBuffer.length,
        stream: new (require('stream').Readable)(),
        destination: '',
        filename: '',
        path: '',
      };

      const uploadResult = await uploadMedia(mockFile, id, 'store_image');
      payload.image = uploadResult.cloudinaryResult.secure_url; // Update payload with the new URL
    } catch (error) {
      console.error('Error uploading new vendor image during update:', error);
      // Decide on error handling. For now, we'll remove the image from the payload
      // so it doesn't overwrite the existing URL with a base64 string.
      delete payload.image;
    }
  }

  return prisma.vendor.update({
    where: { id },
    data: payload,
  });
};

export const deleteVendor = async (id: string): Promise<Vendor> => {
  return prisma.vendor.delete({
    where: { id }
  });
};

/**
 * Retrieves all vendors for a user and includes a count of their associated products.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to an array of vendors with their product counts.
 */
export const getVendorsByUserIdWithProductCount = (userId: string) => {
  return prisma.vendor.findMany({
    where: {
      userId: userId,
    },
    include: {
      _count: {
        select: { vendorProducts: true },
      },
    },
  });
};

/**
 * Retrieves the count of documents for a given vendor ID.
 * @param vendorId - The ID of the vendor.
 * @returns A promise that resolves to the number of documents.
 */
export const getVendorDocumentCount = (vendorId: string): Promise<number> => {
  return prisma.media.count({
    where: {
      referenceId: vendorId,
      referenceType: 'document',
    },
  });
};

/**
 * Retrieves the count of documents for a given list of vendor IDs.
 * @param vendorIds - An array of vendor IDs.
 * @returns A promise that resolves to an array of objects containing the vendor ID (`referenceId`) and its document count (`_count._all`).
 */
export const getVendorDocumentCounts = (vendorIds: string[]) => {
  return prisma.media.groupBy({
    by: ['referenceId'],
    where: {
      referenceId: { in: vendorIds },
      referenceType: 'document',
    },
    _count: {
      _all: true,
    },
  });
};
