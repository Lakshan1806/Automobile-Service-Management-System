// File: app/appointments/page.tsx
"use client";

import { FormEvent, useEffect, useMemo, useState, useCallback } from "react";
import { Protected } from "@/app/auth/Protected";
import { useAuth } from "@/app/auth/AuthContext";
import {
  fetchMyVehicles,
  fetchVehicleAppointmentDetails,
  getAppointmentPrediction,
  createAppointment,
  type VehicleAppointmentDetails,
  type AppointmentPrediction,
} from "@/app/appointments/api";
import type { CustomerVehicle } from "@/app/auth/auth";

// A custom hook for debouncing
function useDebounce(value: any, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// Define repair types
const repairTypes = [
  "General Service",
  "Body Repair",
  "Engine Repair",
  "Electrical Repair",
  "AC Repair",
  "Other",
];

// Form state
type AppointmentForm = {
  vehicleId: string;
  repairType: string;
  mileage: string;
  description: string;
  manualStartDate: string; // "YYYY-MM-DD"
};

const initialForm: AppointmentForm = {
  vehicleId: "",
  repairType: repairTypes[0],
  mileage: "",
  description: "",
  manualStartDate: "",
};

function AppointmentContent() {
  const { customer } = useAuth();
  
  // State for data
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
  const [details, setDetails] = useState<VehicleAppointmentDetails | null>(null);
  const [prediction, setPrediction] = useState<AppointmentPrediction | null>(null);
  
  // State for form inputs
  const [form, setForm] = useState<AppointmentForm>(initialForm);
  
  // State for UI
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // --- 1. Fetch Vehicle List on Load ---
  useEffect(() => {
    async function loadVehicles() {
      if (!customer) return;
      try {
        setLoadingVehicles(true);
        const myVehicles = await fetchMyVehicles();
        setVehicles(myVehicles);
        // Auto-select first vehicle
        if (myVehicles.length > 0) {
          setForm((f) => ({ ...f, vehicleId: myVehicles[0].vehicleId }));
        }
      } catch (error) {
        console.error("Failed to fetch vehicles", error);
        setFeedback({ type: 'error', message: 'Could not load your vehicles.' });
      } finally {
        setLoadingVehicles(false);
      }
    }
    loadVehicles();
  }, [customer]);

  // --- 2. Fetch Vehicle Details on Selection Change ---
  useEffect(() => {
    async function loadDetails() {
      if (!form.vehicleId) return;

      try {
        setLoadingDetails(true);
        setDetails(null);
        setPrediction(null); // Clear old prediction
        const vehicleDetails = await fetchVehicleAppointmentDetails(form.vehicleId);
        setDetails(vehicleDetails);
        // Auto-fill mileage from details
        setForm((f) => ({ ...f, mileage: vehicleDetails.millage.toString() }));
      } catch (error) {
        console.error("Failed to fetch vehicle details", error);
        setFeedback({ type: 'error', message: 'Could not load vehicle details.' });
      } finally {
        setLoadingDetails(false);
      }
    }
    loadDetails();
  }, [form.vehicleId]);

  // --- 3. Get Real-Time Prediction (Debounced) ---
  const debouncedMileage = useDebounce(form.mileage, 500);
  const debouncedRepairType = useDebounce(form.repairType, 500);

  useEffect(() => {
    async function getPrediction() {
      const millageNum = parseInt(debouncedMileage, 10);
      
      // Check if we have all required data
      if (!form.vehicleId || !debouncedRepairType || isNaN(millageNum) || millageNum <= 0) {
        setPrediction(null); // Not enough data, clear prediction
        return;
      }

      try {
        setLoadingPrediction(true);
        setPrediction(null);
        const predictionData = await getAppointmentPrediction({
          vehicleId: form.vehicleId,
          repairType: debouncedRepairType,
          millage: millageNum,
        });
        setPrediction(predictionData);
      } catch (error) {
        console.error("Failed to get prediction", error);
        // Don't show an error, just clear the prediction
        setPrediction(null);
      } finally {
        setLoadingPrediction(false);
      }
    }
    getPrediction();
  }, [form.vehicleId, debouncedMileage, debouncedRepairType]);

  // --- 4. Handle Form Submission ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.vehicleId || !form.repairType) return;
    
    setIsSubmitting(true);
    setFeedback(null);
    
    try {
      const payload = {
        vehicleId: form.vehicleId,
        repairType: form.repairType,
        description: form.description,
        manualStartDate: form.manualStartDate || null, // Send null if empty
      };
      
      const response = await createAppointment(payload);
      
      setFeedback({ 
        type: 'success', 
        message: `Appointment (ID: ${response.id}) created successfully! Status: ${response.status}.`
      });
      // Reset form (except vehicle list)
      setForm(f => ({ ...initialForm, vehicleId: f.vehicleId }));
      setDetails(null); // Clear details to trigger reload
      setPrediction(null);
      // Trigger detail refetch for the selected vehicle
      setForm(f => ({...f, vehicleId: ""}));
      setTimeout(() => setForm(f => ({...f, vehicleId: payload.vehicleId})), 0);

    } catch (error: any) {
      console.error("Failed to create appointment", error);
      const message = error.response?.data?.message || error.message || "Failed to create appointment.";
      setFeedback({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for form changes
  function handleChange<K extends keyof AppointmentForm>(key: K, value: AppointmentForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  // Get customer name for display
  const customerName = details?.customerName || customer?.name;

  return (
    <section className="section">
      <div className="hero-content container">
        {/* Column 1: Info */}
        <div>
          <p className="eyebrow">Plan your visit</p>
          <h1>Book an Appointment</h1>
          <p>
            Select your vehicle and tell us what you need. Our system will
            suggest the best date based on parts and technician availability.
          </p>
          <div className="card">
            <h3>Prediction Details</h3>
            {loadingPrediction && <p>Loading suggestion...</p>}
            {!loadingPrediction && !prediction && (
              <p>
                Please select a vehicle and repair type to get a date suggestion.
              </p>
            )}
            {prediction && (
              <ul>
                <li>
                  <strong>Suggested Date:</strong>{" "}
                  {new Date(prediction.suggestedStartDate + "T00:00:00").toLocaleDateString()}
                </li>
                <li>
                  <strong>Estimated Duration:</strong>{" "}
                  {prediction.predictedDuration} days
                </li>
                <li>
                  <strong>Confidence:</strong>{" "}
                  {(prediction.confidence * 100).toFixed(0)}%
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Column 2: Form */}
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Appointment Details</h2>
          
          {loadingVehicles && <p>Loading your garage...</p>}
          
          {feedback && (
            <div className={`feedback ${feedback.type === "error" ? "error" : ""}`} role="status">
              {feedback.message}
            </div>
          )}

          <div className="form-grid">
            {/* --- Vehicle Selection --- */}
            <div className="form-field">
              <label htmlFor="vehicle">Vehicle</label>
              <select
                id="vehicle"
                value={form.vehicleId}
                onChange={(e) => handleChange("vehicleId", e.target.value)}
                required
                disabled={loadingVehicles || vehicles.length === 0}
              >
                <option value="" disabled>
                  {loadingVehicles ? "Loading..." : "Select your vehicle"}
                </option>
                {vehicles.map((v) => (
                  <option key={v.vehicleId} value={v.vehicleId}>
                    {v.vehicleBrand} {v.vehicleModel} ({v.noPlate})
                  </option>
                ))}
              </select>
            </div>
            
            {/* --- Auto-filled Details --- */}
            {loadingDetails && <p>Loading vehicle data...</p>}
            {details && (
              <>
                <div className="form-field">
                  <label>Customer Name</label>
                  <input value={customerName} disabled />
                </div>
                <div className="form-field">
                  <label>Customer Phone</label>
                  <input value={details.customerPhone || "Not Set"} disabled />
                </div>
                <div className="form-field">
                  <label>Vehicle Model</label>
                  <input value={details.vehicleBrand + " " + details.vehicleModel} disabled />
                </div>
                <div className="form-field">
                  <label>Chassis No.</label>
                  <input value={details.chaseNo} disabled />
                </div>
                <div className="form-field">
                  <label>Last Service</label>
                  <input value={details.lastServiceDate ? new Date(details.lastServiceDate + "T00:00:00").toLocaleDateString() : "N/A"} disabled />
                </div>
              </>
            )}
            
            {/* --- User Inputs --- */}
            <div className="form-field">
              <label htmlFor="repairType">Service Type</label>
              <select
                id="repairType"
                value={form.repairType}
                onChange={(e) => handleChange("repairType", e.target.value)}
                disabled={!form.vehicleId}
              >
                {repairTypes.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="mileage">Current Mileage</label>
              <input
                id="mileage"
                type="number"
                value={form.mileage}
                onChange={(e) => handleChange("mileage", e.target.value)}
                disabled={!form.vehicleId}
                required
              />
            </div>
            
            <div className="form-field">
              <label htmlFor="manualStartDate">Preferred Date (Optional)</label>
              <input
                id="manualStartDate"
                type="date"
                value={form.manualStartDate}
                onChange={(e) => handleChange("manualStartDate", e.target.value)}
                // You can add min={prediction?.suggestedStartDate} if you want to enforce it
                disabled={!form.vehicleId}
              />
              <span className="field-hint">
                Leave blank to use our suggested date.
              </span>
            </div>
            
            <div className="form-field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="description">Notes for Technician</label>
              <textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe any concerns, warning lights, or custom requests."
                disabled={!form.vehicleId}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              className="button primary"
              type="submit"
              disabled={isSubmitting || loadingDetails || loadingPrediction || !form.vehicleId}
            >
              {isSubmitting ? "Submitting..." : "Confirm Appointment"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default function AppointmentPage() {
  return (
    <Protected redirectTo="/appointments">
      <AppointmentContent />
    </Protected>
  );
}