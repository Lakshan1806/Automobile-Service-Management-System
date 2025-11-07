import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import customerProfileRoutes from "./routes/customerProfileRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";

const app = express();

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "http://localhost:3001"],
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/customer-profiles", customerProfileRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/vehicles", vehicleRoutes);

export default app;
