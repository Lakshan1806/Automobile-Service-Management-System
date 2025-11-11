import mongoose from "mongoose";
import { TASK_STATUS } from "../constants/status.constants.js";

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  // Changed to Number to support service_id from admin service (MySQL)
  // Previously: mongoose.Schema.Types.ObjectId when services were in MongoDB
  service: { type: Number }, // service_id from admin_service
  serviceName: { type: String }, // Cache service name for quick access
  servicePrice: { type: Number }, // Cache service price
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
  // Parts used in this task (from admin_service)
  parts: [{
    product_id: { type: Number }, // product_id from admin_service
    name: { type: String },
    quantityUsed: { type: Number },
    unitPrice: { type: Number },
    totalPrice: { type: Number }
  }],
  // Calculated totals
  totalCost: { type: Number, default: 0 }, // service price + parts cost
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

TaskSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("Task", TaskSchema);
