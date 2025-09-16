import { PrismaClient, Message } from '@prisma/client';
import { getIO, userSocketMap } from '../socket';
import * as notificationService from './notification.service';

const prisma = new PrismaClient();

interface SendMessageInput {
  orderId: string;
  senderId: string;
  recipientId: string;
  content: string;
}

/**
 * Sends a message within an order.
 * Validates that the sender and recipient are participants of the order.
 * @param {SendMessageInput} messageData - The message data.
 * @returns {Promise<Message>} The created message.
 */
export const sendMessageService = async ({
  orderId,
  senderId,
  recipientId,
  content,
}: SendMessageInput): Promise<Message> => {
  // 1. Find the order and verify participants
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      userId: true,
      shopperId: true,
      deliveryPersonId: true,
    },
  });

  if (!order) {
    throw new Error('Order not found.');
  }

  const participants = [order.userId, order.shopperId, order.deliveryPersonId].filter(
    (id): id is string => id !== null,
  );

  // 2. Check if sender and recipient are valid participants
  if (!participants.includes(senderId)) {
    throw new Error('Sender is not allowed to message in this order.');
  }

  if (!participants.includes(recipientId)) {
    throw new Error('Recipient is not a participant in this order.');
  }

  // 3. Create the message
  const message = await prisma.message.create({
    data: {
      orderId,
      senderId,
      recipientId,
      content,
    },
    include: {
      sender: {
        select: { id: true, name: true },
      },
    },
  });

  // --- Add Notification Logic Here ---
  await notificationService.createNotification({
    userId: recipientId,
    type: 'NEW_MESSAGE',
    title: `New message from ${message.sender.name}`,
    body: content,
    meta: { orderId: orderId, senderId: senderId }
  });
  // --- End Notification Logic ---

  // 4. Trigger a real-time event to the recipient
  try {
    const io = getIO();
    const recipientSocketId = userSocketMap.get(recipientId);

    if (recipientSocketId) {
      io.to(recipientSocketId).emit('new_message', message);
    }
  } catch (error) {
    console.error('Socket.IO error:', error);
  }

  return message;
};

/**
 * Retrieves all messages for a specific order.
 * Validates that the requesting user is a participant of the order.
 * @param {string} orderId - The ID of the order.
 * @param {string} userId - The ID of the user requesting the messages.
 * @returns {Promise<Message[]>} A list of messages for the order.
 */
export const getMessagesForOrderService = async (orderId: string, userId: string): Promise<Message[]> => {
  // 1. Find the order and verify the user is a participant
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      userId: true,
      shopperId: true,
      deliveryPersonId: true,
    },
  });

  if (!order) {
    throw new Error('Order not found.');
  }

  const participants = [order.userId, order.shopperId, order.deliveryPersonId].filter(
    (id): id is string => id !== null,
  );

  if (!participants.includes(userId)) {
    throw new Error('User is not allowed to view messages for this order.');
  }

  // 2. Retrieve messages for the order
  const messages = await prisma.message.findMany({
    where: {
      orderId: orderId,
    },
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      sender: {
        select: { id: true, name: true },
      },
    },
  });

  return messages;
};

/**
 * Marks all unread messages in an order for a specific user as read.
 * Notifies the senders of these messages in real-time.
 * @param {string} orderId - The ID of the order.
 * @param {string} userId - The ID of the user whose messages should be marked as read (the recipient).
 * @returns {Promise<{ count: number }>} The number of messages updated.
 */
export const markMessagesAsReadService = async (orderId: string, userId: string): Promise<{ count: number }> => {
  // 1. Verify the user is a participant in the order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      userId: true,
      shopperId: true,
      deliveryPersonId: true,
    },
  });

  if (!order) {
    throw new Error('Order not found.');
  }

  const participants = [order.userId, order.shopperId, order.deliveryPersonId].filter(
    (id): id is string => id !== null,
  );

  if (!participants.includes(userId)) {
    throw new Error('User is not allowed to modify messages for this order.');
  }

  // Find which messages will be updated to get their senderIds for real-time notification
  const messagesToUpdate = await prisma.message.findMany({
    where: {
      orderId: orderId,
      recipientId: userId,
      readAt: null,
    },
    select: {
      senderId: true,
    },
  });

  if (messagesToUpdate.length === 0) {
    return { count: 0 };
  }

  // 2. Update messages in the database
  const updateResult = await prisma.message.updateMany({
    where: {
      orderId: orderId,
      recipientId: userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  // 3. Notify senders via WebSocket that their messages have been read
  try {
    const io = getIO();
    const uniqueSenderIds = [...new Set(messagesToUpdate.map((m) => m.senderId))];

    for (const senderId of uniqueSenderIds) {
      const senderSocketId = userSocketMap.get(senderId);
      if (senderSocketId) {
        // The payload tells the sender's client which user in which order read the messages.
        io.to(senderSocketId).emit('messages_read', {
          orderId,
          readBy: userId,
        });
      }
    }
  } catch (error) {
    console.error('Socket.IO error in markMessagesAsReadService:', error);
  }

  return updateResult;
};