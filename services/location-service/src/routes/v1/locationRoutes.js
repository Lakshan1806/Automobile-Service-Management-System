import express from "express";
import locationController from "../../controllers/locationController.js";

const locationRoutes = express.Router();

locationRoutes.patch("/location", locationController.updateLocation);
locationRoutes.post("/test", locationController.testLocation);

export default locationRoutes;