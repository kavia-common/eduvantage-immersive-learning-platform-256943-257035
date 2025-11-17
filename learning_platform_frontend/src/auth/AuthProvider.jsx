import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

/**
 * AuthProvider supplies authentication state and helpers using Supabase.
 * It handles:
 * - Session initialization
 * - Listening to auth state changes
 * - Login/logout/signup helpers
 *
 * Usage:
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */

// PUBLIC_INTERFACE
export const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  error: null,
  signInWithPassword: async (_email, _password) => {},
  signUpWithPassword: async (_email, _password) => {},
  signOut: async () => {},
  signInWithOAuth: async (_provider, _redirectTo) => {},
});

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access auth context safely */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize session on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data, error: err } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (err) {
          setError(err.message);
        } else {
          setSession(data?.session ?? null);
          setUser(data?.session?.user ?? null);
        }
      } catch (e) {
        setError(String(e?.message || e));
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    // Subscribe to auth state changes
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription?.subscription?.unsubscribe?.();
    };
  }, []);

  const signInWithPassword = useCallback(async (email, password) => {
    setError(null);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    return data;
  }, []);

  const signUpWithPassword = useCallback(async (email, password) => {
    setError(null);
    // Ideally set emailRedirectTo to FRONTEND URL + /auth/callback
    const redirectTo =
      (process.env.REACT_APP_FRONTEND_URL || window.location.origin) + "/auth/callback";
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo },
    });
    if (err) setError(err.message);
    return data;
  }, []);

  const signInWithOAuth = useCallback(async (provider, redirectTo) => {
    setError(null);
    const callbackUrl =
      redirectTo ||
      (process.env.REACT_APP_FRONTEND_URL || window.location.origin) + "/auth/callback";
    const { data, error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl },
    });
    if (err) setError(err.message);
    return data;
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    const { error: err } = await supabase.auth.signOut();
    if (err) setError(err.message);
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      error,
      signInWithPassword,
      signUpWithPassword,
      signOut,
      signInWithOAuth,
    }),
    [user, session, loading, error, signInWithPassword, signUpWithPassword, signOut, signInWithOAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
