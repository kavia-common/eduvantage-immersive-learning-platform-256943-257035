import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { getOrCreateProfileRole } from "../services/supabaseDataService";

/**
 * PUBLIC_INTERFACE
 * useProfileRole
 * Returns { role, loading, error, refresh, setRole(role) } for current user.
 * If profile row is missing it will be created lazily without changing role unless setRole is called.
 */
export default function useProfileRole() {
  const { user } = useAuth();
  const [role, setRoleState] = useState(null);
  const [loading, setLoading] = useState(!!user);
  const [error, setError] = useState(null);

  async function refresh() {
    if (!user) {
      setRoleState(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const prof = await getOrCreateProfileRole(user.id);
      setRoleState(prof?.role || null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  async function setRole(nextRole) {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getOrCreateProfileRole(user.id, nextRole);
      setRoleState(res?.role || nextRole);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { role, loading, error, refresh, setRole };
}
