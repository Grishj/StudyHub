// src/server.ts (UPDATED)
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import { config } from "@/config/env";
import routes from "./routes";
import { errorHandler, notFound } from "./middleware/error.middleware";
import { generalLimiter } from "./middleware/rateLimit.middleware";
import { initializeSocketIO } from "./socket";

const app: Application = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: config.frontend.url,
    credentials: true,
  },
  maxHttpBufferSize: 1e8, // 100 MB for file uploads
});

// Make io accessible in routes
app.set("io", io);

// Initialize Socket.IO handlers
initializeSocketIO(io);

// ========================
// Middleware Setup
// ========================
app.use(helmet());

app.use(
  cors({
    origin: config.frontend.url,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// ========================
// Routes
// ========================
app.use("/api/v1", routes);

// ========================
// Fallback & Error Handling
// ========================
app.use(notFound);
app.use(errorHandler);

// ========================
// Server Startup
// ========================
const PORT = config.port;

const server = httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${config.node_env}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`🏠 Frontend URL: ${config.frontend.url}`);
  console.log(`🔌 WebSocket server initialized`);
});

// ========================
// Graceful Shutdown
// ========================
const gracefulShutdown = () => {
  console.log("\n🛑 Received shutdown signal. Closing server gracefully...");

  io.close(() => {
    console.log("✅ Socket.IO server closed.");
  });

  server.close((err) => {
    if (err) {
      console.error("❌ Error during server shutdown:", err);
      process.exit(1);
    }
    console.log("✅ HTTP server closed.");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("⚠️  Forced shutdown after 10s timeout.");
    process.exit(1);
  }, 10_000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  gracefulShutdown();
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("🚫 Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown();
});

export { io };
