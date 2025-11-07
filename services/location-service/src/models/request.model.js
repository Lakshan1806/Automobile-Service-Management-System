import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true },
    customerName: { type: String, default: null, trim: true },
    customerEmail: { type: String, default: null, trim: true },
    technicianId: { type: String, default: null },
    requestType: {
      type: String,
      enum: ["roadside_assistance", "service"],
      default: "roadside_assistance",
    },
    reference: { type: String, default: null },
    vehicle: {
      id: { type: String, default: null },
      brand: { type: String, default: null },
      model: { type: String, default: null },
      numberPlate: { type: String, default: null },
    },
    description: { type: String, default: null, trim: true },
    status: {
      type: String,
      enum: ["pending", "assigned", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    lastCustomerLoc: { lat: Number, lng: Number },
    lastTechnicianLoc: { lat: Number, lng: Number },
  },
  { timestamps: true }
);

export default mongoose.model("Request", RequestSchema);
