"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/AuthContext";
import {
  readCachedVehicles,
  type CustomerVehicle,
} from "@/app/auth/auth";
import { locationApi } from "@/app/auth/api";
import { saveActiveRequest } from "@/app/roadside-assistance/activeRequestStorage";

type RequestForm = {
  vehicleId: string;
  description: string;
};

const initialForm: RequestForm = {
  vehicleId: "",
  description: "",
};

type RoadsidePayload = {
  customer: {
    id: string;
    name: string;
    email: string;
  };
  vehicle: {
    id: string;
    brand: string;
    model: string;
    numberPlate: string;
  };
  description: string;
};

type RoadsideSubmitResponse = {
  requestId: string;
  reference: string;
  status: string;
};

export default function RoadsideAssistancePage() {
  const router = useRouter();
  const { customer } = useAuth();
  const [form, setForm] = useState<RequestForm>(initialForm);
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setVehicles(readCachedVehicles());
  }, []);

  useEffect(() => {
    setForm((current) => {
      if (current.vehicleId || vehicles.length === 0) {
        return current;
      }
      return { ...current, vehicleId: vehicles[0].vehicleId };
    });
  }, [vehicles]);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.vehicleId === form.vehicleId) ?? null,
    [form.vehicleId, vehicles],
  );

  function handleChange<K extends keyof RequestForm>(key: K, value: RequestForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customer || !selectedVehicle) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);
    setError(null);

    const payload: RoadsidePayload = {
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
      },
      vehicle: {
        id: selectedVehicle.vehicleId,
        brand: selectedVehicle.vehicleBrand,
        model: selectedVehicle.vehicleModel,
        numberPlate: selectedVehicle.noPlate,
      },
      description: form.description.trim(),
    };

    if (!payload.description) {
      setError("Tell us what happened so we can dispatch the right help.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data } = await locationApi.post<RoadsideSubmitResponse>(
        "/api/roadside/requests",
        payload,
      );
      setSuccessMessage(
        `Your request has been sent. Your request id is ${data.reference}. A technician will reach out to you shortly.`,
      );
      setForm((current) => ({ ...current, description: "" }));
      saveActiveRequest({
        requestId: data.requestId,
        reference: data.reference,
        status: data.status,
      });
      router.push(`/tracking?requestId=${data.requestId}`);
    } catch (submissionError) {
      console.error(
        "Failed to submit roadside assistance request:",
        submissionError,
      );
      let message = "We could not submit your request. Please try again.";
      if (
        submissionError &&
        typeof submissionError === "object" &&
        "response" in submissionError
      ) {
        const response = submissionError.response as {
          data?: unknown;
        };
        const data = response?.data;
        if (
          data &&
          typeof data === "object" &&
          "message" in data &&
          typeof (data as { message?: unknown }).message === "string"
        ) {
          message = (data as { message: string }).message;
        }
      } else if (
        submissionError instanceof Error &&
        submissionError.message
      ) {
        message = submissionError.message;
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="section">
      <div className="container hero-content">
        <div>
          <p className="eyebrow">24/7 coverage</p>
          <h1>NovaDrive Roadside Assistance</h1>
          <p>
            From flat tires to towing, our dedicated response team keeps you
            moving. Share a few details and we will dispatch the nearest
            certified technician.
          </p>
          <div className="card">
            <h3>What you can expect</h3>
            <ul>
              <li>Immediate driver verification to protect your vehicle.</li>
              <li>Real-time GPS tracking and technician arrival updates.</li>
              <li>On-site diagnostics with optional transport to service hubs.</li>
            </ul>
          </div>
        </div>

        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Request help now</h2>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="vehicle">Vehicle</label>
              <select
                id="vehicle"
                value={form.vehicleId}
                onChange={(event) => handleChange("vehicleId", event.target.value)}
                required
                disabled={!customer || vehicles.length === 0}
              >
                <option value="" disabled>
                  Select your vehicle
                </option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                    {vehicle.vehicleBrand} {vehicle.vehicleModel} • {vehicle.noPlate}
                  </option>
                ))}
              </select>
              {!customer && (
                <p className="muted">Sign in to choose from your NovaDrive garage.</p>
              )}
              {customer && vehicles.length === 0 && (
                <p className="muted">Add a vehicle in your account to request roadside help.</p>
              )}
            </div>
            {selectedVehicle && (
              <div className="form-field">
                <p className="muted">
                  Selected vehicle:&nbsp;
                  <strong>
                    {selectedVehicle.vehicleBrand} {selectedVehicle.vehicleModel} • {selectedVehicle.noPlate}
                  </strong>
                </p>
              </div>
            )}
            <div className="form-field">
              <label htmlFor="description">What happened?</label>
              <textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={(event) => handleChange("description", event.target.value)}
                placeholder="Flat tire on I-94 near exit 210..."
                required
                disabled={!customer || vehicles.length === 0}
              />
            </div>
          </div>
          <div className="form-actions">
            <button
              className="button primary"
              type="submit"
              disabled={!customer || vehicles.length === 0 || isSubmitting}
            >
              {isSubmitting ? "Submitting request..." : "Send request"}
            </button>
          </div>
          {error && (
            <div className="feedback error" role="alert">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="feedback" role="status" aria-live="polite">
              {successMessage}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

