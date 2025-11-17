import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useAuth } from "../auth/AuthProvider";

/**
 * Login page supporting email/password and OAuth.
 */

// PUBLIC_INTERFACE
export default function Login() {
  const { signInWithPassword, signInWithOAuth, error, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  if (user) {
    // If already logged in, go to intended page
    navigate(from, { replace: true });
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError("");
    try {
      await signInWithPassword(form.email.trim(), form.password);
      navigate(from, { replace: true });
    } catch (e2) {
      setLocalError(String(e2?.message || e2));
    } finally {
      setSubmitting(false);
    }
  };

  const onOAuth = async () => {
    try {
      await signInWithOAuth("google");
      // Redirect handled by Supabase to callback
    } catch (e2) {
      setLocalError(String(e2?.message || e2));
    }
  };

  return (
    <div className="container" style={{ maxWidth: 520, marginTop: "2rem" }}>
      <Card>
        <h2>Login</h2>
        <p className="mt-2" style={{ color: "var(--color-muted)" }}>
          Access your EduVantage account.
        </p>

        {(error || localError) && (
          <div className="mt-3" style={{ color: "var(--color-error)" }}>
            {error || localError}
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
            <Button type="submit" disabled={submitting || loading}>
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
            <Button type="button" variant="secondary" onClick={onOAuth}>
              Continue with Google
            </Button>
          </div>
        </form>

        <div className="mt-3" style={{ color: "var(--color-muted)" }}>
          Don't have an account? <Link to="/signup">Create one</Link>
        </div>
      </Card>
    </div>
  );
}
