import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import customerProfileRoutes from "./routes/customerProfileRoutes.js";

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

export default app;
