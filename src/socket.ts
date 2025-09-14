import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.SECRET as string;

/**
 * This is a simple in-memory store for mapping a userId to their socketId.
 * For a production environment with multiple server instances,
 * you should use a shared store like Redis to manage this mapping.
 */
export const userSocketMap = new Map<string, string>();

let io: Server;

export const initializeSocketIO = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // TODO: Restrict this to your frontend's URL in production
      methods: ['GET', 'POST'],
    },
  });

  // Middleware for authenticating clients upon connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: Token not provided.'));
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return next(new Error('Authentication error: Invalid token.'));
      }
      // Attach userId to the socket object for easy access
      socket.data.userId = (decoded as JwtPayload).userId;
      next();
    });
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`User connected: ${socket.id} with userId: ${userId}`);

    // Store the mapping between userId and socketId
    userSocketMap.set(userId, socket.id);

    // Event for a user to join a room for a specific order
    socket.on('join_order_room', (orderId: string) => {
      console.log(`Socket ${socket.id} (User: ${userId}) joined room for order ${orderId}`);
      socket.join(orderId);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id} (User: ${userId})`);
      // Clean up the map on disconnect
      if (userId) {
        userSocketMap.delete(userId);
      }
    });
  });

  console.log('Socket.IO initialized');
};

// Export a function to get the io instance
export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO not initialized!');
  }
  return io;
};
