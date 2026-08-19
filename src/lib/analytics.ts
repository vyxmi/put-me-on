import { posthog, ensurePostHogInitialized } from "./posthog/client";

// Client-side capture per docs/ANALYTICS.md. Falls back to console-only
// logging when NEXT_PUBLIC_POSTHOG_KEY isn't configured, so the mock-data
// build keeps working without a PostHog project. Never pass PII (email,
// phone, note text, OTP/tokens) here — internal ids only.

export type AnalyticsEvent =
  | "signup_started"
  | "recommendation_composer_opened"
  | "track_link_submitted"
  | "track_metadata_loaded"
  | "track_metadata_failed"
  | "recommendation_created"
  | "share_action_opened"
  | "share_link_copied"
  | "recommendation_viewed"
  | "listen_clicked"
  | "response_submitted"
  | "put_on_confirmed"
  | "pass_on_started"
  | "recommendation_passed_on"
  | "inbox_viewed"
  | "sent_viewed"
  | "me_viewed"
  | "guest_save_prompt_shown"
  | "guest_email_submitted"
  | "profile_updated";

export function track(event: AnalyticsEvent, properties: Record<string, string | number | boolean | undefined> = {}) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[analytics] ${event}`, properties);
  }
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  ensurePostHogInitialized();
  posthog.capture(event, properties);
}
