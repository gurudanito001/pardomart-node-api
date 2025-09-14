// src/models/device.model.ts
import { prisma } from '../config/prisma';
import { Device } from '@prisma/client';

export const upsertDevice = async (userId: string, fcmToken: string, platform: string): Promise<Device> => {
  return prisma.device.upsert({
    where: { fcmToken },
    update: { userId, platform },
    create: { userId, fcmToken, platform },
  });
};

export const getDevicesByUserId = async (userId: string): Promise<Device[]> => {
  return prisma.device.findMany({
    where: { userId },
  });
};

export const removeDeviceByToken = async (fcmToken: string): Promise<Device | null> => {
  try {
    return await prisma.device.delete({
      where: { fcmToken },
    });
  } catch (error) {
    // Prisma throws an error if the record to delete is not found
    console.warn(`Attempted to delete a non-existent device token: ${fcmToken}`);
    return null;
  }
};

