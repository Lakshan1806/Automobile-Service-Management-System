"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Protected } from "@/app/auth/Protected";
import { useAuth } from "@/app/auth/AuthContext";
import {
  cacheVehicles,
  fetchCustomerVehicles,
  readCachedVehicles,
  type CustomerVehicle,
} from "@/app/auth/auth";
import { userApi } from "@/app/auth/api";

type GarageVehicle = {
  vehicleId: string;
  numberPlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleType?: string | null;
  vehicleModelYear?: number | null;
  vehicleRegistrationYear?: number | null;
  mileage?: number | null;
  lastServiceDate?: string | null;
};

type VehicleForm = {
  numberPlate: string;
  chassisNo: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleType: string;
  mileage: string;
  vehicleModelYear: string;
  vehicleRegistrationYear: string;
  lastServiceDate: string;
};

const VEHICLE_TYPES = [
  { value: "CAR", label: "Car" },
  { value: "SUV", label: "SUV" },
  { value: "TRUCK", label: "Truck" },
  { value: "VAN", label: "Van" },
  { value: "MOTORCYCLE", label: "Motorcycle" },
  { value: "OTHER", label: "Other" },
] as const;

const initialForm: VehicleForm = {
  numberPlate: "",
  chassisNo: "",
  vehicleBrand: "",
  vehicleModel: "",
  vehicleType: "CAR",
  mileage: "",
  vehicleModelYear: "",
  vehicleRegistrationYear: "",
  lastServiceDate: "",
};

function customerVehicleToGarage(vehicle: CustomerVehicle): GarageVehicle {
  return {
    vehicleId: vehicle.vehicleId,
    numberPlate: vehicle.noPlate,
    vehicleBrand: vehicle.vehicleBrand,
    vehicleModel: vehicle.vehicleModel,
  };
}

function serverVehicleToGarage(vehicle: unknown): GarageVehicle {
  if (!vehicle || typeof vehicle !== "object") {
    throw new Error("Vehicle payload missing");
  }
  const record = vehicle as Record<string, unknown>;
  const idCandidate = record.vehicleId ?? record._id ?? record.id;
  const vehicleId =
    typeof idCandidate === "string"
      ? idCandidate
      : typeof (idCandidate as { toString?: () => string })?.toString ===
        "function"
        ? (idCandidate as { toString: () => string }).toString()
        : `tmp-${Date.now()}`;

  const numberPlate =
    typeof record.numberPlate === "string"
      ? record.numberPlate
      : typeof record.noPlate === "string"
        ? record.noPlate
        : "";
  const mileage =
    typeof record.mileage === "number"
      ? record.mileage
      : Number.isFinite(Number(record.mileage))
        ? Number(record.mileage)
        : null;

  let lastService: string | null = null;
  if (record.lastServiceDate) {
    const date = new Date(record.lastServiceDate as string);
    if (!Number.isNaN(date.getTime())) {
      lastService = date.toISOString();
    }
  }

  return {
    vehicleId,
    numberPlate,
    vehicleBrand:
      typeof record.vehicleBrand === "string" ? record.vehicleBrand : "",
    vehicleModel:
      typeof record.vehicleModel === "string" ? record.vehicleModel : "",
    vehicleType:
      typeof record.vehicleType === "string" ? record.vehicleType : null,
    mileage,
    vehicleModelYear:
      typeof record.vehicleModelYear === "number"
        ? record.vehicleModelYear
        : null,
    vehicleRegistrationYear:
      typeof record.vehicleRegistrationYear === "number"
        ? record.vehicleRegistrationYear
        : null,
    lastServiceDate: lastService,
  };
}

function garageVehicleToCache(vehicle: GarageVehicle): CustomerVehicle {
  return {
    vehicleId: vehicle.vehicleId,
    noPlate: vehicle.numberPlate,
    vehicleBrand: vehicle.vehicleBrand,
    vehicleModel: vehicle.vehicleModel,
  };
}

function AccountContent() {
  const { customer } = useAuth();
  const [vehicles, setVehicles] = useState<GarageVehicle[]>(() =>
    readCachedVehicles().map(customerVehicleToGarage),
  );
  const [form, setForm] = useState<VehicleForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<null | {
    type: "success" | "error";
    message: string;
  }>(null);

  useEffect(() => {
    if (!customer?.id) {
      return;
    }

    let active = true;
    setLoading(true);
    fetchCustomerVehicles(customer.id)
      .then((result) => {
        if (!active) {
          return;
        }
        const normalized = result.map(customerVehicleToGarage);
        setVehicles(normalized);
        cacheVehicles(result);
      })
      .catch((error) => {
        console.error("Unable to load vehicles", error);
        if (active) {
          setFeedback({
            type: "error",
            message:
              "We could not load your vehicles. Please try again in a moment.",
          });
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [customer?.id]);

  function handleChange<K extends keyof VehicleForm>(
    key: K,
    value: VehicleForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customer?.id) {
      return;
    }

    setFeedback(null);
    setSubmitting(true);

    const payload = {
      numberPlate: form.numberPlate.trim().toUpperCase(),
      chassisNo: form.chassisNo.trim().toUpperCase(),
      vehicleBrand: form.vehicleBrand.trim(),
      vehicleModel: form.vehicleModel.trim(),
      vehicleType: form.vehicleType,
      mileage: form.mileage ? Number(form.mileage) : undefined,
      vehicleModelYear: form.vehicleModelYear
        ? Number(form.vehicleModelYear)
        : undefined,
      vehicleRegistrationYear: form.vehicleRegistrationYear
        ? Number(form.vehicleRegistrationYear)
        : undefined,
      lastServiceDate: form.lastServiceDate || undefined,
    };

    try {
      const { data } = await userApi.post<{ vehicle: unknown }>(
        `/api/customers/${encodeURIComponent(customer.id)}/vehicles`,
        payload,
      );
      const created = serverVehicleToGarage(data.vehicle);
      setVehicles((current) => {
        const next = [...current, created];
        cacheVehicles(next.map(garageVehicleToCache));
        return next;
      });
      setFeedback({
        type: "success",
        message: `Vehicle ${created.numberPlate} was added to your garage.`,
      });
      setForm(initialForm);
    } catch (error) {
      console.error("Failed to add vehicle", error);
      let message =
        "We could not add that vehicle. Please review the details and try again.";
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response
      ) {
        const data = (error.response as { data?: unknown }).data;
        if (
          data &&
          typeof data === "object" &&
          "message" in data &&
          typeof (data as { message?: unknown }).message === "string"
        ) {
          message = (data as { message: string }).message;
        }
      }
      setFeedback({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  }

  const totalVehicles = vehicles.length;
  const brandCount = useMemo(() => {
    return new Set(vehicles.map((vehicle) => vehicle.vehicleBrand)).size;
  }, [vehicles]);

  return (
    <section className="section">
      <div className="container hero-content">
        <div>
          <p className="eyebrow">Account overview</p>
          <h1>Your NovaDrive garage</h1>
          <p>
            Register every vehicle tied to your NovaDrive account. Accurate
            records help technicians verify ownership, dispatch roadside
            support, and tailor maintenance plans.
          </p>
          <div className="stats-grid">
            <article>
              <p className="eyebrow">Vehicles on file</p>
              <h3>{totalVehicles}</h3>
            </article>
            <article>
              <p className="eyebrow">Brands represented</p>
              <h3>{brandCount}</h3>
            </article>
            <article>
              <p className="eyebrow">Last update</p>
              <h3>
                {vehicles.length > 0
                  ? new Date(
                      vehicles[vehicles.length - 1].lastServiceDate ??
                        Date.now(),
                    ).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </h3>
            </article>
          </div>
        </div>

        <form className="form-card" onSubmit={handleSubmit}>
          <p className="eyebrow">Add vehicle</p>
          <h2>Register a new vehicle</h2>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="numberPlate">Number plate*</label>
              <input
                id="numberPlate"
                value={form.numberPlate}
                onChange={(event) =>
                  handleChange("numberPlate", event.target.value.toUpperCase())
                }
                placeholder="ABC-1234"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="chassisNo">Chassis / VIN*</label>
              <input
                id="chassisNo"
                value={form.chassisNo}
                onChange={(event) =>
                  handleChange("chassisNo", event.target.value.toUpperCase())
                }
                placeholder="17-character VIN"
                minLength={11}
                maxLength={17}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="vehicleBrand">Make / brand*</label>
              <input
                id="vehicleBrand"
                value={form.vehicleBrand}
                onChange={(event) =>
                  handleChange("vehicleBrand", event.target.value)
                }
                placeholder="NovaDrive"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="vehicleModel">Model*</label>
              <input
                id="vehicleModel"
                value={form.vehicleModel}
                onChange={(event) =>
                  handleChange("vehicleModel", event.target.value)
                }
                placeholder="Pulse EV"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="vehicleType">Vehicle type</label>
              <select
                id="vehicleType"
                value={form.vehicleType}
                onChange={(event) =>
                  handleChange("vehicleType", event.target.value)
                }
              >
                {VEHICLE_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="vehicleModelYear">Model year</label>
              <input
                id="vehicleModelYear"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.vehicleModelYear}
                onChange={(event) =>
                  handleChange("vehicleModelYear", event.target.value)
                }
                placeholder="2024"
              />
            </div>
            <div className="form-field">
              <label htmlFor="vehicleRegistrationYear">Registration year</label>
              <input
                id="vehicleRegistrationYear"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.vehicleRegistrationYear}
                onChange={(event) =>
                  handleChange("vehicleRegistrationYear", event.target.value)
                }
                placeholder="2023"
              />
            </div>
            <div className="form-field">
              <label htmlFor="mileage">Current mileage</label>
              <input
                id="mileage"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.mileage}
                onChange={(event) =>
                  handleChange("mileage", event.target.value.replace(/\D/g, ""))
                }
                placeholder="24500"
              />
            </div>
            <div className="form-field">
              <label htmlFor="lastServiceDate">Last service date</label>
              <input
                id="lastServiceDate"
                type="date"
                value={form.lastServiceDate}
                onChange={(event) =>
                  handleChange("lastServiceDate", event.target.value)
                }
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="button primary" type="submit" disabled={submitting}>
              {submitting ? "Adding vehicle..." : "Add to garage"}
            </button>
          </div>
          {feedback && (
            <div
              className={`feedback ${feedback.type === "error" ? "error" : ""}`}
              role="status"
              aria-live="polite"
            >
              {feedback.message}
            </div>
          )}
        </form>
      </div>

      <div className="container vehicle-list" aria-live="polite">
        {loading ? (
          <article className="vehicle-card">
            <p>Loading your vehicles...</p>
          </article>
        ) : vehicles.length === 0 ? (
          <article className="vehicle-card">
            <h3>No vehicles yet</h3>
            <p>
              Add your first vehicle to unlock roadside assistance and service
              scheduling.
            </p>
          </article>
        ) : (
          vehicles.map((vehicle) => {
            const lastServiceLabel = vehicle.lastServiceDate
              ? new Date(vehicle.lastServiceDate).toLocaleDateString(
                  undefined,
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  },
                )
              : "Not recorded";
            return (
              <article key={vehicle.vehicleId} className="vehicle-card">
                <div className="vehicle-header">
                  <div>
                    <h3>
                      {vehicle.vehicleBrand} {vehicle.vehicleModel}
                    </h3>
                    <p>{vehicle.numberPlate}</p>
                  </div>
                  {vehicle.vehicleType && (
                    <span className="primary-badge">{vehicle.vehicleType}</span>
                  )}
                </div>
                <div className="vehicle-meta">
                  <p>
                    <strong>Model year:</strong>{" "}
                    {vehicle.vehicleModelYear ?? "—"}
                  </p>
                  <p>
                    <strong>Registration year:</strong>{" "}
                    {vehicle.vehicleRegistrationYear ?? "—"}
                  </p>
                  <p>
                    <strong>Mileage:</strong>{" "}
                    {vehicle.mileage !== null && vehicle.mileage !== undefined
                      ? `${vehicle.mileage.toLocaleString()} km`
                      : "—"}
                  </p>
                  <p>
                    <strong>Last service:</strong> {lastServiceLabel}
                  </p>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

export default function AccountPage() {
  return (
    <Protected redirectTo="/account">
      <AccountContent />
    </Protected>
  );
}
