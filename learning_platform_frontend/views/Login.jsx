import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Loader from "../components/common/Loader";
import RoleSelector, { ROLES } from "../components/common/RoleSelector";
import { AuthContext } from "../auth/AuthProvider";

/**
 * @typedef {'student' | 'instructor'} Role
 */

/**
 * Login page and sign-up page role: includes role selector and handles role persistence for new and returning users.
 * - If sign-up, role is stored in Supabase user_metadata.
 * - If sign-in only, role is persisted in AuthContext/localStorage.
 * - Always follows Ocean Professional UI and accessibility best practices.
 */
function Login() {
  const navigate = useNavigate();
  const { setCurrentUserRole } = useContext(AuthContext) || {};
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(ROLES.STUDENT);
  const [roleError, setRoleError] = useState("");
  const [formTouched, setFormTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // PUBLIC_INTERFACE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormTouched(true);
    setRoleError("");
    setError(null);

    // Validation for role (role required)
    if (!role || !(role === ROLES.STUDENT || role === ROLES.INSTRUCTOR)) {
      setRoleError("Please select a role.");
      return;
    }

    setLoading(true);
    try {
      // Example: assuming sign-in only flow
      // Note: For sign-up: set options.data = { role }
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (signInError) {
        setError(signInError.message);
      } else if (data?.session) {
        // Persist role in AuthContext and localStorage for rest of app usage (sign-in only flow).
        if (setCurrentUserRole) setCurrentUserRole(role);
        window.localStorage.setItem("currentUserRole", role);
        navigate("/");
      }
    } catch (err) {
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full bg-white p-8 shadow-lg rounded-xl"
        aria-label="Sign In"
      >
        <h1 className="text-2xl font-bold mb-6 text-[#2563EB]">Sign In</h1>
        <div className="mb-5">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[#2563EB] mb-1"
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[#2563EB] mb-1"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="mb-5">
          <RoleSelector
            value={role}
            onChange={(newRole) => {
              setRole(newRole);
              setRoleError("");
            }}
            error={formTouched && roleError}
            disabled={loading}
          />
        </div>
        {error && (
          <div
            className="text-[#EF4444] text-sm mb-3"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}
        <button
          type="submit"
          className="w-full py-3 mt-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg transition-all duration-150 shadow-md focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? <Loader size="sm" color="#2563EB" /> : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default Login;
