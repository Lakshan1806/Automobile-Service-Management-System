import mongoose from "mongoose";

const WorklogSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
  technician: { type: mongoose.Schema.Types.ObjectId, ref: "Technician" },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  durationMinutes: { type: Number },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

WorklogSchema.pre("save", function (next) {
  if (this.startTime && this.endTime) {
    const ms = new Date(this.endTime) - new Date(this.startTime);
    this.durationMinutes = Math.round(ms / (1000 * 60));
  }
  next();
});

export default mongoose.model("Worklog", WorklogSchema);
