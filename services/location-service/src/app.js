import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import locationRoutes from "./routes/v1/locationRoutes.js";

const app = express();

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "http://localhost:3001"],
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api", locationRoutes);

export default app;
