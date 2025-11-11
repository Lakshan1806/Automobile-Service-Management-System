import { Router } from "express";
import VehicleController from "../controllers/vehicle.controller.js";
import CustomerProfileController from "../controllers/customerProfile.controller.js";

const router = Router();

router.get("/:customerId/vehicles", VehicleController.listByCustomer);
router.post("/:customerId/vehicles", VehicleController.createForCustomer);
// Alias: expose aggregated customer details under /api/customers as well
router.get("/:customerId/details", CustomerProfileController.getDetails);
router.put("/:customerId/details", CustomerProfileController.updateDetails);

export default router;
