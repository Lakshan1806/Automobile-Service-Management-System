import { Router } from "express";
import VehicleController from "../controllers/vehicle.controller.js";

const router = Router();

router.get("/:customerId/vehicles", VehicleController.listByCustomer);
router.post("/:customerId/vehicles", VehicleController.createForCustomer);

export default router;
