// services/auth.service.ts
import { PrismaClient, User, Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { generateToken } from '../utils/auth'; //create this file.
import * as userModel from '../models/user.models';
import { CheckUserFilters } from '../models/user.models';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';


export const checkUserExistence = async (filters: CheckUserFilters): Promise<User | null> => {
  return userModel.checkUserExistence(filters);
};


export const storeVerificationCode = async (mobileNumber: string, verificationCode: string) => {
  // Store verification code and timestamp in a temporary database or cache
  await prisma.verification.upsert({
    where: { mobileNumber: mobileNumber },
    update: { code: verificationCode, expiresAt: new Date(Date.now() + 5 * 60 * 1000) }, // 5 minutes expiration
    create: { mobileNumber: mobileNumber, code: verificationCode, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
  });
};

export const verifyCodeAndLogin = async (mobileNumber: string, verificationCode: string, role: Role) => {
  const storedVerification = await prisma.verification.findUnique({
    where: { mobileNumber },
  });

  if (!storedVerification || storedVerification.code !== verificationCode || storedVerification.expiresAt < new Date()) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { mobileNumber, role },
  });

  if (!user) {
    return null;
  }

  await prisma.user.update({
    where: { mobileNumber, role },
    data: { mobileVerified: true },
  });

  const token = generateToken(user.id, user.role);

  await prisma.verification.delete({
    where: { mobileNumber },
  });

  return { token, user };
};