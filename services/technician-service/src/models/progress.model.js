import mongoose from "mongoose";

const ProgressSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Technician" },
});

export default mongoose.model("Progress", ProgressSchema);
