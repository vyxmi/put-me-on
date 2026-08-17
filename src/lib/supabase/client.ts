import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client — anon/publishable key only, session-aware via
 * cookies. This is the client used for the RLS-scoped own-data reads
 * described in docs/ARCHITECTURE.md §8 (Inbox/Sent/Me, the recipient
 * picker). It must never be given the service-role key.
 *
 * Not wired into any route yet — the app still runs entirely on the mock
 * data layer in src/lib/data until the auth flow (email OTP, Anonymous
 * Auth for guests) exists to actually populate real sessions.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
