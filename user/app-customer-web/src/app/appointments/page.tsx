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

// A custom hook for debouncing (unchanged)
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

// Define repair types (unchanged)
const repairTypes = [
  "General Service",
  "Body Repair",
  "Engine Repair",
  "Electrical Repair",
  "AC Repair",
  "Other",
];

// Form state (unchanged)
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

// --- Helper: Loading Skeleton ---
function SkeletonLoader() {
  return (
    <div className="w-full h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
  );
}

// Minimal iOS-style feedback component
function FeedbackToast({ 
  type, 
  message,
  onDismiss 
}: { 
  type: "success" | "error";
  message: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 
      max-w-md w-[90%] bg-white dark:bg-gray-900 rounded-xl p-4 shadow-lg border
      ${type === "success" 
        ? "border-green-200 dark:border-green-800" 
        : "border-red-200 dark:border-red-800"
      } transition-all duration-300 ease-in-out`}>
      <div className="flex items-center space-x-3">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center
          ${type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {type === "success" ? (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <p className="text-sm font-medium text-gray-900 dark:text-white flex-1">{message}</p>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function AppointmentContent() {
  const { customer } = useAuth();

  // State for data (unchanged)
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
  const [details, setDetails] = useState<VehicleAppointmentDetails | null>(null);
  const [prediction, setPrediction] = useState<AppointmentPrediction | null>(
    null
  );

  // State for form inputs (unchanged)
  const [form, setForm] = useState<AppointmentForm>(initialForm);

  // State for UI (unchanged)
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // --- 1. Fetch Vehicle List on Load (unchanged) ---
  useEffect(() => {
    async function loadVehicles() {
      if (!customer) return;
      try {
        setLoadingVehicles(true);
        const myVehicles = await fetchMyVehicles();
        setVehicles(myVehicles);
        if (myVehicles.length > 0) {
          setForm((f) => ({ ...f, vehicleId: myVehicles[0].vehicleId }));
        }
      } catch (error) {
        console.error("Failed to fetch vehicles", error);
        setFeedback({
          type: "error",
          message: "Could not load your vehicles.",
        });
      } finally {
        setLoadingVehicles(false);
      }
    }
    loadVehicles();
  }, [customer]);

  // --- 2. Fetch Vehicle Details on Selection Change (unchanged) ---
  useEffect(() => {
    async function loadDetails() {
      if (!form.vehicleId) return;

      try {
        setLoadingDetails(true);
        setDetails(null);
        setPrediction(null); // Clear old prediction
        const vehicleDetails = await fetchVehicleAppointmentDetails(
          form.vehicleId
        );
        setDetails(vehicleDetails);
        setForm((f) => ({ ...f, mileage: vehicleDetails.millage.toString() }));
      } catch (error) {
        console.error("Failed to fetch vehicle details", error);
        setFeedback({
          type: "error",
          message: "Could not load vehicle details.",
        });
      } finally {
        setLoadingDetails(false);
      }
    }
    loadDetails();
  }, [form.vehicleId]);

  // --- 3. Get Real-Time Prediction (Debounced) (unchanged) ---
  const debouncedMileage = useDebounce(form.mileage, 500);
  const debouncedRepairType = useDebounce(form.repairType, 500);

  useEffect(() => {
    async function getPrediction() {
      const millageNum = parseInt(debouncedMileage, 10);
      if (
        !form.vehicleId ||
        !debouncedRepairType ||
        isNaN(millageNum) ||
        millageNum <= 0
      ) {
        setPrediction(null);
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
        setPrediction(null);
      } finally {
        setLoadingPrediction(false);
      }
    }
    getPrediction();
  }, [form.vehicleId, debouncedMileage, debouncedRepairType]);

  // --- 4. Handle Form Submission (unchanged) ---
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
        manualStartDate: form.manualStartDate || null,
      };

      const response = await createAppointment(payload);

      setFeedback({
        type: "success",
        message: `Appointment (ID: ${response.id}) created successfully! Status: ${response.status}.`,
      });
      setForm((f) => ({ ...initialForm, vehicleId: f.vehicleId }));
      setDetails(null);
      setPrediction(null);
      setForm((f) => ({ ...f, vehicleId: "" }));
      setTimeout(
        () => setForm((f) => ({ ...f, vehicleId: payload.vehicleId })),
        0
      );
    } catch (error: any) {
      console.error("Failed to create appointment", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create appointment.";
      setFeedback({ type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Helper for form changes (with mileage cap and date validation) ---
  function handleChange<K extends keyof AppointmentForm>(
    key: K,
    value: AppointmentForm[K]
  ) {
    if (key === "mileage") {
      const numValue = Number(value);
      if (numValue >= 1000000) {
        return; // Enforce cap
      }
    }
    
    if (key === "manualStartDate" && value && prediction) {
      const selectedDate = new Date(value + "T00:00:00");
      const suggestedDate = new Date(prediction.suggestedStartDate + "T00:00:00");
      
      if (selectedDate <= suggestedDate) {
        setFeedback({
          type: "error",
          message: "Preferred date must be after the suggested date."
        });
        return;
      }
    }
    
    setForm((current) => ({ ...current, [key]: value }));
  }

  // Get minimum date for preferred date input
  const getMinPreferredDate = () => {
    if (prediction) {
      const suggestedDate = new Date(prediction.suggestedStartDate + "T00:00:00");
      const nextDay = new Date(suggestedDate);
      nextDay.setDate(suggestedDate.getDate() + 1);
      return nextDay.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  };

  const customerName = details?.customerName || customer?.name;

  return (
    <>
      {/* Minimal Feedback Toast */}
      {feedback && (
        <FeedbackToast
          type={feedback.type}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      )}

      <section className="min-h-screen bg-gray-50 dark:bg-black py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-3">
              Book Appointment
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Select your vehicle and service type. We'll suggest the perfect time for your appointment.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Prediction Card */}
            <div className="lg:col-span-1 space-y-6">
              {/* Prediction Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Smart Suggestion
                  </h2>
                </div>

                <div className="space-y-4">
                  {loadingPrediction && (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Analyzing your request...</span>
                      </div>
                    </div>
                  )}
                  
                  {!loadingPrediction && !prediction && (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Complete the form to see our smart date suggestion
                      </p>
                    </div>
                  )}

                  {prediction && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Suggested Date</span>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {new Date(prediction.suggestedStartDate + "T00:00:00").toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-100 dark:border-green-800">
                          <p className="text-xs text-green-600 dark:text-green-400 mb-1">Duration</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {prediction.predictedDuration} days
                          </p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-100 dark:border-purple-800">
                          <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Confidence</p>
                          <div className="flex items-center space-x-1">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div 
                                className="bg-purple-500 dark:bg-purple-400 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${prediction.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-gray-900 dark:text-white">
                              {(prediction.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                  {/* Form Header */}
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      Appointment Details
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Fill in your vehicle and service information
                    </p>
                  </div>

                  {/* Form Content */}
                  <div className="p-6 space-y-8">
                    {/* Vehicle Selection */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">1</span>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          Select Vehicle
                        </h3>
                      </div>
                      
                      {loadingVehicles ? (
                        <SkeletonLoader />
                      ) : (
                        <select
                          value={form.vehicleId}
                          onChange={(e) => handleChange("vehicleId", e.target.value)}
                          required
                          disabled={loadingVehicles || vehicles.length === 0}
                          className="w-full h-12 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 appearance-none cursor-pointer"
                        >
                          <option value="" disabled>
                            {vehicles.length === 0
                              ? "No vehicles found"
                              : "Choose your vehicle"}
                          </option>
                          {vehicles.map((v) => (
                            <option key={v.vehicleId} value={v.vehicleId}>
                              {v.vehicleBrand} {v.vehicleModel} ({v.noPlate})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Vehicle Details */}
                    {details && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <span className="text-green-600 dark:text-green-400 font-medium text-sm">2</span>
                          </div>
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                            Vehicle Information
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Customer Name
                            </label>
                            <input
                              value={customerName}
                              disabled
                              className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white disabled:opacity-50"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Phone Number
                            </label>
                            <input
                              value={details.customerPhone || "Not Set"}
                              disabled
                              className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white disabled:opacity-50"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Vehicle Model
                            </label>
                            <input
                              value={details.vehicleBrand + " " + details.vehicleModel}
                              disabled
                              className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white disabled:opacity-50"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Chassis Number
                            </label>
                            <input
                              value={details.chaseNo}
                              disabled
                              className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white disabled:opacity-50"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Service Details */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <span className="text-purple-600 dark:text-purple-400 font-medium text-sm">3</span>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          Service Details
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Service Type
                          </label>
                          <select
                            value={form.repairType}
                            onChange={(e) => handleChange("repairType", e.target.value)}
                            disabled={!details}
                            className="w-full h-12 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:ring-1 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all duration-200 appearance-none cursor-pointer disabled:opacity-50"
                          >
                            {repairTypes.map((service) => (
                              <option key={service} value={service}>
                                {service}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Current Mileage
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="999999"
                            value={form.mileage}
                            onChange={(e) => handleChange("mileage", e.target.value)}
                            disabled={!details}
                            required
                            placeholder="Enter current mileage"
                            className="w-full h-12 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-green-500 dark:focus:border-green-400 focus:ring-1 focus:ring-green-500 dark:focus:ring-green-400 transition-all duration-200 placeholder-gray-400 disabled:opacity-50"
                          />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Preferred Date (Optional)
                          </label>
                          <input
                            type="date"
                            value={form.manualStartDate}
                            onChange={(e) => handleChange("manualStartDate", e.target.value)}
                            disabled={!details}
                            min={getMinPreferredDate()}
                            className="w-full h-12 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 disabled:opacity-50"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {prediction ? 
                              `Must be after ${new Date(prediction.suggestedStartDate + "T00:00:00").toLocaleDateString()}` : 
                              "Leave empty to use our smart suggestion"
                            }
                          </p>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Additional Notes
                          </label>
                          <textarea
                            rows={3}
                            value={form.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            placeholder="Describe any specific issues, concerns, or special requests for our technicians..."
                            disabled={!details}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-gray-400 dark:focus:border-gray-500 focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 transition-all duration-200 resize-none placeholder-gray-400 disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Footer */}
                  <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        loadingDetails ||
                        loadingPrediction ||
                        !details
                      }
                      className="w-full md:w-auto min-w-[200px] h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Creating Appointment...</span>
                        </>
                      ) : (
                        <span>Confirm Appointment</span>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function AppointmentPage() {
  return (
    <Protected redirectTo="/appointments">
      <AppointmentContent />
    </Protected>
  );
}