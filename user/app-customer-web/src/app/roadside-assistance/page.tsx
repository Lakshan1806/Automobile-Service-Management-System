"use client";

import { FormEvent, useState } from "react";

type RequestForm = {
  name: string;
  phone: string;
  vehicle: string;
  issue: string;
  location: string;
  needTow: boolean;
};

const initialForm: RequestForm = {
  name: "",
  phone: "",
  vehicle: "",
  issue: "",
  location: "",
  needTow: false,
};

export default function RoadsideAssistancePage() {
  const [form, setForm] = useState(initialForm);
  const [reference, setReference] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange<K extends keyof RequestForm>(key: K, value: RequestForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 500));
    const code = `NRD-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    setReference(code);
    setIsSubmitting(false);
    setForm(initialForm);
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
              <label htmlFor="name">Your name</label>
              <input
                id="name"
                value={form.name}
                onChange={(event) => handleChange("name", event.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="phone">Mobile number</label>
              <input
                id="phone"
                value={form.phone}
                onChange={(event) => handleChange("phone", event.target.value.replace(/[^0-9+\-\s]/g, ""))}
                placeholder="+1 313 555 0192"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="vehicle">Vehicle</label>
              <input
                id="vehicle"
                value={form.vehicle}
                onChange={(event) => handleChange("vehicle", event.target.value)}
                placeholder="NovaDrive Pulse EV"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="location">Current location</label>
              <textarea
                id="location"
                rows={3}
                value={form.location}
                onChange={(event) => handleChange("location", event.target.value)}
                placeholder="Address, intersection, or GPS pin"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="issue">What happened?</label>
              <textarea
                id="issue"
                rows={3}
                value={form.issue}
                onChange={(event) => handleChange("issue", event.target.value)}
                placeholder="Engine trouble, flat tire, locked out, etc."
                required
              />
            </div>
            <div className="form-field checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={form.needTow}
                  onChange={(event) => handleChange("needTow", event.target.checked)}
                />
                My vehicle needs towing
              </label>
            </div>
          </div>
          <div className="form-actions">
            <button className="button primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting request..." : "Send request"}
            </button>
          </div>
          {reference && (
            <div className="feedback" role="status" aria-live="polite">
              We have your request. Your dispatch reference number is <strong>{reference}</strong>.
              A specialist will text updates shortly.
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
