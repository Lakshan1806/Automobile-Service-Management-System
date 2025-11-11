import mongoose from 'mongoose';

const roadAssistSchema = new mongoose.Schema({
  customId: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  vehicleId: {
    type: String,
    required: true
  },
  vehicleNo: {
    type: String,
    required: true,
    index: true
  },
  customerId: {
    type: String,
    required: true,
    index: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  currentLocation: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  serviceType: {
    type: String,
    required: true,
    enum: [
      'towing',
      'tire change',
      'fuel delivery',
      'jump start',
      'lockout service',
      'mechanical repair',
      'multi-service'
    ],
    index: true
  },
  requestDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  // ✅ Local-only fields (optional)
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending',
    index: true
  },
  assignedTechnician: {
    type: String,
    ref: 'Technician',
    required: false
  },
  assignedTechnicianName: {
    type: String,
    required: false
  },
  notes: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

const RoadAssist = mongoose.model('RoadAssist', roadAssistSchema);

export default RoadAssist;
