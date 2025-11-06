import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  category: {
    type: String,
    enum: ["maintenance", "repair", "inspection", "diagnostic", "other"],
    default: "maintenance",
  },
  estimatedDuration: { type: Number },
  basePrice: { type: Number },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ServiceSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("Service", ServiceSchema);
