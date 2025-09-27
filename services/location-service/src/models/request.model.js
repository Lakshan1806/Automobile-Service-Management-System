import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true },
    technicianId: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "assigned", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    lastCustomerLoc: { lat: Number, lng: Number, at: Date },
    lastTechnicianLoc: { lat: Number, lng: Number, at: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Request", RequestSchema);
