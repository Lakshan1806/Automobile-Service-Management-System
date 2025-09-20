import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import connectDB from "./utils/connectDB.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
  });
}

startServer();
