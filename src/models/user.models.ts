import { PrismaClient, User, Role, Verification } from '@prisma/client'; // Assuming you're using @prisma/client

const prisma = new PrismaClient();


export interface CheckUserFilters {
  mobileNumber: string;
  role: Role
}

export const checkUserExistence = async (filters: CheckUserFilters): Promise<User | null> => {
  return prisma.user.findFirst({
    where: {
      mobileNumber: filters.mobileNumber,
      role: filters.role
    },
  });
};

// User CRUD Functions
export interface GetUserFilters {
  mobileVerified?: boolean;
  active?: boolean;
  role?: Role;
  language?: string;
  // Add other filter fields as needed
}

export const getAllUsers = async (filters: GetUserFilters = {}): Promise<User[]> => {
  return prisma.user.findMany({
    where: {
      ...(filters.mobileVerified !== undefined && { mobileVerified: filters.mobileVerified }), // Assuming mobileVerified maps to verified filter
      ...(filters.active !== undefined && { active: filters.active }),
      ...(filters.role && { role: filters.role }),
      ...(filters.language && { language: filters.language }),
      // Add other filter conditions here
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getAllVerificationCodes = async (): Promise<Verification[]> => {
  return prisma.verification.findMany();
};

export const getUserById = async (userId: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
};

export interface CreateUserPayload {
  name: string;
  email: string;
  mobileNumber: string;
  role: Role;
  mobileVerified?: boolean;
  active?: boolean;
  language?: string;
  notification?: any;
  referralCode?: string;
}

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  return prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      mobileNumber: payload.mobileNumber,
      role: payload.role,
      mobileVerified: payload.mobileVerified,
      active: payload.active,
      language: payload.language,
      notification: payload.notification,
      referralCode: payload.referralCode,
    },
  });
};

export interface UpdateUserPayload {
  id: string;
  name?: string;
  email?: string;
  mobileNumber?: string;
  role?: Role;
  mobileVerified?: boolean;
  active?: boolean;
  language?: string;
  notification?: any;
  referralCode?: string;
}

export const updateUser = async (payload: UpdateUserPayload): Promise<User> => {
  return prisma.user.update({
    where: {
      id: payload.id,
    },
    data: {
      name: payload.name,
      email: payload.email,
      mobileNumber: payload.mobileNumber,
      role: payload.role,
      mobileVerified: payload.mobileVerified,
      active: payload.active,
      language: payload.language,
      notification: payload.notification,
      referralCode: payload.referralCode,
    },
  });
};

export const deleteUser = async (userId: string): Promise<User> => {
  return prisma.user.delete({
    where: {
      id: userId,
    },
  });
};