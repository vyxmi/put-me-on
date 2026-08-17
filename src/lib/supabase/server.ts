import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Server Component / Server Action Supabase client — anon key, but reads
 * the caller's real session from cookies so `auth.uid()` resolves and RLS
 * applies normally. Use this for session checks inside Server Actions
 * (e.g. "does this session match recommendation.recipient_user_id?" in
 * docs/ARCHITECTURE.md §11) — not for the actual privileged writes, which
 * use the admin client in ./admin.ts.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component render, where cookies() is
          // read-only. Safe to ignore as long as session refresh also
          // happens in proxy.ts (not yet added — see docs/ARCHITECTURE.md
          // §3, deferred until the real auth flow is built).
        }
      },
    },
  });
}
