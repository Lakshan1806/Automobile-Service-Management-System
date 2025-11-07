import { Router } from "express";
import CustomerProfileController from "../controllers/customerProfile.controller.js";

const router = Router();

router.post("/", CustomerProfileController.createPlaceholder);
router.put("/:customerId", CustomerProfileController.updateContactDetails);
router.post("/:customerId/vehicles", CustomerProfileController.addVehicle);

export default router;
