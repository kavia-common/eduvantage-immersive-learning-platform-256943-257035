import React, { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useAuth } from "../auth/AuthProvider";

/**
 * Signup page for creating a new account via email/password.
 * A confirmation email may be sent depending on Supabase project settings.
 */

// PUBLIC_INTERFACE
export default function Signup() {
  const { signUpWithPassword, error, signInWithOAuth } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [localError, setLocalError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError("");
    setMessage("");
    try {
      await signUpWithPassword(form.email.trim(), form.password);
      setMessage("If email confirmation is required, please check your inbox to verify your account.");
    } catch (e2) {
      setLocalError(String(e2?.message || e2));
    } finally {
      setSubmitting(false);
    }
  };

  const onOAuth = async () => {
    try {
      await signInWithOAuth("google");
    } catch (e2) {
      setLocalError(String(e2?.message || e2));
    }
  };

  return (
    <div className="container" style={{ maxWidth: 520, marginTop: "2rem" }}>
      <Card>
        <h2>Create your account</h2>
        <p className="mt-2" style={{ color: "var(--color-muted)" }}>
          Join EduVantage and start your immersive learning journey.
        </p>

        {(error || localError) && (
          <div className="mt-3" style={{ color: "var(--color-error)" }}>
            {error || localError}
          </div>
        )}
        {message && (
          <div className="mt-3" style={{ color: "var(--color-primary)" }}>
            {message}
          </div>
        )}

        <form className="mt-3" onSubmit={onSubmit}>
          <div className="mt-2">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              style={{ width: "100%", padding: "0.6rem", borderRadius: 12, border: "1px solid var(--color-border)" }}
            />
          </div>

          <div className="mt-2">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              style={{ width: "100%", padding: "0.6rem", borderRadius: 12, border: "1px solid var(--color-border)" }}
            />
          </div>

          <div className="mt-3" style={{ display: "flex", gap: ".5rem" }}>
            <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create account"}</Button>
            <Button type="button" variant="secondary" onClick={onOAuth}>
              Continue with Google
            </Button>
          </div>
        </form>

        <div className="mt-3" style={{ color: "var(--color-muted)" }}>
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </Card>
    </div>
  );
}
