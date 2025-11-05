import Appointment from "../models/appointment.model.js";

export const createAppointment = async (data) => {
  return Appointment.create(data);
};

export const getAppointments = async (filter = {}, options = {}) => {
  const { limit = 50, skip = 0 } = options;
  return Appointment.find(filter)
    .populate("service", "name estimatedDuration")
    .populate("assignedTo", "name")
    .populate("task")
    .skip(skip)
    .limit(limit)
    .sort({ appointmentDate: 1, appointmentTime: 1 });
};

export const getAppointmentById = async (id) => {
  return Appointment.findById(id)
    .populate("service")
    .populate("assignedTo")
    .populate("task");
};

export const updateAppointment = async (id, data) => {
  return Appointment.findByIdAndUpdate(id, data, { new: true });
};

export const deleteAppointment = async (id) => {
  return Appointment.findByIdAndDelete(id);
};


export const getUpcomingAppointments = async (technicianId = null) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filter = {
    appointmentDate: { $gte: today },
    status: { $in: ["scheduled", "confirmed"] },
  };

  if (technicianId) {
    filter.assignedTo = technicianId;
  }

  return Appointment.find(filter)
    .populate("service", "name estimatedDuration")
    .populate("assignedTo", "name")
    .sort({ appointmentDate: 1, appointmentTime: 1 })
    .limit(20);
};


export const getAppointmentsByDate = async (date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return Appointment.find({
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
  })
    .populate("service", "name")
    .populate("assignedTo", "name")
    .sort({ appointmentTime: 1 });
};


export const getTodayAppointments = async (technicianId = null) => {
  const today = new Date();
  return getAppointmentsByDate(today).then((appointments) => {
    if (technicianId) {
      return appointments.filter(
        (apt) => apt.assignedTo && apt.assignedTo._id.toString() === technicianId
      );
    }
    return appointments;
  });
};
