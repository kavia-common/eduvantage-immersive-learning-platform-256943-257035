import { createClient } from "@supabase/supabase-js";
import { env } from "./config/env";

/**
 * Initializes and exports a singleton Supabase client.
 * Reads configuration from environment variables:
 * - REACT_APP_SUPABASE_URL
 * - REACT_APP_SUPABASE_KEY
 *
 * SECURITY: No secrets are hardcoded; values must be injected via .env.
 */

// PUBLIC_INTERFACE
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
