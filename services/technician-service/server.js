import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import workRoutes from "./routes/workRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());


app.use("/api/works", workRoutes);
app.use("/api/services", serviceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
