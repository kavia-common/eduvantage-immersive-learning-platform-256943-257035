import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Loader from "../components/common/Loader";

/**
 * OAuth callback handler. Supabase will redirect here after OAuth flow.
 * This component finalizes the session and redirects to Dashboard.
 */

// PUBLIC_INTERFACE
export default function OAuthCallback() {
  const navigate = useNavigate();
  const { search, hash } = useLocation();

  useEffect(() => {
    // Supabase handles tokens in URL fragment; we just trigger session extraction by accessing getSession
    const finalize = async () => {
      try {
        await supabase.auth.getSession();
      } finally {
        navigate("/dashboard", { replace: true });
      }
    };
    finalize();
    // include search/hash in dependency to recalc if they change
  }, [navigate, search, hash]);

  return <Loader label="Finalizing sign-in..." />;
}
