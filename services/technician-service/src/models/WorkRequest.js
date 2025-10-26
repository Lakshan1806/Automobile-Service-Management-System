import mongoose from "mongoose";

const workRequestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["main", "sub"], required: true },
  assignedTo: { type: String, required: true }, // technicianId
  status: { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("WorkRequest", workRequestSchema);
