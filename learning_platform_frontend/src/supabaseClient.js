import { createClient } from "@supabase/supabase-js";

/**
 * Initializes and exports a singleton Supabase client.
 * Reads configuration from environment variables:
 * - REACT_APP_SUPABASE_URL
 * - REACT_APP_SUPABASE_KEY
 *
 * SECURITY: No secrets are hardcoded; values must be injected via .env.
 */

// Use process.env directly, fall back if config/env.js changes in future
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Warn for easier developer debugging if missing at build time
  // eslint-disable-next-line no-console
  console.warn(
    "Supabase credentials missing! Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in your .env file."
  );
}

// PUBLIC_INTERFACE
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
