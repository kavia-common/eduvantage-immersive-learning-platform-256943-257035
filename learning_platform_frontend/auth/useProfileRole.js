/**
 * @typedef {'student' | 'instructor'} Role
 *
 * Returns user's role from the current auth session.
 * Defaults to "student".
 */
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

export function useProfileRole() {
  const { currentUserRole } = useContext(AuthContext) || {};
  return currentUserRole || "student";
}

export const ROLES = {
  STUDENT: "student",
  INSTRUCTOR: "instructor",
};
