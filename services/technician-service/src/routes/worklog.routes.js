import express from "express";
import {
  createWorklogHandler,
  getWorklogsForTaskHandler,
} from "../controllers/worklog.controller.js";
import { body } from "express-validator";
import validationMiddleware from "../middleware/validation.middleware.js";

const router = express.Router();

router.post(
  "/",
  [
    body("task").notEmpty(),
    body("startTime").notEmpty().isISO8601(),
    body("endTime").optional().isISO8601(),
  ],
  validationMiddleware,
  createWorklogHandler
);

router.get("/task/:taskId", getWorklogsForTaskHandler);

export default router;
