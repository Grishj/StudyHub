// src/server.ts
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { config } from "@/config/env";
import routes from "./routes";
import { errorHandler, notFound } from "./middleware/error.middleware";
import { generalLimiter } from "./middleware/rateLimit.middleware";

const app: Application = express();

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

app.use(express.json({ limit: "10mb" })); // Prevent large payload attacks
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// // Apply rate limiting only in non-test environments
// if (config.node_env !== "test") {
//   app.use(generalLimiter);
// }

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

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${config.node_env}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`🏠 Frontend URL: ${config.frontend.url}`);
});

// ========================
// Graceful Shutdown
// ========================
const gracefulShutdown = () => {
  console.log("\n🛑 Received shutdown signal. Closing server gracefully...");

  server.close((err) => {
    if (err) {
      console.error("❌ Error during server shutdown:", err);
      process.exit(1);
    }
    console.log("✅ HTTP server closed.");
    process.exit(0);
  });

  // Force exit after 10 seconds if cleanup takes too long
  setTimeout(() => {
    console.error("⚠️  Forced shutdown after 10s timeout.");
    process.exit(1);
  }, 10_000);
};

// Handle termination signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Handle uncaught exceptions (log and shut down)
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  gracefulShutdown();
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("🚫 Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown();
});
