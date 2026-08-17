"use client";

import posthog from "posthog-js";

let initialized = false;

/** Lazily initializes the PostHog browser client exactly once. Safe to call
 * from anywhere client-side; no-ops without a configured project key so the
 * mock-data build keeps working with analytics falling back to console-only
 * (see src/lib/analytics.ts). */
export function ensurePostHogInitialized() {
  if (initialized || typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: false,
  });
  initialized = true;
}

export { posthog };
