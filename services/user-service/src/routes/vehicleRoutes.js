import { Router } from "express";
import VehicleController from "../controllers/vehicle.controller.js";

const router = Router();

router.get("/:vehicleId", VehicleController.getById);
router.put("/:vehicleId", VehicleController.updateById);
router.get("/:vehicleId/appointment-details", VehicleController.getAppointmentDetails);

export default router;
