"use client";

import { FormEvent, useMemo, useState } from "react";

const services = [
  "Scheduled maintenance",
  "Diagnostic inspection",
  "Battery replacement",
  "Tire and alignment",
  "Detailing and protection",
];

const transportOptions = [
  "Customer lounge",
  "Complimentary shuttle",
  "Mobile service technician",
  "Loaner vehicle",
];

type Appointment = {
  name: string;
  email: string;
  vehicle: string;
  service: string;
  date: string;
  time: string;
  transport: string;
  notes: string;
};

const initialAppointment: Appointment = {
  name: "",
  email: "",
  vehicle: "",
  service: services[0],
  date: "",
  time: "",
  transport: transportOptions[0],
  notes: "",
};

export default function AppointmentPage() {
  const [appointment, setAppointment] = useState(initialAppointment);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<Appointment | null>(null);

  function handleChange(key: keyof Appointment, value: string) {
    setAppointment((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 600));
    setConfirmation(appointment);
    setAppointment(initialAppointment);
    setIsSubmitting(false);
  }

  const confirmationSummary = useMemo(() => {
    if (!confirmation) return null;
    return `${confirmation.service} for ${confirmation.vehicle} on ${new Date(
      `${confirmation.date}T${confirmation.time}`
    ).toLocaleString([], { dateStyle: "long", timeStyle: "short" })}`;
  }, [confirmation]);

  return (
    <section className="section">
      <div className="container hero-content">
        <div>
          <p className="eyebrow">Plan your visit</p>
          <h1>Book a NovaDrive appointment</h1>
          <p>
            Choose from certified NovaDrive locations or request a mobile
            technician. We will confirm availability and keep you informed at
            every stage.
          </p>
          <div className="card">
            <h3>What happens next?</h3>
            <ul>
              <li>Receive a confirmation email with check-in instructions.</li>
              <li>Track technician updates from the NovaDrive mobile app.</li>
              <li>
                Approve recommended work digitally before any wrench is turned.
              </li>
            </ul>
          </div>
        </div>
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Appointment details</h2>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="customer-name">Name</label>
              <input
                id="customer-name"
                value={appointment.name}
                onChange={(event) => handleChange("name", event.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="customer-email">Email</label>
              <input
                id="customer-email"
                type="email"
                value={appointment.email}
                onChange={(event) => handleChange("email", event.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="vehicle">Vehicle</label>
              <input
                id="vehicle"
                placeholder="Year • Make • Model"
                value={appointment.vehicle}
                onChange={(event) => handleChange("vehicle", event.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="service">Service type</label>
              <select
                id="service"
                value={appointment.service}
                onChange={(event) => handleChange("service", event.target.value)}
              >
                {services.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="date">Preferred date</label>
              <input
                id="date"
                type="date"
                value={appointment.date}
                onChange={(event) => handleChange("date", event.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="time">Preferred time</label>
              <input
                id="time"
                type="time"
                value={appointment.time}
                onChange={(event) => handleChange("time", event.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="transport">Transportation</label>
              <select
                id="transport"
                value={appointment.transport}
                onChange={(event) => handleChange("transport", event.target.value)}
              >
                {transportOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="notes">Notes for the technician</label>
              <textarea
                id="notes"
                rows={3}
                value={appointment.notes}
                onChange={(event) => handleChange("notes", event.target.value)}
                placeholder="Describe any concerns, warning lights, or custom requests."
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="button primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Confirm appointment"}
            </button>
          </div>

          {confirmationSummary && (
            <div className="feedback" role="status" aria-live="polite">
              Appointment reserved: {confirmationSummary}. We will email your
              confirmation shortly.
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
