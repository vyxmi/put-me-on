// Stand-in for the PostHog integration described in docs/ANALYTICS.md.
// Same event taxonomy and property shape the real client/server capture
// calls will use — swap the body of `track` for PostHog calls later without
// touching call sites. Never pass PII (email, note text, tokens) here.

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
  | "guest_email_submitted";

export function track(event: AnalyticsEvent, properties: Record<string, string | number | boolean | undefined> = {}) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[analytics] ${event}`, properties);
  }
}
