import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "Technician" },
  read: { type: Boolean, default: false },
  meta: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Notification", NotificationSchema);
