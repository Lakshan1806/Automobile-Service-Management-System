// models/Technician.js
import mongoose from 'mongoose';

const TechnicianSchema = new mongoose.Schema({
  technicianId: { type: String, required: true, unique: true },
  technicianName: { type: String, required: true },
  phoneNumber: { type: String },
  email: { type: String },

  // Tasks assigned to this technician
  assignedTasks: [
    {
      appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
      startDate: { type: Date },
      workDuration: { type: Number, default: 1 }, // Duration in days
      status: {
        type: String,
        enum: ['scheduled', 'in-progress', 'completed'],
        default: 'scheduled'
      }
    }
  ],
  roadAssistAssignments: [{
    roadAssistId: { 
      type: String, 
      required: true,
      ref: 'RoadAssist',
      index: true 
    },
    assignedAt: { 
      type: Date, 
      default: Date.now 
    }
  }]
}, { timestamps: true });

export default mongoose.model('Technician', TechnicianSchema);
