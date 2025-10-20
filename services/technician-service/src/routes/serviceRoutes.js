import express from "express";
import { getServices, getParts } from "../controllers/serviceController.js";

const router = express.Router();

router.get("/services", getServices); // GET /api/services/services
router.get("/parts", getParts); // GET /api/services/parts

export default router;
