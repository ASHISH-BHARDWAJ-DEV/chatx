import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL 
      ? [process.env.CLIENT_URL] 
      : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

// we will use this function to check if the user is online or not
export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
  }
  
// this is for storig online users
const userSocketMap = {}; // {userId:socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.user.fullName);

  const userId = String(socket.userId); // Ensure userId is a string
  userSocketMap[userId] = socket.id;
  console.log(`User ${userId} mapped to socket ${socket.id}`);
  console.log("Current userSocketMap:", Object.keys(userSocketMap));

  // Send online users list to the newly connected user
  socket.emit("getOnlineUsers", Object.keys(userSocketMap));
  
  // Also notify all other clients about the new online user
  socket.broadcast.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle request for online users
  socket.on("requestOnlineUsers", () => {
    console.log(`User ${userId} requested online users list`);
    socket.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // with socket.on we listen for events from clients
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.fullName);
    delete userSocketMap[userId];
    console.log("Updated userSocketMap:", Object.keys(userSocketMap));
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };