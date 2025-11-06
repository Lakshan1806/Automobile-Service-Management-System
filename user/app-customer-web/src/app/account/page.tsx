"use client";

import { FormEvent, useMemo, useState } from "react";
import { Protected } from "@/app/auth/Protected";

type GarageVehicle = {
  id: string;
  nickname: string;
  year: string;
  model: string;
  vin: string;
  mileage: number;
  primary: boolean;
  lastService: string;
};

const initialGarage: GarageVehicle[] = [
  {
    id: "1",
    nickname: "City Runner",
    year: "2023",
    model: "NovaDrive Pulse EV",
    vin: "NDPE-3284-XL91",
    mileage: 12450,
    primary: true,
    lastService: "October 18, 2024",
  },
  {
    id: "2",
    nickname: "Weekend Explorer",
    year: "2021",
    model: "NovaDrive Terrain AWD",
    vin: "NDTN-5821-QP33",
    mileage: 34780,
    primary: false,
    lastService: "July 2, 2024",
  },
];

type VehicleForm = {
  nickname: string;
  year: string;
  model: string;
  vin: string;
  mileage: string;
  primary: boolean;
};

const initialForm: VehicleForm = {
  nickname: "",
  year: "",
  model: "",
  vin: "",
  mileage: "",
  primary: false,
};

function AccountContent() {
  const [vehicles, setVehicles] = useState(initialGarage);
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState<null | {
    type: "success" | "error";
    message: string;
  }>(null);

  const totalMileage = useMemo(
    () => vehicles.reduce((total, vehicle) => total + vehicle.mileage, 0),
    [vehicles],
  );

  function handleChange<K extends keyof VehicleForm>(
    key: K,
    value: VehicleForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setForm(initialForm);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!form.year || !form.model || !form.vin) {
      setFeedback({
        type: "error",
        message: "Please complete the required fields.",
      });
      return;
    }

    const parsedMileage = Number(form.mileage.replace(/,/g, "")) || 0;

    const newVehicle: GarageVehicle = {
      id: Date.now().toString(36),
      nickname: form.nickname.trim() || `${form.year} ${form.model}`,
      year: form.year,
      model: form.model,
      vin: form.vin,
      mileage: parsedMileage,
      primary: form.primary,
      lastService: new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };

    setVehicles((current) => {
      const nextVehicles = form.primary
        ? current.map((vehicle) => ({ ...vehicle, primary: false }))
        : current.slice();
      return [...nextVehicles, newVehicle];
    });

    setFeedback({
      type: "success",
      message: `${newVehicle.nickname} was added to your garage.`,
    });
    resetForm();
  }

  function removeVehicle(id: string) {
    setVehicles((current) => current.filter((vehicle) => vehicle.id !== id));
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <p className="eyebrow">Your garage</p>
          <h1>Manage vehicles and preferences</h1>
          <p>
            Keep your garage synced so technicians arrive prepared. Update VIN
            details, mileage, and designate a primary vehicle for faster service
            check-ins.
          </p>
        </div>

        <div className="hero-content">
          <div className="card">
            <h3>Garage summary</h3>
            <ul>
              <li>
                <strong>{vehicles.length}</strong> vehicles connected to your
                account.
              </li>
              <li>
                <strong>{totalMileage.toLocaleString()}</strong> total recorded
                miles across your fleet.
              </li>
              <li>
                Update driver preferences to tailor reminders and valet support.
              </li>
            </ul>
          </div>

          <form className="form-card" onSubmit={handleSubmit}>
            <h2>Add a vehicle</h2>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="nickname">Nickname</label>
                <input
                  id="nickname"
                  value={form.nickname}
                  onChange={(event) =>
                    handleChange("nickname", event.target.value)
                  }
                  placeholder="Family SUV"
                />
              </div>
              <div className="form-field">
                <label htmlFor="year">Model year*</label>
                <input
                  id="year"
                  value={form.year}
                  onChange={(event) => handleChange("year", event.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="model">Make & model*</label>
                <input
                  id="model"
                  value={form.model}
                  onChange={(event) =>
                    handleChange("model", event.target.value)
                  }
                  placeholder="NovaDrive Pulse EV"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="vin">VIN*</label>
                <input
                  id="vin"
                  value={form.vin}
                  onChange={(event) =>
                    handleChange("vin", event.target.value.toUpperCase())
                  }
                  placeholder="17-character VIN"
                  minLength={11}
                  maxLength={17}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="mileage">Current mileage</label>
                <input
                  id="mileage"
                  value={form.mileage}
                  onChange={(event) =>
                    handleChange(
                      "mileage",
                      event.target.value.replace(/[^0-9,]/g, ""),
                    )
                  }
                  placeholder="34,780"
                />
              </div>
              <div className="form-field checkbox-field">
                <label>
                  <input
                    type="checkbox"
                    checked={form.primary}
                    onChange={(event) =>
                      handleChange("primary", event.target.checked)
                    }
                  />
                  Set as primary vehicle
                </label>
              </div>
            </div>
            <div className="form-actions">
              <button className="button primary" type="submit">
                Add to garage
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

        <div className="vehicle-list" aria-live="polite">
          {vehicles.map((vehicle) => (
            <article key={vehicle.id} className="vehicle-card">
              <div className="vehicle-header">
                <div>
                  <h3>
                    {vehicle.nickname} <span>• {vehicle.year}</span>
                  </h3>
                  <p>{vehicle.model}</p>
                </div>
                {vehicle.primary && (
                  <span className="primary-badge">Primary</span>
                )}
              </div>
              <div className="vehicle-meta">
                <p>
                  <strong>VIN:</strong> {vehicle.vin}
                </p>
                <p>
                  <strong>Mileage:</strong> {vehicle.mileage.toLocaleString()}{" "}
                  miles
                </p>
                <p>
                  <strong>Last service:</strong> {vehicle.lastService}
                </p>
              </div>
              <button type="button" onClick={() => removeVehicle(vehicle.id)}>
                Remove from garage
              </button>
            </article>
          ))}
        </div>
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
