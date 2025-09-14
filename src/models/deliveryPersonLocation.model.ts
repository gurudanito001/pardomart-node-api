// src/models/deliveryPersonLocation.model.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createLocation = async (orderId: string, latitude: number, longitude: number) => {
  return prisma.deliveryPersonLocation.create({
    data: {
      orderId,
      latitude,
      longitude,
    },
  });
};

export const getPathByOrderId = async (orderId: string) => {
  return prisma.deliveryPersonLocation.findMany({
    where: {
      orderId,
    },
    orderBy: {
      createdAt: 'asc',
    },
    select: {
      latitude: true,
      longitude: true,
      createdAt: true,
    },
  });
};

