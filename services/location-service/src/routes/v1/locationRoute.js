import express from "express";
import locationController from "../../controllers/locationController.js";

const locationRoutes = express.Router();

locationRoutes.post("/location", locationController.updateLocation);
//locationRoutes.get("/", );

export default locationRoutes;