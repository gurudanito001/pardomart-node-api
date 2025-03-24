import { PrismaClient, User, Vendor, Category, Support, Setting } from '@prisma/client'; // Assuming you're using @prisma/client

const prisma = new PrismaClient();


export const getVendorByToken = async (userId: string): Promise<Vendor | null> => {
  return prisma.vendor.findFirst({
    where: {
      userId: userId
    },
    include: {
      categories: true,
      user: true,
    }
  });
};

interface UpdateVendorPayload {
  id: string;
  name?: string;
  tagline?: string;
  details?: string;
  minimumOrder?: number;
  deliveryFee?: number;
  area?: string;
  address?: string;
  longitude?: number;
  latitude?: number;
  categories?: string[]; // Assuming category IDs are strings
  mediaurls?: any; // Adjust type as needed
  meta?: any; // Adjust type as needed
}

export const updateVendor = async (payload: UpdateVendorPayload): Promise<Vendor> => {
    const categoryIds = payload.categories ? payload.categories.map((id) => ({ id })) : [];

  return prisma.vendor.update({
    where: {
      id: payload.id,
    },
    data: {
      name: payload.name,
      tagline: payload.tagline,
      details: payload.details,
      minimumOrder: payload.minimumOrder,
      deliveryFee: payload.deliveryFee,
      area: payload.area,
      address: payload.address,
      longitude: payload.longitude,
      latitude: payload.latitude,
      categories: {
        set: categoryIds.length > 0 ? categoryIds : undefined,
      },
      mediaurls: payload.mediaurls,
      meta: payload.meta,
    },
    include: {
      categories: true,
    },
  });
};
