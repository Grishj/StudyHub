import { Server, Socket } from "socket.io";
import { verifyToken } from "@/utils/jwt.util";
import { ChatHandler } from "./handlers/chat.handler";
import { WebRTCHandler } from "../socket/handlers/webrtc.handler";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userData?: any;
}

export const initializeSocketIO = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token =
        socket.handshake.auth.token || socket.handshake.headers.authorization;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = verifyToken(token.replace("Bearer ", ""));
      socket.userId = decoded.userId;
      socket.userData = decoded;

      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  // Connection handler
  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Initialize handlers
    const chatHandler = new ChatHandler(io, socket);
    const webrtcHandler = new WebRTCHandler(io, socket);

    chatHandler.initialize();
    webrtcHandler.initialize();

    // Disconnect handler
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
    });

    // Error handler
    socket.on("error", (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  console.log("🔌 Socket.IO initialized");
};
