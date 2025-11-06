import * as AppointmentService from "../services/appointment.service.js";
import { success, error } from "../utils/response.js";

export const createAppointmentHandler = async (req, res) => {
  try {
    const appointment = await AppointmentService.createAppointment(req.body);
    return success(res, appointment, "Appointment created", 201);
  } catch (err) {
    return error(res, "Failed to create appointment", 500, err.message);
  }
};

export const listAppointmentsHandler = async (req, res) => {
  try {
    const appointments = await AppointmentService.getAppointments();
    return success(res, appointments, "Appointments fetched");
  } catch (err) {
    return error(res, "Failed to fetch appointments", 500, err.message);
  }
};

export const getAppointmentHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await AppointmentService.getAppointmentById(id);
    if (!appointment) return error(res, "Appointment not found", 404);
    return success(res, appointment, "Appointment fetched");
  } catch (err) {
    return error(res, "Failed to fetch appointment", 500, err.message);
  }
};

export const updateAppointmentHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await AppointmentService.updateAppointment(id, req.body);
    if (!updated) return error(res, "Appointment not found", 404);
    return success(res, updated, "Appointment updated");
  } catch (err) {
    return error(res, "Failed to update appointment", 500, err.message);
  }
};

export const deleteAppointmentHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await AppointmentService.deleteAppointment(id);
    return success(res, null, "Appointment deleted", 204);
  } catch (err) {
    return error(res, "Failed to delete appointment", 500, err.message);
  }
};

export const getUpcomingAppointmentsHandler = async (req, res) => {
  try {
    const { technicianId } = req.query;
    const appointments = await AppointmentService.getUpcomingAppointments(technicianId);
    return success(res, appointments, "Upcoming appointments fetched");
  } catch (err) {
    return error(res, "Failed to fetch upcoming appointments", 500, err.message);
  }
};

export const getTodayAppointmentsHandler = async (req, res) => {
  try {
    const { technicianId } = req.query;
    const appointments = await AppointmentService.getTodayAppointments(technicianId);
    return success(res, appointments, "Today's appointments fetched");
  } catch (err) {
    return error(res, "Failed to fetch today's appointments", 500, err.message);
  }
};

export const getAppointmentsByDateHandler = async (req, res) => {
  try {
    const { date } = req.params;
    const appointments = await AppointmentService.getAppointmentsByDate(date);
    return success(res, appointments, "Appointments fetched");
  } catch (err) {
    return error(res, "Failed to fetch appointments", 500, err.message);
  }
};
