import { PrismaClient, SupportTicket, TicketCategory, Prisma, TicketStatus, Role, ReferenceType } from '@prisma/client';
import { uploadMedia } from './media.service';
import { Readable } from 'stream';

const prisma = new PrismaClient();

interface CreateSupportTicketPayload {
  userId: string;
  title: string;
  description: string;
  category: TicketCategory;
  image?: string;
  meta?: Prisma.JsonObject;
}

/**
 * Creates a new support ticket for an authenticated user.
 * @param payload The data for the new support ticket.
 * @returns The created support ticket.
 */
export const createSupportTicketService = async (payload: CreateSupportTicketPayload): Promise<SupportTicket> => {
  const { userId, title, description, category, meta, image } = payload;

  const ticket = await prisma.supportTicket.create({
    data: {
      userId,
      title,
      description,
      category,
      meta: meta || {},
    },
  });

  if (image) {
    try {
      const imageBuffer = Buffer.from(image, 'base64');
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: `${ticket.id}-ticket-image.jpg`,
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: imageBuffer,
        size: imageBuffer.length,
        stream: new Readable(),
        destination: '',
        filename: '',
        path: '',
      };

      // Use 'other' or a specific type if available in ReferenceType enum
      const uploadResult = await uploadMedia(mockFile, ticket.id, ReferenceType.other);
      
      // Update ticket with image URL if the model supports it
      // Assuming SupportTicket has an 'image' field based on user request
      return prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { image: uploadResult.cloudinaryResult.secure_url } as any, 
      });
    } catch (error) {
      console.error('Error uploading ticket image:', error);
    }
  }

  // Optional: Notify support staff via email or another system
  // e.g., `notifySupportTeam(ticket);`

  return ticket;
};

export const updateSupportTicketService = async (
  ticketId: string,
  userId: string,
  payload: Partial<CreateSupportTicketPayload>
): Promise<SupportTicket> => {
  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new Error('Support ticket not found.');
  if (ticket.userId !== userId) throw new Error('You are not authorized to update this ticket.');

  const { image, ...data } = payload;
  let imageUrl = (ticket as any).image;

  if (image) {
    try {
      const imageBuffer = Buffer.from(image, 'base64');
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: `${ticket.id}-ticket-image-updated.jpg`,
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: imageBuffer,
        size: imageBuffer.length,
        stream: new Readable(),
        destination: '',
        filename: '',
        path: '',
      };

      const uploadResult = await uploadMedia(mockFile, ticket.id, ReferenceType.other);
      imageUrl = uploadResult.cloudinaryResult.secure_url;
    } catch (error) {
      console.error('Error uploading updated ticket image:', error);
    }
  }

  return prisma.supportTicket.update({
    where: { id: ticketId },
    data: { ...data, image: imageUrl } as any,
  });
};

/**
 * Retrieves all support tickets for a specific user.
 * @param userId The ID of the user.
 * @returns A list of the user's support tickets.
 */
export const getSupportTicketsByUserService = async (userId: string): Promise<SupportTicket[]> => {
  return prisma.supportTicket.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

export interface GetAllTicketsFilters {
  customerName?: string;
  status?: TicketStatus;
  createdAtStart?: string;
  createdAtEnd?: string;
}

/**
 * Retrieves all support tickets with pagination (for admin use).
 * @param filters - The filtering criteria.
 * @param page - The page number for pagination.
 * @param take - The number of items per page.
 * @returns A paginated list of all support tickets.
 */
export const getAllSupportTicketsService = async (
  filters: GetAllTicketsFilters,
  page: number,
  take: number
): Promise<{ data: SupportTicket[]; totalCount: number; totalPages: number }> => {
  const skip = (page - 1) * take;
  const { customerName, status, createdAtStart, createdAtEnd } = filters;

  const where: Prisma.SupportTicketWhereInput = {};

  if (customerName) {
    where.user = {
      name: {
        contains: customerName,
        mode: 'insensitive',
      },
    };
  }

  if (status) {
    where.status = status;
  }

  if (createdAtStart || createdAtEnd) {
    where.createdAt = {};
    if (createdAtStart) {
      (where.createdAt as Prisma.DateTimeFilter).gte = new Date(createdAtStart);
    }
    if (createdAtEnd) {
      (where.createdAt as Prisma.DateTimeFilter).lte = new Date(createdAtEnd);
    }
  }

  const [tickets, totalCount] = await prisma.$transaction([
    prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      skip,
      take,
    }),
    prisma.supportTicket.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / take);

  return { data: tickets, totalCount, totalPages };
};

