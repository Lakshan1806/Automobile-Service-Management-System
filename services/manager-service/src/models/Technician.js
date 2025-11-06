import mongoose from 'mongoose';

const TechnicianSchema = new mongoose.Schema({
  technicianId: { type: String, required: true, unique: true },
  technicianName: { type: String, required: true },
  phoneNumber: String,
  email: String,
  assignedTasks: [{
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    startDate: Date,
    workDuration: { type: Number, default: 1 }, // Duration in days
    status: { type: String, enum: ['scheduled', 'in-progress', 'completed'], default: 'null' }
  }],
  
}, { timestamps: true });

export default mongoose.model('Technician', TechnicianSchema);
