// services/auth.service.ts
import { PrismaClient, User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { generateToken } from '../utils/auth'; //create this file.

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface CheckUserFilters {
  mobileNumber: string;
}


export const checkUser = async (filters: CheckUserFilters) => {
  return prisma.user.findUnique({
    where: {
      mobileNumber: filters.mobileNumber,
    },
  });
};

export const verifyRegistrationCode = async (mobileNumber: string, verificationCode: string): Promise<User | null> => {
  const storedVerification = await prisma.verification.findUnique({
    where: { mobileNumber },
  });

  if (!storedVerification || storedVerification.code !== verificationCode || storedVerification.expiresAt < new Date()) {
    return null; // Invalid or expired code
  }

  // Mark the user as mobileVerified
  const updatedUser = await prisma.user.update({
    where: { mobileNumber },
    data: { mobileVerified: true },
  });

  // Delete the verification code after successful verification
  await prisma.verification.delete({
    where: { mobileNumber },
  });

  return updatedUser;
};

export const storeVerificationCode = async (mobileNumber: string, verificationCode: string) => {
  // Store verification code and timestamp in a temporary database or cache
  await prisma.verification.upsert({
    where: { mobileNumber: mobileNumber },
    update: { code: verificationCode, expiresAt: new Date(Date.now() + 5 * 60 * 1000) }, // 5 minutes expiration
    create: { mobileNumber: mobileNumber, code: verificationCode, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
  });
};

export const verifyCodeAndLogin = async (mobileNumber: string, verificationCode: string) => {
  const storedVerification = await prisma.verification.findUnique({
    where: { mobileNumber },
  });

  if (!storedVerification || storedVerification.code !== verificationCode || storedVerification.expiresAt < new Date()) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { mobileNumber },
  });

  if (!user) {
    return null;
  }

  const token = generateToken(user.id, user.role);

  await prisma.verification.delete({
    where: { mobileNumber },
  });

  return { token, user };
};