import React, { createContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

/**
 * @typedef {'student' | 'instructor'} Role
 */

export const AuthContext = createContext();

/**
 * Provides global authentication state and role context.
 * - Extracts user role from Supabase session metadata (if available).
 * - Persists currentUserRole: string in context and localStorage for app-wide access.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Persist role in state & localStorage to survive refresh.
  const [currentUserRole, setCurrentUserRole] = useState(() => {
    return window.localStorage.getItem("currentUserRole") || "student";
  });

  useEffect(() => {
    const session = supabase.auth.session && supabase.auth.session();
    setUser(session?.user ?? null);

    // Update user on auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange?.((_, session) => {
      setUser(session?.user ?? null);
      // On signed-in, check Supabase metadata for role and sync state
      if (session?.user?.user_metadata?.role) {
        setCurrentUserRole(session.user.user_metadata.role);
        window.localStorage.setItem("currentUserRole", session.user.user_metadata.role);
      }
    });
    return () => {
      if (listener?.unsubscribe) listener.unsubscribe();
    };
  }, []);

  // Keep role in localStorage in sync
  useEffect(() => {
    if (currentUserRole) {
      window.localStorage.setItem("currentUserRole", currentUserRole);
    }
  }, [currentUserRole]);

  return (
    <AuthContext.Provider value={{ user, currentUserRole, setCurrentUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};
