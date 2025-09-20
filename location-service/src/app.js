import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "http://localhost:3001"],
  })
);
app.use(express.json());

export default app;
