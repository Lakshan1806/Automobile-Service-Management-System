import express from "express";
import taskRoutes from "./task.routes.js";
import worklogRoutes from "./worklog.routes.js";
import notificationRoutes from "./notification.routes.js";

const router = express.Router();

router.use("/tasks", taskRoutes);
router.use("/worklogs", worklogRoutes);
router.use("/notifications", notificationRoutes);

router.get("/", (req, res) => res.json({ ok: true, message: "API root" }));

export default router;
