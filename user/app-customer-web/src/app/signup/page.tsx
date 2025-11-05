"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signup } from "@/services/auth";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<null | { type: "success" | "error"; message: string }>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    try {
      const response = await signup({ name, email, password });
      setFeedback({
        type: "success",
        message: `Welcome to NovaDrive, ${response.name}! Sign in to start scheduling your first service.`,
      });
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Your account could not be created. Please try again.";
      setFeedback({ type: "error", message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="section">
      <div className="container">
        <form className="form-card" onSubmit={handleSubmit}>
          <p className="eyebrow">Getting started</p>
          <h1>Create your NovaDrive account</h1>
          <p>
            Personalize reminders, add vehicles to your digital garage, and
            unlock roadside support in minutes.
          </p>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <span className="field-hint">Use at least 8 characters for security.</span>
            </div>
          </div>

          <div className="form-actions">
            <Link href="/signin" className="button secondary">
              Already have an account?
            </Link>
            <button className="button primary" type="submit" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign up"}
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
    </section>
  );
}
