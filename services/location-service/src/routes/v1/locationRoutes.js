import express from "express";
import locationController from "../../controllers/locationController.js";

const locationRoutes = express.Router();

locationRoutes.patch("/location", locationController.updateLocation);
locationRoutes.post("/test", locationController.testLocation);
locationRoutes.get("/technician_location", locationController.getTechnicianLocation);
locationRoutes.get("/customer_location", locationController.getCustomerLocation);
locationRoutes.post("/route", locationController.getPolyline);


export default locationRoutes;