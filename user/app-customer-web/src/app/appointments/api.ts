// File: app/appointments/api.ts
import { appointmentApi, userApi } from "@/app/auth/api";
import type { CustomerVehicle } from "@/app/auth/auth";

// Type for the detailed vehicle data from the user-service
export type VehicleAppointmentDetails = {
  vehicleId: string;
  noPlate: string;
  chaseNo: string;
  vehicleType: string;
  vehicleBrand: string;
  customerId: string; // Note: This is a string in user-service, number in auth-service
  customerPhone: string;
  customerName: string;
  millage: number;
  lastServiceDate: string | null; // "YYYY-MM-DD"
  vehicleModelYear: number | null;
  vehicleRegistrationYear: number | null;
  vehicleModel: string | null;
};

// Type for the prediction response from appointment-service
export type AppointmentPrediction = {
  suggestedStartDate: string; // "YYYY-MM-DD"
  predictedDuration: number;
  confidence: number;
};

// Payload for the prediction request
export type PredictionRequest = {
  vehicleId: string;
  repairType: string;
  millage: number;
};

// Payload for the final appointment creation
export type AppointmentRequest = {
  vehicleId: string;
  manualStartDate: string | null; // "YYYY-MM-DD"
  repairType: string;
  description: string;
};

// Response from creating the appointment
export type AppointmentResponse = {
  id: number;
  vehicleId: string;
  status: string;
  // ... (add other fields from your AppointmentResponseDto if needed)
};

/**
 * Fetches the list of vehicles for the appointment dropdown.
 * Calls the appointment-service.
 */
export async function fetchMyVehicles(): Promise<CustomerVehicle[]> {
  const { data } = await appointmentApi.get<CustomerVehicle[]>(
    "/api/appointments/my-vehicles"
  );
  return data ?? [];
}

/**
 * Fetches the detailed data for a selected vehicle to auto-fill the form.
 * Calls the user-service directly.
 */
export async function fetchVehicleAppointmentDetails(
  vehicleId: string
): Promise<VehicleAppointmentDetails> {
  const { data } = await userApi.get<VehicleAppointmentDetails>(
    `/api/vehicles/${encodeURIComponent(vehicleId)}/appointment-details`
  );
  return data;
}

/**
 * Gets the real-time prediction from the appointment-service.
 */
export async function getAppointmentPrediction(
  payload: PredictionRequest
): Promise<AppointmentPrediction> {
  const { data } = await appointmentApi.post<AppointmentPrediction>(
    "/api/appointments/predict",
    payload
  );
  return data;
}

/**
 * Submits the final form to create the appointment.
 */
export async function createAppointment(
  payload: AppointmentRequest
): Promise<AppointmentResponse> {
  const { data } = await appointmentApi.post<AppointmentResponse>(
    "/api/appointments",
    payload
  );
  return data;
}