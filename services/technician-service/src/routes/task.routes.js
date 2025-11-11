import express from "express";
import {
  createTaskHandler,
  listTasksHandler,
  getTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  addProgressHandler,
  addPartToTaskHandler,
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

router.post(
  "/:id/parts",
  [
    body("partId").notEmpty().withMessage("partId is required").isInt(),
    body("quantityUsed").notEmpty().withMessage("quantityUsed is required").isInt({ min: 1 }),
  ],
  validationMiddleware,
  addPartToTaskHandler
);

export default router;
