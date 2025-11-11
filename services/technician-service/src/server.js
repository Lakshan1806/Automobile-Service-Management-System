import "./config/dotenv.js";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import routes from "./routes/index.js";
import { connectDB } from "./config/database.js";
import logger from "./utils/logger.js";
import loggerMiddleware from "./middleware/logger.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import authMiddleware from "./middleware/auth.middleware.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Configure this based on your frontend URLs
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3016;

// Make io accessible to routes
app.set('io', io);

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);
app.use(authMiddleware);

app.use("/api", routes);
app.get("/", (req, res) =>
  res.json({ ok: true, message: "Technician Management API" })
);

app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('join-task', (taskId) => {
    socket.join(`task-${taskId}`);
    logger.info(`Client ${socket.id} joined task room: ${taskId}`);
  });
  
  socket.on('leave-task', (taskId) => {
    socket.leave(`task-${taskId}`);
    logger.info(`Client ${socket.id} left task room: ${taskId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

const start = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
  });
};

start().catch((err) => {
  logger.error("Failed to start server:", err);
  process.exit(1);
});
