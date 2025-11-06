import express from "express";
import {
  createPartHandler,
  listPartsHandler,
  getPartHandler,
  updatePartHandler,
  deletePartHandler,
  addPartToTaskHandler,
  getTaskPartsHandler,
  removePartFromTaskHandler,
} from "../controllers/part.controller.js";
import { body } from "express-validator";
import validationMiddleware from "../middleware/validation.middleware.js";

const router = express.Router();


router.post(
  "/",
  [
    body("name").notEmpty().withMessage("name is required"),
    body("unitPrice").isNumeric().withMessage("unitPrice must be a number"),
  ],
  validationMiddleware,
  createPartHandler
);

router.get("/", listPartsHandler);
router.get("/:id", getPartHandler);
router.put("/:id", updatePartHandler);
router.delete("/:id", deletePartHandler);


router.post(
  "/task/:taskId",
  [
    body("partId").notEmpty().withMessage("partId is required"),
    body("quantity").isInt({ min: 1 }).withMessage("quantity must be at least 1"),
  ],
  validationMiddleware,
  addPartToTaskHandler
);

router.get("/task/:taskId", getTaskPartsHandler);
router.delete("/task-part/:id", removePartFromTaskHandler);

export default router;
