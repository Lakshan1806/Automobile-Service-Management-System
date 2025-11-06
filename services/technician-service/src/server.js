import "./config/dotenv.js";
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { connectDB } from "./config/database.js";
import logger from "./utils/logger.js";
import loggerMiddleware from "./middleware/logger.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import authMiddleware from "./middleware/auth.middleware.js";
import eventEmitter from "./utils/event-emitter.js";
import * as NotificationService from "./services/notification.service.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);
app.use(authMiddleware);

app.use("/api", routes);
app.get("/", (req, res) =>
  res.json({ ok: true, message: "Technician Management API" })
);

app.use(errorHandler);

eventEmitter.on("task.created", async (payload) => {
  try {
    await NotificationService.createNotification({
      title: "New task created",
      body: `Task ${payload.title} was created`,
      meta: payload,
    });
    logger.info("Notification created for task.created event");
  } catch (err) {
    logger.error("Failed to create notification from event", err);
  }
});

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
  });
};

start().catch((err) => {
  logger.error("Failed to start server:", err);
  process.exit(1);
});
