import express from "express";
import cors from "cors";
import locationRoutes from "./routes/v1/locationRoute.js";

const app = express();

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "http://localhost:3001"],
  })
);
app.use(express.json());

app.use("/location", locationRoutes);

export default app;
