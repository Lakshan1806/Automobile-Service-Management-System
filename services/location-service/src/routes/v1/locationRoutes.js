import express from "express";
import locationController from "../../controllers/locationController.js";
import adminAuthController from "../../controllers/adminAuthController.js";
import authenticateToken from "../../middlewares/adminTokenAuthenticator.js";

const locationRoutes = express.Router();

locationRoutes.patch("/location", locationController.updateLocation);
locationRoutes.post("/test", locationController.testLocation);
locationRoutes.get("/technician_location", locationController.getTechnicianLocation);
locationRoutes.get("/customer_location", locationController.getCustomerLocation);
locationRoutes.post("/route", locationController.getPolyline);


locationRoutes.post("/login", adminAuthController.login);
locationRoutes.post("/logout", adminAuthController.logout);
locationRoutes.post("/signup", adminAuthController.addAdmin);
locationRoutes.get("/profile", authenticateToken, adminAuthController.profile);
locationRoutes.post(
  "/customers/logout",
  adminAuthController.logout
);
locationRoutes.get(
  "/customers/me",
  authenticateToken,
  adminAuthController.profile
);

export default locationRoutes;