/**
 * Retrieves a single support ticket by its ID.
 * Performs authorization to ensure only the ticket owner or an admin can view it.
 * @param ticketId The ID of the ticket to retrieve.
 * @param requestingUserId The ID of the user making the request.
 * @param requestingUserRole The role of the user making the request.
 * @returns The support ticket object with user details, or null if not found.
 * @throws Error if the user is not authorized.
 */
export const getSupportTicketByIdService = async (
  ticketId: string,
  requestingUserId: string,
  requestingUserRole: Role
): Promise<SupportTicket | null> => {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!ticket) {
    return null;
  }

  // Authorization check: Allow if the requester is the owner or an admin.
  if (ticket.userId !== requestingUserId && requestingUserRole !== Role.admin) {
    throw new Error('You are not authorized to view this ticket.');
  }

  return ticket;
};

/**
 * Updates the status of a support ticket (for admin use).
 * @param ticketId The ID of the ticket to update.
 * @param status The new status for the ticket.
 * @returns The updated support ticket.
 */
export const updateSupportTicketStatusService = async (
  ticketId: string,
  status: TicketStatus
): Promise<SupportTicket> => {
  const updatedTicket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  // Optional: Notify the user that their ticket status has been updated.
  // e.g., createAndSendNotification({ userId: updatedTicket.userId, ... })

  return updatedTicket;
};

/**
 * (Admin) Retrieves an overview of support ticket data for the platform.
 * @returns An object containing total, open, closed, and resolved ticket counts.
 */
export const getSupportTicketOverviewService = async (): Promise<{
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  resolvedTickets: number;
}> => {
  const [totalTickets, openTickets, closedTickets, resolvedTickets] = await Promise.all([
    prisma.supportTicket.count(),
    prisma.supportTicket.count({
      where: {
        status: { in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS] },
      },
    }),
    prisma.supportTicket.count({
      where: {
        status: TicketStatus.CLOSED,
      },
    }),
    prisma.supportTicket.count({
      where: {
        status: TicketStatus.RESOLVED,
      },
    }),
  ]);

  return { totalTickets, openTickets, closedTickets, resolvedTickets };
};

/**
 * (Admin) Exports support tickets to CSV format based on filters.
 */
export const exportSupportTicketsService = async (filters: GetAllTicketsFilters) => {
  const { customerName, status, createdAtStart, createdAtEnd } = filters;
  const where: Prisma.SupportTicketWhereInput = {};

  if (customerName) {
    where.user = { name: { contains: customerName, mode: 'insensitive' } };
  }
  if (status) where.status = status;
  if (createdAtStart || createdAtEnd) {
    where.createdAt = {};
    if (createdAtStart) (where.createdAt as Prisma.DateTimeFilter).gte = new Date(createdAtStart);
    if (createdAtEnd) (where.createdAt as Prisma.DateTimeFilter).lte = new Date(createdAtEnd);
  }

  const tickets = await prisma.supportTicket.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } } },
  });

  const header = ['ID', 'User Name', 'User Email', 'Title', 'Description', 'Category', 'Status', 'Created At'];
  const rows = tickets.map(t => [
    t.id,
    `"${(t.user?.name || '').replace(/"/g, '""')}"`,
    t.user?.email || '',
    `"${(t.title || '').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.category,
    t.status,
    t.createdAt.toISOString()
  ]);

  return [header.join(','), ...rows.map(r => r.join(','))].join('\n');
};