import { PrismaClient, EmailVerification } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateEmailVerificationPayload {
  email: string;
  code: string;
  expiresAt: Date;
  purpose: string;
}

export const createEmailVerification = async (payload: CreateEmailVerificationPayload): Promise<EmailVerification> => {
  return prisma.emailVerification.create({
    data: payload,
  });
};

export const getEmailVerificationByEmailAndPurpose = async (email: string, purpose: string): Promise<EmailVerification | null> => {
  return prisma.emailVerification.findFirst({
    where: { email, purpose },
    orderBy: { createdAt: 'desc' }, // Get the latest one
  });
};

export const deleteEmailVerification = async (email: string, purpose: string): Promise<EmailVerification> => {
  return prisma.emailVerification.delete({
    where: { email }, // Assuming email is unique for a given purpose, or we delete all for that email/purpose
  });
};