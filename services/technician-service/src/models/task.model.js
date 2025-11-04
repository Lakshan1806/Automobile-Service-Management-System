import mongoose from "mongoose";
import { TASK_STATUS } from "../constants/status.constants.js";

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Technician" },
  status: {
    type: String,
    enum: Object.values(TASK_STATUS),
    default: TASK_STATUS.OPEN,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  dueDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

TaskSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("Task", TaskSchema);
