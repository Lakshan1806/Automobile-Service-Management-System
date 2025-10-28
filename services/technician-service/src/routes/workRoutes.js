import express from "express";
import {
  getAssignedWorks,
  startWork,
  updateProgress,
  finishWork,
} from "../controllers/workController.js";

const router = express.Router();

router.get("/", getAssignedWorks); // GET /api/works?technicianId=123
router.post("/start", startWork); // POST /api/works/start
router.put("/progress", updateProgress); // PUT /api/works/progress
router.put("/finish", finishWork); // PUT /api/works/finish

export default router;
