import { PrismaClient, SupportTicket, TicketCategory, Prisma, TicketStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateSupportTicketPayload {
  userId: string;
  title: string;
  description: string;
  category: TicketCategory;
  meta?: Prisma.JsonObject;
}

/**
 * Creates a new support ticket for an authenticated user.
 * @param payload The data for the new support ticket.
 * @returns The created support ticket.
 */
export const createSupportTicketService = async (payload: CreateSupportTicketPayload): Promise<SupportTicket> => {
  const { userId, title, description, category, meta } = payload;

  const ticket = await prisma.supportTicket.create({
    data: {
      userId,
      title,
      description,
      category,
      meta: meta || {},
    },
  });

  // Optional: Notify support staff via email or another system
  // e.g., `notifySupportTeam(ticket);`

  return ticket;
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

/**
 * Retrieves all support tickets with pagination (for admin use).
 * @returns A paginated list of all support tickets.
 */
export const getAllSupportTicketsService = async (
  page: number,
  take: number
): Promise<{ data: SupportTicket[]; totalCount: number; totalPages: number }> => {
  const skip = (page - 1) * take;

  const [tickets, totalCount] = await prisma.$transaction([
    prisma.supportTicket.findMany({
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
    prisma.supportTicket.count(),
  ]);

  const totalPages = Math.ceil(totalCount / take);

  return { data: tickets, totalCount, totalPages };
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