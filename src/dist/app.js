"use strict";
exports.__esModule = true;
// Import express, cors, helmet and morgan
var express_1 = require("express");
var cors_1 = require("cors");
var helmet_1 = require("helmet");
var morgan_1 = require("morgan");
var routes_1 = require("./routes");
var swagger_ui_express_1 = require("swagger-ui-express");
var swagger_1 = require("./config/swagger");
//import { Server } from 'socket.io';
var http = require('http');
require('dotenv').config();
//import { createMessage, getAllMessages, clearMessages } from './models/message.model';
//import { prisma } from './utils/prisma';
// Create Express server
var app = express_1["default"](); // New express instance
var server = http.createServer(app);
/* const io = new Server(server, {
  cors: {
    origin: '*', // React frontend URL
    methods: ['GET', 'POST'],
  },
}); */
var port = 5000; // Port number
// Express configuration
app.use(cors_1["default"]()); // Enable CORS
app.use(helmet_1["default"]()); // Enable Helmet
app.use(morgan_1["default"]('dev')); // Enable Morgan
app.use(express_1["default"].json({ limit: '50mb' }));
app.use(express_1["default"].urlencoded({ extended: true }));
// Swagger UI Endpoint
app.use('/api-docs', swagger_ui_express_1["default"].serve, swagger_ui_express_1["default"].setup(swagger_1["default"], { explorer: true }));
// Use routes
app.use('/', routes_1["default"]);
/* type roomsObject = {
  [key: string]: any[];
}; */
//const rooms: roomsObject  = {};
/* io.on('connection', (socket) => {
  console.log('A user connected', socket?.id);

  // Join a room
  socket.on('joinRoom', ({ room, username }) => {
    socket.join(room); // Join the specified room
    console.log(`${username} joined room: ${room}`);

    // Add user to the room's user list
    if (!rooms[room]) {
      rooms[room] = [];
    }
    rooms[room].push({ id: socket.id, username });

    // Notify everyone in the room about the new user
    io.to(room).emit('roomUpdate', {
      message: `${username} has joined the room.`,
      users: rooms[room],
    });
  });

  // Handle messages sent to the room
  socket.on('message', async ({ room, username, data }) => {
    console.log(`Message in room ${room} from ${username}`, data);
    await createMessage(data);

    // Get all messages between the two users
    const messageHistory = await getAllMessages({userId: username, receiverId: data?.receiverId})
    // Broadcast the message to everyone in the room
    io.to(room).emit('update', messageHistory.data);
  });


  // Handle "typing" event
  socket.on("typing", ({ room, username, data }) => {
    // Emit "userTyping" to the recipient
    io.to(room).emit("userTyping", { username, message: data});
    console.log(`user: ${username} is typing`)
  });

  // Handle "stopTyping" event
  socket.on("stopTyping", ({ room, username, data }) => {
    // Emit "userStoppedTyping" to the recipient
    io.to(room).emit("userStoppedTyping", { username, message: data });
    console.log(`user: ${username} stopped typing`, room)
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    // Remove the user from the room they were in
    for (const room in rooms) {
      rooms[room] = rooms[room].filter((user) => user.id !== socket.id);

      // Notify remaining users in the room
      io.to(room).emit('roomUpdate', {
        message: 'A user has left the room.',
        users: rooms[room],
      });
    }
  });
}); */
// Start Express server
server.listen(port, function () {
    // Callback function when server is successfully started
    console.log("Server started at http://localhost:" + port);
});
// Export Express app
exports["default"] = app;
