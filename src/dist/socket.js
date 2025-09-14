"use strict";
exports.__esModule = true;
exports.getIO = exports.initializeSocketIO = exports.userSocketMap = void 0;
var socket_io_1 = require("socket.io");
var jsonwebtoken_1 = require("jsonwebtoken");
var JWT_SECRET = process.env.SECRET;
/**
 * This is a simple in-memory store for mapping a userId to their socketId.
 * For a production environment with multiple server instances,
 * you should use a shared store like Redis to manage this mapping.
 */
exports.userSocketMap = new Map();
var io;
exports.initializeSocketIO = function (httpServer) {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });
    // Middleware for authenticating clients upon connection
    io.use(function (socket, next) {
        var token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: Token not provided.'));
        }
        jsonwebtoken_1["default"].verify(token, JWT_SECRET, function (err, decoded) {
            if (err) {
                return next(new Error('Authentication error: Invalid token.'));
            }
            // Attach userId to the socket object for easy access
            socket.data.userId = decoded.userId;
            next();
        });
    });
    io.on('connection', function (socket) {
        var userId = socket.data.userId;
        console.log("User connected: " + socket.id + " with userId: " + userId);
        // Store the mapping between userId and socketId
        exports.userSocketMap.set(userId, socket.id);
        // Event for a user to join a room for a specific order
        socket.on('join_order_room', function (orderId) {
            console.log("Socket " + socket.id + " (User: " + userId + ") joined room for order " + orderId);
            socket.join(orderId);
        });
        // Handle disconnection
        socket.on('disconnect', function () {
            console.log("User disconnected: " + socket.id + " (User: " + userId + ")");
            // Clean up the map on disconnect
            if (userId) {
                exports.userSocketMap["delete"](userId);
            }
        });
    });
    console.log('Socket.IO initialized');
};
// Export a function to get the io instance
exports.getIO = function () {
    if (!io) {
        throw new Error('Socket.IO not initialized!');
    }
    return io;
};
