import { PrismaClient, Content, ContentType } from '@prisma/client';

const prisma = new PrismaClient();

export { ContentType };

export interface UpdateContentPayload {
  content: string;
}

/**
 * Retrieves a content entry by its type.
 * If it doesn't exist, it creates a default empty entry.
 * @param type The type of content to retrieve (e.g., PRIVACY_POLICY).
 * @returns The content object.
 */
export const getContentByType = async (type: ContentType): Promise<Content> => {
  const content = await prisma.content.findUnique({
    where: { type },
  });

  if (!content) {
    return prisma.content.create({
      data: {
        type,
        content: `<p>No ${type.replace('_', ' ').toLowerCase()} has been set yet.</p>`,
      },
    });
  }
  return content;
};

/**
 * Creates or updates a content entry.
 * @param type The type of content to upsert.
 * @param payload The data to update, containing the content string.
 * @returns The created or updated content object.
 */
export const upsertContent = async (type: ContentType, payload: UpdateContentPayload): Promise<Content> => {
  return prisma.content.upsert({
    where: { type },
    update: { content: payload.content },
    create: { type, content: payload.content },
  });
};

