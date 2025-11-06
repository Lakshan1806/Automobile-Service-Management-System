// services/appointmentService.js
import Appointment from '../models/Appointment.js';

class AppointmentService {
  async getNewAppointments() {
    return await Appointment.find({ status: 'pending' });
  }

  async getAssignedAppointments() {
    return await Appointment.find({ status: { $in: ['scheduled', 'inprocess'] } });
  }

  async approveAppointment(id, technicianData) {
    const { technicianId, technicianName, startDate, endDate } = technicianData;
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        technicianId,
        technicianName,
        startDate,
        endDate,
        status: 'scheduled'
      },
      { new: true }
    );
    return appointment;
  }

  async rejectAppointment(id) {
    return await Appointment.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      { new: true }
    );
  }
}

export default new AppointmentService();
