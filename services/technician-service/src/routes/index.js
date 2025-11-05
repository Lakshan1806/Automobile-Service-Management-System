import express from "express";
import taskRoutes from "./task.routes.js";
import worklogRoutes from "./worklog.routes.js";
import notificationRoutes from "./notification.routes.js";
import serviceRoutes from "./service.routes.js";
import partRoutes from "./part.routes.js";
import appointmentRoutes from "./appointment.routes.js";

const router = express.Router();

router.use("/tasks", taskRoutes);
router.use("/worklogs", worklogRoutes);
router.use("/notifications", notificationRoutes);
router.use("/services", serviceRoutes);
router.use("/parts", partRoutes);
router.use("/appointments", appointmentRoutes);

router.get("/", (req, res) => res.json({ ok: true, message: "API root" }));

export default router;
