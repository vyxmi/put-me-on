# Put Me On — V1 Analytics

Canonical analytics contract for V1. See also [V1_SCOPE.md](./V1_SCOPE.md) and [USER_FLOWS.md](./USER_FLOWS.md).

Analytics is a first-class V1 requirement, not something added after launch. The product must be instrumented before the first meaningful friend cohort.

Do not send PII or recommendation-note text to analytics. Use stable internal IDs. Mark founder/internal accounts so founder usage can be excluded.

---

## 1. Event taxonomy

This taxonomy is a contract — exact event names should match what's implemented.

- `signup_started`
- `email_submitted`
- `email_verified`
- `signup_completed`
- `recommendation_composer_opened`
- `track_link_submitted`
- `track_metadata_loaded`
- `track_metadata_failed`
- `recommendation_created`
- `share_action_opened`
- `share_link_copied`
- `recommendation_viewed`
- `listen_clicked`
- `response_submitted`
- `put_on_confirmed`
- `pass_on_started`
- `recommendation_passed_on`
- `inbox_viewed`
- `sent_viewed`
- `me_viewed`
- `guest_save_prompt_shown`
- `guest_email_submitted`
- `guest_upgraded_to_account`

### Important properties (where appropriate)

- `recommendation_id`
- `track_id`
- `sender_id`
- `recipient_type`: `registered | guest`
- `response_type`
- `source_recommendation_present`
- `viewer_authenticated`
- `response_verified`
- `entry_point`
- `share_method`
- `beta_cohort`
- `is_founder_involved`

### Never include

- email
- phone
- full note text
- OTP/magic-link tokens
- secrets

---

## 2. Metrics V1 should support

Instrumentation must make it possible to calculate:

- **Sender activation** — users who create a recommendation / persistent users
- **Recommendation open rate** — recommendations viewed / recommendations created
- **Listen click rate** — recommendations with `listen_clicked` / recommendations viewed
- **Response rate** — recommendations receiving a response / recommendations viewed
- **Put-on rate** — `put_me_on` responses / responses
- **Pass-on rate** — received recommendations that produce a downstream recommendation
- **Organic network usage** — recommendations where founder is neither sender nor recipient (especially important)
- **Unique relationship edges** — unique sender → recipient pairs
- **Return behavior** — users active across multiple distinct days
- **Guest-to-account conversion** — guest recommendation viewers/responders → verified email accounts
- **New-user activation** — users acquired through a recommendation who later send their own recommendation (more meaningful than signup alone)

---

## 3. Analytics caveats

- Do not count server/link-preview crawler hits as genuine recommendation views. A page request is not necessarily a human view.
- Prefer client-side meaningful view instrumentation after page hydration/visibility where appropriate.
- Avoid double-firing events due to React renders.
- Server-authoritative events should be used for persisted actions where practical: recommendation created, response saved, pass-on recommendation created, account upgraded.
- Development/local activity must not pollute production metrics.
