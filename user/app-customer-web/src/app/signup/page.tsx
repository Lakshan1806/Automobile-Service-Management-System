"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  requestSignupOtp,
  verifySignupOtp,
  type SignupResponse,
} from "@/app/auth/auth";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<null | {
    type: "success" | "error";
    message: string;
  }>(null);

  const isDetailsLocked = otpSent;

  function resetFlow() {
    setOtpSent(false);
    setOtp("");
    setFeedback(null);
  }

  function resetFormAfterSuccess(response: SignupResponse) {
    setFeedback({
      type: "success",
      message: `Welcome to NovaDrive, ${response.name}! Sign in to start scheduling your first service.`,
    });
    setName("");
    setEmail("");
    setPassword("");
    setOtp("");
    setOtpSent(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    try {
      if (!otpSent) {
        await requestSignupOtp({ name, email, password });
        setFeedback({
          type: "success",
          message:
            "We just emailed you a verification code. Enter it below to finish creating your account.",
        });
        setOtpSent(true);
      } else {
        const response = await verifySignupOtp({ email, otp });
        resetFormAfterSuccess(response);
      }
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
                disabled={isDetailsLocked}
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
                disabled={isDetailsLocked}
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
                disabled={isDetailsLocked}
              />
              <span className="field-hint">
                Use at least 8 characters for security.
              </span>
            </div>

            {otpSent && (
              <div className="form-field">
                <label htmlFor="otp">Verification code</label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  required
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  disabled={isLoading}
                />
                <span className="field-hint">
                  Enter the verification code we emailed to{" "}
                  <strong>{email}</strong>.
                </span>
              </div>
            )}
          </div>

          <div className="form-actions">
            <Link href="/signin" className="button secondary">
              Already have an account?
            </Link>
            {otpSent && (
              <button
                type="button"
                className="button secondary"
                onClick={resetFlow}
                disabled={isLoading}
              >
                Update details
              </button>
            )}
            <button
              className="button primary"
              type="submit"
              disabled={isLoading}
            >
              {isLoading
                ? otpSent
                  ? "Verifying..."
                  : "Sending code..."
                : otpSent
                  ? "Verify & create account"
                  : "Send verification code"}
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
