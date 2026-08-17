import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses RLS entirely. Per
 * docs/ARCHITECTURE.md §8/§11/§12, this is the ONLY client that performs
 * writes (createRecommendation, submitResponse, editResponse,
 * deleteRecommendation, passItOn) and the only client that renders the
 * public /r/[public_id] page. Every caller is responsible for validating
 * identity/authorization itself before calling anything with this client —
 * it enforces nothing on its own.
 *
 * The `server-only` import makes an accidental client-bundle import a hard
 * build error instead of a leaked service-role key.
 */
export function createAdminClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
