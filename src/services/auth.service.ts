import { PrismaClient, Role, User } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Finds a user for login initiation. If the role is 'vendor', it searches across
 * 'vendor', 'store_admin', and 'store_shopper' roles.
 * @param mobileNumber The user's mobile number.
 * @param role The role provided at login.
 * @returns The user object if found, otherwise null.
 */
export const findUserForLogin = async (mobileNumber: string, role: Role): Promise<User | null> => {
  let rolesToSearch: Role[] = [role];

  // If the user is trying to log in through the generic "vendor" flow,
  // check all possible vendor-related roles.
  if (role === Role.vendor) {
    rolesToSearch = [Role.vendor, Role.store_admin, Role.store_shopper];
  }

  return prisma.user.findFirst({
    where: {
      mobileNumber,
      role: {
        in: rolesToSearch,
      },
    },
  });
};

/**
 * Stores a verification code for a mobile number.
 * @param mobileNumber The mobile number.
 * @param code The verification code.
 */
export const storeVerificationCode = async (mobileNumber: string, code: string): Promise<void> => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  await prisma.verification.upsert({
    where: { mobileNumber },
    create: { mobileNumber, code, expiresAt, attempts: 0 },
    update: { code, expiresAt, attempts: 0 },
  });
};

/**
 * Verifies the login code and returns the user with a JWT.
 * @param mobileNumber The user's mobile number.
 * @param verificationCode The code to verify.
 * @param role The user's specific role.
 * @returns The user object and a JWT token.
 */
export const verifyCodeAndLogin = async (mobileNumber: string, verificationCode: string, role: Role) => {
  const verification = await prisma.verification.findUnique({
    where: { mobileNumber },
  });

  if (!verification || verification.code !== verificationCode) {
    throw new AuthError('Invalid verification code.');
  }

  if (new Date() > verification.expiresAt) {
    throw new AuthError('Verification code has expired.');
  }

  const user = await prisma.user.findUnique({
    where: { mobileNumber_role: { mobileNumber, role } },
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user) {
    throw new AuthError('User not found for the specified role.');
  }

  // Invalidate the code after successful verification
  await prisma.verification.delete({ where: { mobileNumber } });

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      vendorId: user.vendorId, // Include vendorId in the token for staff roles
    },
    process.env.JWT_SECRET!,
    { expiresIn: '30d' }
  );

  return { user, token };
};

// This function is now replaced by findUserForLogin
export const checkUserExistence = async (params: { mobileNumber: string, role: Role }): Promise<boolean> => {
    const user = await findUserForLogin(params.mobileNumber, params.role);
    return !!user;
};