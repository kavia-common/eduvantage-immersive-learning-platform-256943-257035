import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

/**
 * PUBLIC_INTERFACE
 * useUserEnrollments
 * Returns { enrollments, loading, error } for current user.
 * Only fetches if user ID passed in.
 */
export function useUserEnrollments(userId) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // These env vars must be set in .env and loaded
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    const supabase = createClient(supabaseUrl, supabaseKey);

    supabase
      .from("enrollments")
      .select("*, course:title, course:course_title")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message || "Failed to load enrollments");
        } else {
          setEnrollments(data || []);
        }
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || "Failed to load enrollments");
        setLoading(false);
      });
  }, [userId, supabaseUrl, supabaseKey]);

  return { enrollments, loading, error };
}
