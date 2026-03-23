import { PrismaClient, BugCategory, Prisma, Role } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateBugReportPayload {
  userId: string;
  title?: string;
  category?: BugCategory;
  description: string;
  imageUrl?: string;
  orderId?: string;
  productId?: string;
  vendorId?: string;
  meta?: Prisma.InputJsonValue;
}

export const createBugReportService = async (payload: CreateBugReportPayload) => {
  const { userId, title, category, description, imageUrl, orderId, productId, vendorId, meta } = payload;

  const bugReport = await prisma.bugReport.create({
    data: {
      userId,
      title,
      category,
      description,
      imageUrl,
      orderId,
      productId,
      vendorId,
      meta,
    },
  });

  return bugReport;
};

export const getBugReportsByUserService = async (userId: string) => {
  return prisma.bugReport.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

export const getBugReportByIdService = async (bugReportId: string, requestingUserId: string, requestingUserRole: Role) => {
  const bugReport = await prisma.bugReport.findUnique({
    where: { id: bugReportId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      product: { select: { id: true, name: true } },
      vendor: { select: { id: true, name: true } },
    }
  });

  if (!bugReport) {
    return null;
  }

  if (bugReport.userId !== requestingUserId && requestingUserRole !== Role.admin) {
    throw new Error('Forbidden: You are not authorized to view this bug report.');
  }

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