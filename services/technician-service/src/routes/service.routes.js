import express from "express";
import {
  createServiceHandler,
  listServicesHandler,
  getServiceHandler,
  updateServiceHandler,
  deleteServiceHandler,
} from "../controllers/service.controller.js";
import { body } from "express-validator";
import validationMiddleware from "../middleware/validation.middleware.js";

const router = express.Router();

router.post(
  "/",
  [
    body("name").notEmpty().withMessage("name is required"),
    body("category").optional().isIn(["maintenance", "repair", "inspection", "diagnostic", "other"]),
  ],
  validationMiddleware,
  createServiceHandler
);

router.get("/", listServicesHandler);
router.get("/:id", getServiceHandler);
router.put("/:id", updateServiceHandler);
router.delete("/:id", deleteServiceHandler);

export default router;
