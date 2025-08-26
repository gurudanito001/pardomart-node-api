import { PrismaClient, Role, User } from '@prisma/client';
import { generateToken } from '../utils/auth';
import * as userModel from '../models/user.model';

const prisma = new PrismaClient();

// Custom Error for auth flow to allow for specific error handling
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export const checkUserExistence = async (filters: userModel.CheckUserFilters): Promise<User | null> => {
  return userModel.checkUserExistence(filters);
};

/**
 * Stores or updates a verification code for a given mobile number.
 * @param mobileNumber The user's mobile number.
 * @param verificationCode The code to store.
 */
export const storeVerificationCode = async (mobileNumber: string, verificationCode: string): Promise<void> => {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
  await prisma.verification.upsert({
    where: { mobileNumber },
    update: { code: verificationCode, expiresAt, attempts: 0 }, // Reset attempts on new code
    create: { mobileNumber, code: verificationCode, expiresAt },
  });
};

/**
 * Verifies a mobile number with a code and returns a JWT if successful.
 * @param mobileNumber The user's mobile number.
 * @param verificationCode The code provided by the user.
 * @param role The user's role.
 * @returns An object with the token and user, or throws an AuthError.
 */
export const verifyCodeAndLogin = async (mobileNumber: string, verificationCode: string, role: Role) => {
  const storedVerification = await prisma.verification.findUnique({
    where: { mobileNumber },
  });

  if (!storedVerification) {
    throw new AuthError('No verification code found for this number. Please request a new one.');
  }

  if (storedVerification.expiresAt < new Date()) {
    await prisma.verification.delete({ where: { mobileNumber } });
    throw new AuthError('Verification code has expired.');
  }

  if (storedVerification?.attempts && storedVerification.attempts >= 5) {
    throw new AuthError('Too many incorrect attempts. Please request a new code.');
  }

  if (storedVerification.code !== verificationCode) {
    await prisma.verification.update({
      where: { mobileNumber },
      data: { attempts: { increment: 1 } },
    });
    throw new AuthError('Invalid verification code.');
  }

  // Use a transaction to ensure logging in and cleaning up the code are atomic
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findFirst({ where: { mobileNumber, role } });

    if (!user) throw new AuthError('User not found.');

    const updatedUser = await tx.user.update({ where: { id: user.id }, data: { mobileVerified: true } });
    const token = generateToken(user.id, user.role);
    await tx.verification.delete({ where: { mobileNumber } });

    return { token, user: updatedUser };
  });
};