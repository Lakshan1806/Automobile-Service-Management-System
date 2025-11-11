import express from "express";
import {
  createWorklogHandler,
  getWorklogsForTaskHandler,
  updateWorklogHandler,
  getWorklogHandler,
  addServiceToWorklogHandler,
  addProductToWorklogHandler,
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

router.get("/:id", getWorklogHandler);

router.put("/:id", updateWorklogHandler);

router.post(
  "/:id/service",
  [
    body("serviceId").notEmpty().withMessage("serviceId is required").isInt(),
  ],
  validationMiddleware,
  addServiceToWorklogHandler
);

router.post(
  "/:id/products",
  [
    body("productId").notEmpty().withMessage("productId is required").isInt(),
    body("quantityUsed").notEmpty().withMessage("quantityUsed is required").isInt({ min: 1 }),
  ],
  validationMiddleware,
  addProductToWorklogHandler
);

export default router;
