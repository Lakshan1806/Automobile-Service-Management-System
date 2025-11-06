import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
  },
  vehicle: {
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number },
    licensePlate: { type: String },
    vin: { type: String },
  },
  service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true }, // "09:00", "14:30"
  estimatedDuration: { type: Number }, // in minutes
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Technician" },
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" }, // Link to created task
  status: {
    type: String,
    enum: ["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"],
    default: "scheduled",
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

AppointmentSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});


AppointmentSchema.index({ appointmentDate: 1, status: 1 });

export default mongoose.model("Appointment", AppointmentSchema);
