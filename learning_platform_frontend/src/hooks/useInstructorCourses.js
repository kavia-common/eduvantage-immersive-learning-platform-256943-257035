import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

/**
 * Hook to fetch courses for the current instructor.
 * Handles loading, error, and empty states.
 * @param {string|null} userId - Instructor's user ID (from auth)
 * @returns {object} { courses, loading, error }
 */
// PUBLIC_INTERFACE
export function useInstructorCourses(userId) {
  /** This is a public hook for fetching the instructor's courses from Supabase. */
  const [courses, setCourses] = useState([]);
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
      .from("courses")
      .select("*")
      .eq("instructor_id", userId)
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message || "Failed to load courses");
        } else {
          setCourses(data || []);
        }
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || "Failed to load courses");
        setLoading(false);
      });
  }, [userId, supabaseUrl, supabaseKey]);

  return { courses, loading, error };
}
