"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signin } from "@/services/auth";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<null | { type: "success" | "error"; message: string }>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    try {
      const response = await signin({ email, password });
      setFeedback({
        type: "success",
        message: `Welcome back, ${response.customer.name}. Your dashboard will load momentarily.`,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We could not complete your sign in. Please try again.";
      setFeedback({ type: "error", message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="section">
      <div className="container">
        <form className="form-card" onSubmit={handleSubmit}>
          <p className="eyebrow">Account access</p>
          <h1>Sign in to NovaDrive</h1>
          <p>
            Manage appointments, view your service history, and update your
            vehicles in the NovaDrive garage.
          </p>

          <div className="form-grid">
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <Link href="/signup" className="button secondary">
              Create account
            </Link>
            <button className="button primary" type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
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
