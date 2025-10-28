import mongoose from "mongoose";

const technicianWorkSchema = new mongoose.Schema(
  {
    technicianId: { type: String, required: true },
    workRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkRequest",
      required: true,
    },
    selectedServices: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ServicePart" },
    ],
    selectedParts: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ServicePart" },
    ],
    progressUpdates: [
      {
        serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "ServicePart" },
        status: {
          type: String,
          enum: ["pending", "in-progress", "done"],
          default: "pending",
        },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    finished: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("TechnicianWork", technicianWorkSchema);
