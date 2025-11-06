// models/ServiceAppointment.js
import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
  appointmentId: { 
    type: String, 
    unique: true,
    sparse: true
  },
  vehicleId: String,
  vehicleNo: String,
  chaseNo: String,
  type: String,
  brand: String,
  customerId: String,
  millage: Number,
  lastServiceDate: Date,
  customerPhone: String,
  repair: String,
  description: String,
  suggested_started_date: Date,
  suggested_completed_date: Date,
  predicted_duration_date: Number, // number of days (based on your UI)
  manual_starting_date: Date,
  accuracy: Number,
  status: { 
    type: String, 
    default: 'pending',
    enum: ['pending', 'scheduled', 'inprocess', 'finished']
  },
  technicianId: String,
  technicianName: String,
  startDate: Date,
  endDate: Date
}, { 
  timestamps: true,
  // Allow additional fields not defined in schema
  strict: false 
});

export default mongoose.model('Appointment', AppointmentSchema);
