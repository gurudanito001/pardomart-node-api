// src/services/device.service.ts
import * as deviceModel from '../models/device.model';

export const registerDevice = (userId: string, fcmToken: string, platform: string) => {
  // Additional logic can go here, e.g., cleaning up old tokens for the user
  return deviceModel.upsertDevice(userId, fcmToken, platform);
};

export const unregisterDevice = (fcmToken: string) => {
  return deviceModel.removeDeviceByToken(fcmToken);
};

