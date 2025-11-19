import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

/**
 * PUBLIC_INTERFACE
 * useUserEnrollments React hook to fetch a user's course enrollments (purchases).
 *
 * - If Supabase is available, fetches from 'purchases' or 'enrollments' table.
 * - Returns enrollments array (ordered by most recent), loading state, and error.
 *
 * Usage:
 *   const { enrollments, loading, error, reload } = useUserEnrollments();
 */
export function useUserEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try Supabase
      let user = supabase.auth?.user?.() || supabase.auth?.getUser?.()?.user || null;
      if (!user) {
        // legacy fallback: check window or context if needed
        setEnrollments([]);
        setLoading(false);
        return;
      }
      // Try the best-known table structures
      let { data, error: queryError } = await supabase
        .from('purchases')
        .select('id,course_id,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (queryError || !Array.isArray(data)) {
        // Try alternative table (enrollments)
        const { data: alt, error: altError } = await supabase
          .from('enrollments')
          .select('id,course_id,created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (altError || !Array.isArray(alt)) {
          setError((queryError || altError || "No enrollments found"));
          setEnrollments([]);
          setLoading(false);
          return;
        }
        setEnrollments(alt);
        setLoading(false);
      } else {
        setEnrollments(data);
        setLoading(false);
      }
    } catch (e) {
      // If all else fails, set error
      setError("Could not load enrollments.");
      setEnrollments([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return { enrollments, loading, error, reload: fetchEnrollments };
}
