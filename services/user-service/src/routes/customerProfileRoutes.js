import { Router } from "express";
import CustomerProfileController from "../controllers/customerProfile.controller.js";

const router = Router();

router.post("/", CustomerProfileController.createPlaceholder);

export default router;
