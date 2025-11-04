import express from "express";
import {
  createTaskHandler,
  listTasksHandler,
  getTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  addProgressHandler,
} from "../controllers/task.controller.js";
import { body } from "express-validator";
import validationMiddleware from "../middleware/validation.middleware.js";

const router = express.Router();

router.post(
  "/",
  [
    body("title").notEmpty().withMessage("title is required"),
    body("description").optional().isString(),
  ],
  validationMiddleware,
  createTaskHandler
);

router.get("/", listTasksHandler);
router.get("/:id", getTaskHandler);
router.put("/:id", updateTaskHandler);
router.delete("/:id", deleteTaskHandler);

router.post(
  "/:id/progress",
  [body("message").notEmpty().withMessage("message is required")],
  validationMiddleware,
  addProgressHandler
);

export default router;
