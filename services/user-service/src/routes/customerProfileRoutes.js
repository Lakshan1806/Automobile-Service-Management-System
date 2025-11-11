import { Router } from "express";
import CustomerProfileController from "../controllers/customerProfile.controller.js";

const router = Router();

router.post("/", CustomerProfileController.createPlaceholder);
router.put("/:customerId", CustomerProfileController.updateContactDetails);
router.post("/:customerId/vehicles", CustomerProfileController.addVehicle);
router.get("/:customerId/details", CustomerProfileController.getDetails);
router.put("/:customerId/details", CustomerProfileController.updateDetails);

export default router;
