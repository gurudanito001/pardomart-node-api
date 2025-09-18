import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateBugReportPayload {
  userId: string;
  description: string;
  imageUrl?: string;
}

export const createBugReportService = async (payload: CreateBugReportPayload) => {
  const { userId, description, imageUrl } = payload;

  const bugReport = await prisma.bugReport.create({
    data: {
      userId,
      description,
      imageUrl,
    },
  });

  return bugReport;
};

export const updateBugReportStatusService = async (bugReportId: string, isResolved: boolean) => {
  const bugReport = await prisma.bugReport.findUnique({
    where: { id: bugReportId },
  });

  if (!bugReport) {
    throw new Error('Bug report not found.');
  }

  return prisma.bugReport.update({
    where: { id: bugReportId },
    data: {
      isResolved,
    },
  });
};