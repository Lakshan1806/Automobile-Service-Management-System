import express from "express";
import {
  createAppointmentHandler,
  listAppointmentsHandler,
  getAppointmentHandler,
  updateAppointmentHandler,
  deleteAppointmentHandler,
  getUpcomingAppointmentsHandler,
  getTodayAppointmentsHandler,
  getAppointmentsByDateHandler,
} from "../controllers/appointment.controller.js";
import { body } from "express-validator";
import validationMiddleware from "../middleware/validation.middleware.js";

const router = express.Router();

router.post(
  "/",
  [
    body("customer.name").notEmpty().withMessage("customer name is required"),
    body("customer.phone").notEmpty().withMessage("customer phone is required"),
    body("vehicle.make").notEmpty().withMessage("vehicle make is required"),
    body("vehicle.model").notEmpty().withMessage("vehicle model is required"),
    body("appointmentDate").notEmpty().isISO8601().withMessage("valid appointmentDate is required"),
    body("appointmentTime").notEmpty().withMessage("appointmentTime is required"),
  ],
  validationMiddleware,
  createAppointmentHandler
);

router.get("/", listAppointmentsHandler);
router.get("/upcoming", getUpcomingAppointmentsHandler);
router.get("/today", getTodayAppointmentsHandler);
router.get("/date/:date", getAppointmentsByDateHandler);
router.get("/:id", getAppointmentHandler);
router.put("/:id", updateAppointmentHandler);
router.delete("/:id", deleteAppointmentHandler);

export default router;
