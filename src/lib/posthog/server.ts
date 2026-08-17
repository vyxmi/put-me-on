import "server-only";
import { PostHog } from "posthog-node";

let client: PostHog | null = null;

/**
 * Server-side PostHog client for the "server-authoritative events" called
 * out in docs/ANALYTICS.md §3 (recommendation_created, response_submitted,
 * recommendation_passed_on, guest_upgraded_to_account, etc.) — meant to be
 * called from inside real Server Actions once those exist. Not called from
 * anywhere yet: today's mutations run against the mock store in the
 * browser, so those events still fire through the client-side stub in
 * src/lib/analytics.ts.
 */
export function getServerPostHog(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;
  if (!client) {
    client = new PostHog(key, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return client;
}
