import { PrismaClient, Support } from '@prisma/client'; // Assuming you're using @prisma/client

const prisma = new PrismaClient();

interface CreateSupportPayload {
  name: string;
  email: string;
  message: string;
}

export const createSupport = async (payload: CreateSupportPayload): Promise<Support> => {
  return prisma.support.create({
    data: {
      name: payload.name,
      email: payload.email,
      message: payload.message,
    },
  });
};
