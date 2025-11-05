import express from "express";
import {
  createNotificationHandler,
  getNotificationsHandler,
  markNotificationReadHandler,
} from "../controllers/notification.controller.js";
import { body } from "express-validator";
import validationMiddleware from "../middleware/validation.middleware.js";

const router = express.Router();

router.post(
  "/",
  [body("title").notEmpty(), body("body").optional()],
  validationMiddleware,
  createNotificationHandler
);

router.get("/", getNotificationsHandler);
router.put("/:id/read", markNotificationReadHandler);

export default router;
