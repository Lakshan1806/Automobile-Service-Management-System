import mongoose from "mongoose";

const servicePartSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ["service", "part"], required: true }
});

export default mongoose.model("ServicePart", servicePartSchema);
