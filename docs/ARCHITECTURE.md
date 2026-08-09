# Put Me On — V1 Architecture Proposal

Status: **PROPOSED — not approved. Do not implement (schema, RLS, auth, API routes, product behavior) until this doc is explicitly approved.**

This proposal follows the requirements in `CLAUDE.md` and is built from `docs/V1_SCOPE.md`, `docs/USER_FLOWS.md`, and `docs/ANALYTICS.md`. Section numbers below match the checklist in `CLAUDE.md`.

---

## 1. System overview

A single Next.js (App Router, TypeScript) app deployed on Vercel, backed by one Supabase project (Postgres + Auth), with PostHog for analytics and Spotify's Web API (Client Credentials, app-only) for track metadata.

```
Browser
  │  reads: Inbox/Sent/Me (RLS-scoped, direct Supabase client)
  │  writes: Server Actions (Next.js) ──► Supabase (service role, bypasses RLS)
  │  public page: /r/[id] rendered server-side (service role, read-only)
  ▼
Next.js (Vercel)
  ├─ Server Actions: create recommendation, submit response, delete, pass-on
  ├─ Route handler: guest email verification callback
  └─ Spotify Client-Credentials token cache (in-memory, server-only)
        │
        ▼
Supabase (Postgres + Auth)
  ├─ auth.users (Supabase-managed, email OTP/magic link)
  └─ public schema: profiles, tracks, recommendations, responses (RLS: read-scoped, no client writes)

PostHog — client + server events (see docs/ANALYTICS.md)
```

Rationale for a single Next.js app rather than a separate backend: no requirement here (queues, workers, background jobs, realtime) that needs infrastructure a monolith can't provide, and it keeps the friend-beta cheap to run and reason about.

---

## 2. Recommended stack and why

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Already scaffolded; server components fit the "server-authoritative mutations" requirement naturally |
| Styling | Tailwind (already scaffolded) | Matches existing setup |
| DB | Supabase Postgres | Relational is explicitly sufficient per spec; Supabase bundles auth + generous free tier for a friend beta |
| Auth | Supabase Auth, email OTP/magic link | Passwordless email required by spec; avoids building auth from scratch |
| Analytics | PostHog (client + server capture) | Already chosen by you; supports the event taxonomy in `docs/ANALYTICS.md` directly |
| Track metadata | Spotify Web API, Client Credentials flow | App-only auth (no user OAuth, per spec); richer/more reliable data than oEmbed |
| Hosting | Vercel | Pairs naturally with Next.js; no infra to manage |

Explicitly avoided (per spec's "avoid unless proven necessary" list): a separate backend service, a queue/event bus, Redux, a second analytics vendor, Spotify user OAuth, realtime infrastructure.

---

## 3. Authentication / guest identity strategy

**Registered users:** Supabase Auth, email + OTP (or magic link — recommend OTP code since it works better across devices than a clickable link when the user opens their email on a different device than they started on). Session via `@supabase/ssr` cookie-based sessions.

**Guests (no account):** guests never get a Supabase Auth identity. Instead, the first time a browser interacts with a recommendation as a guest (viewing, then responding), the server sets a first-party, httpOnly, signed cookie: `pmo_guest_session` = a random UUID (`guest_session_id`). This is scoped narrowly:

- It is **not** a general-purpose anonymous user ID system-wide — it only exists to let the *same browser* later edit its own response and to support the upgrade flow below.
- It is never exposed to the client as readable JS, never logged with PII, and never sent to PostHog as a person-identifying property.

This directly satisfies the spec's requirement to distinguish guest/unverified responses from authenticated ones, without inventing a shadow-account system.

---

## 4. Guest-to-persistent-account upgrade strategy

1. Guest responds to a recommendation → `responses` row created with `responder_user_id = NULL`, `guest_session_id = <cookie value>`, `attribution = 'guest'`.
2. Guest is shown the "save this?" email prompt (per `docs/USER_FLOWS.md` §6). They submit an email.
3. Server triggers Supabase Auth's email OTP for that address (`signInWithOtp`), which either creates a new `auth.users` row or resolves to an existing one.
4. **Edge case — email already has an account:** Supabase Auth will send the OTP to the existing account. We do **not** silently merge guest activity into an existing account automatically. On successful OTP verification, we check: does this browser's `guest_session_id` have any unclaimed responses? If yes, and the authenticated user has zero existing responses tied to that `guest_session_id` already, transfer ownership (see step 5). If the email turned out to belong to an account that's clearly a *different, already-active* person (has prior sent/received recommendations under their own name), we still transfer — the transfer is scoped to *this specific guest_session_id's own responses*, never to responses from a different guest_session_id, so there's no cross-contamination even if two different guests happen to reuse the same email address over time (rare, but the design tolerates it safely: last-verified-browser's pending responses attach, nothing else moves).
5. **Transfer, on verified session:** `UPDATE responses SET responder_user_id = :new_user_id WHERE guest_session_id = :cookie_value AND responder_user_id IS NULL`. `attribution` stays `'guest'` (see open question #1 below — whether it should ever flip to `'verified'`).
6. **Edge case — verification opened on another device:** the transfer keys off the `guest_session_id` cookie present *at verification time*, in *the browser that completes verification*. If the user opens the OTP-confirmation on a different device/browser than the one that had the guest cookie, the transfer step finds no matching `guest_session_id` on that device and simply creates the account with no responses attached — **the response is not silently lost**, it just isn't retroactively claimed. This is an acceptable, explainable limitation for the friend beta (flagged, not silently swallowed).
7. **Edge case — failed/abandoned verification:** no responses are ever mutated until OTP verification succeeds; a guest who never verifies keeps a normal, fully-functional guest response with no account.
8. Display name is **not** requested at this step (per spec). It's requested the first time this now-authenticated user tries to *send* a recommendation.

---

## 5. Conceptual schema / tables

```
profiles              (1:1 with auth.users)
  id               uuid PK, references auth.users(id)
  display_name     text null
  is_founder       boolean not null default false
  created_at       timestamptz not null default now()

tracks
  id                 uuid PK default gen_random_uuid()
  provider           text not null            -- 'spotify' only in V1
  provider_track_id  text not null
  source_url         text not null            -- normalized, tracking params stripped
  title              text
  artist_display     text
  album              text
  artwork_url        text
  duration_ms        integer
  metadata_status    text not null            -- 'ok' | 'failed' | 'pending'
  metadata_fetched_at timestamptz
  created_at         timestamptz not null default now()
  unique (provider, provider_track_id)

recommendations
  id                       uuid PK default gen_random_uuid()   -- also the public URL id, see §10
  sender_id                uuid not null references profiles(id)
  recipient_type           text not null            -- 'registered' | 'guest'
  recipient_user_id        uuid references profiles(id)
  recipient_guest_name     text
  track_id                 uuid not null references tracks(id)
  note                     text
  source_recommendation_id uuid references recommendations(id)  -- pass-on lineage
  idempotency_key          text
  deleted_at               timestamptz
  created_at               timestamptz not null default now()

  check (
    (recipient_type = 'registered' and recipient_user_id is not null and recipient_guest_name is null)
    or
    (recipient_type = 'guest' and recipient_guest_name is not null and recipient_user_id is null)
  )
  unique (sender_id, idempotency_key)

responses
  id                 uuid PK default gen_random_uuid()
  recommendation_id  uuid not null references recommendations(id)
  response_type      text not null            -- already_knew | not_for_me | liked_it | put_me_on
  responder_user_id  uuid references profiles(id)
  guest_session_id   uuid
  attribution        text not null            -- 'guest' | 'verified'
  created_at         timestamptz not null default now()
  updated_at         timestamptz not null default now()
  unique (recommendation_id)
```

**`attribution = 'verified'`** is only ever set when `recommendation.recipient_type = 'registered'` **and** the response was submitted by an authenticated session where `auth.uid() = recommendation.recipient_user_id`. Every guest response is `'guest'`, permanently (see open question #1).

**Not modeled as tables:** `listen_clicked` is a PostHog event only — no product surface needs to query "did they click listen" from Postgres, so persisting it in the DB would be pure duplication. If that changes later, it's an additive table.

---

## 6. Important fields and constraints

- `recommendations` CHECK constraint enforces the registered-vs-guest recipient shape (§5) — the DB itself makes the "recipient must be exactly one of two types" invariant impossible to violate, not just an app-layer convention.
- `responses` has `unique(recommendation_id)` — one response per recommendation, edited in place (matches "responses should be editable," not versioned/appended).
- `tracks` has `unique(provider, provider_track_id)` — the natural dedup key; recommendations pointing at the "same song" but different Spotify track IDs (remaster, live version, etc.) correctly get different `tracks` rows, per spec §5 in V1_SCOPE.
- Soft delete only: `recommendations.deleted_at`. Nothing is ever hard-deleted, which keeps `source_recommendation_id` foreign keys valid forever and keeps analytics/pass-on lineage intact even after a sender removes a recommendation (§14 in V1_SCOPE, and the "source recommendation deleted after track passed onward" edge case in USER_FLOWS §12).
- `note` is immutable after creation (no `updated_at` on recommendations) — per V1_SCOPE §14's own suggested simplest-safe-approach: disallow note edits; sender can delete and resend.

---

## 7. Indexes

```
recommendations (sender_id)
recommendations (recipient_user_id)
recommendations (source_recommendation_id)
recommendations (track_id)
responses (guest_session_id)
```
(`recommendations.id`, `tracks(provider, provider_track_id)`, and `responses(recommendation_id)` are already indexed via their PK/unique constraints.)

---

## 8. RLS / authorization model

**All mutations go through Next.js Server Actions using the Supabase service-role key. No `insert`/`update`/`delete` RLS policies exist for the `authenticated` or `anon` roles on any table — writes from those roles are denied by default.** This directly satisfies the spec's "server-authoritative mutations for sensitive actions" and "protection against users modifying sender/recipient IDs client-side": there is no client-side write path to bypass, full stop.

**Reads** are split two ways:

- **Authenticated, own-data reads** (Inbox, Sent, Me) go **directly from the browser to Supabase** using the anon key + the user's session JWT, protected by RLS `select` policies scoped to `auth.uid()`:
  - `recommendations`: select where `sender_id = auth.uid() or recipient_user_id = auth.uid()`
  - `responses`: select where the joined recommendation's `sender_id = auth.uid() or recipient_user_id = auth.uid()`
  - `tracks`: select allowed for any `authenticated` user (no sensitive data)
  - `profiles`: select own row directly; select `(id, display_name)` only of other users via a narrow view (see below) — needed for the "existing registered recipient" picker in the composer.

- **The public, logged-out `/r/[id]` page** is rendered server-side using the **service role** (bypassing RLS entirely) in a Server Component, because it must work with zero authentication and must not require opening any RLS policy to the `anon` role. This keeps `anon`'s RLS surface at literally nothing — a logged-out visitor's browser never talks to Supabase directly at all; every read/write on that page goes through Next.js.

**`profiles` public view:** rather than granting `select` on the full `profiles` table to other users, expose a narrow view (`public_profiles`, columns `id, display_name` only) for the recipient picker, so no future column added to `profiles` accidentally becomes world-readable by default.

---

## 9. Spotify metadata strategy

Use the **Client Credentials flow** (app-only, no user OAuth) against Spotify's Web API:

1. Sender pastes a URL. Server validates it matches `open.spotify.com/track/<id>` (regex), strips query params (e.g. `?si=...`), and extracts `provider_track_id`.
2. Server calls `GET /v1/tracks/{id}` using a cached app access token (fetched via Client Credentials, cached in-memory server-side with its expiry — Vercel serverless means this cache is best-effort per-instance, which is fine; worst case an extra token fetch per cold start, no correctness issue).
3. On success: upsert into `tracks` (`metadata_status = 'ok'`), fire `track_metadata_loaded`.
4. On failure (track deleted/region-locked/API error/timeout): still create the `tracks` row with whatever's derivable from the URL alone (`provider_track_id`, `source_url`), `metadata_status = 'failed'`, fire `track_metadata_failed`. The recommendation is still created — per spec, "cache enough metadata to render recommendations even if metadata fetching later fails" means creation must not hard-block on Spotify being up.

This never fetches an arbitrary user-supplied URL server-side — it only ever calls Spotify's own API with an extracted ID — so there's no SSRF surface to defend, beyond the initial regex validation of the pasted URL.

---

## 10. URL / link strategy

**Proposal: the public recommendation URL is `/r/<recommendations.id>`, using the row's own `uuid v4` primary key directly** — no separate `public_id` column.

- `uuid v4` is already non-sequential and effectively unguessable (122 bits of randomness), satisfying the "opaque unguessable" requirement without extra schema.
- Trade-off, flagged explicitly: this means the public link *is* the internal row identifier. If a link ever needs to be invalidated/rotated without deleting the recommendation (not a described V1 requirement — soft-delete already covers "make it stop working"), that's not possible without a schema change later. Given deletion already produces the neutral "unavailable" page, and no V1 requirement asks for link rotation independent of deletion, I'm proposing the simpler option — but this is Open Question #2 below since it's a real trade-off, not a forced choice.
- Page behavior: Next.js Server Component at `/r/[id]`, service-role read, `deleted_at is null` check, renders full OG meta tags (so link previews work per spec) and `<meta name="robots" content="noindex">` (so it's viewable by anyone with the link but not intentionally indexed). Deleted/missing → neutral "this recommendation is no longer available" page, same shape whether the ID never existed or was soft-deleted (no information leak about which).
- `recommendation_viewed` is fired **client-side after hydration**, not from the server render — this is what keeps link-preview crawlers and bots from polluting the metric, consistent with `docs/ANALYTICS.md` §3.

---

## 11. Server actions / API boundaries

| Action | Trigger | Notes |
|---|---|---|
| `createRecommendation` | Composer submit | Validates Spotify URL, resolves/upserts track, validates recipient (existing user id must exist; guest name just trimmed/non-empty), writes recommendation. Idempotency key from client dedupes double-submit. |
| `submitResponse` | Recipient picks a response | Determines `attribution` server-side from session vs `recipient_user_id`; sets/refreshes `guest_session_id` cookie if unauthenticated. |
| `editResponse` | Recipient changes response | Authorization: authenticated recipient match, **or** guest whose `guest_session_id` cookie matches the row's `guest_session_id` — this cookie-based check is exactly why response edits can't be plain RLS and must be a server action. |
| `deleteRecommendation` | Sender removes a rec | Sets `deleted_at`; sender-only, checked server-side against session. |
| `passItOn` | "Put someone else on" from a received rec | Creates a *new* recommendation row with `source_recommendation_id` set; never mutates the original. |
| `startGuestUpgrade` / `verifyGuestUpgrade` (route handler) | Guest submits email / clicks or enters OTP | Runs the transfer in §4. |
| `setDisplayName` | First send attempt without a display name | Required before `createRecommendation` proceeds. |

All of these run with the service-role key server-side; none are reachable as open Supabase REST/RPC endpoints from the client.

---

## 12. Analytics integration

- **Client-side capture** (PostHog JS) for interaction/visibility events: `recommendation_viewed` (post-hydration), `listen_clicked`, `share_action_opened`, `share_link_copied`, `recommendation_composer_opened`, `inbox_viewed`, `sent_viewed`, `me_viewed`, `guest_save_prompt_shown`.
- **Server-side capture** (PostHog Node, from inside Server Actions) for persisted/authoritative events, per `docs/ANALYTICS.md` §3: `recommendation_created`, `response_submitted`, `put_on_confirmed`, `recommendation_passed_on`, `guest_email_submitted`, `guest_upgraded_to_account`, `track_metadata_loaded`/`track_metadata_failed`. Firing these server-side (where the mutation actually happens) avoids double-firing from React re-renders and guarantees the event only fires when the write actually succeeded.
- `is_founder` (from `profiles.is_founder`) is attached to every server-side event and set as a PostHog person property, so founder activity can be excluded from funnels via a saved filter.
- No PII (email, phone, note text, OTP/tokens) ever passed as an event property — only internal IDs, per the taxonomy.
- Local/dev events tagged with a `environment` property (`development`/`production`) via `NEXT_PUBLIC_POSTHOG_HOST`/build-time env, filterable out of production dashboards.

---

## 13. Environment strategy

```
NEXT_PUBLIC_SUPABASE_URL          client-safe
NEXT_PUBLIC_SUPABASE_ANON_KEY     client-safe
SUPABASE_SERVICE_ROLE_KEY         server-only, never NEXT_PUBLIC_*
SPOTIFY_CLIENT_ID                 server-only
SPOTIFY_CLIENT_SECRET             server-only
NEXT_PUBLIC_POSTHOG_KEY           client-safe
NEXT_PUBLIC_POSTHOG_HOST          client-safe
```

`.env.local` for local dev (gitignored, already in place). Same variable set configured in Vercel's dashboard for Preview and Production. **Proposed for the friend beta: one Supabase project shared across local dev and production**, distinguished by the `profiles.is_founder` flag and a PostHog `environment` property rather than fully separate infra — flagged as Open Question #3, since the standard/safer practice is separate dev and prod projects.

---

## 14. Error handling

- Server Actions return a typed result — `{ ok: true, data }` or `{ ok: false, code, message }` — never throw raw errors to the client.
- Track metadata failure degrades gracefully (§9) rather than blocking recommendation creation.
- Network/timeout errors on `createRecommendation` are safe to retry: the client generates one `idempotency_key` per composer session (e.g., on mount), and `unique(sender_id, idempotency_key)` makes a duplicate submit a no-op (return the existing row) rather than a duplicate recommendation — directly resolves the "duplicate submit caused by double-click/retry" edge case.

---

## 15. Deletion / mutation behavior

- Recommendations: soft delete only (`deleted_at`), sender-only, server-action-gated.
- Responses: editable in place (`response_type`, `updated_at` change; no history kept in V1 — not required by spec).
- Notes: immutable after creation (§6).
- No hard deletes anywhere in V1 — this is what makes pass-on lineage and analytics safe to reason about without dangling references (§6).

---

## 16. Security / abuse protections

- **No client-side writes at all** (§8) — the single biggest lever here, since it makes "modifying sender/recipient IDs client-side" structurally impossible rather than something to remember to check.
- Spotify URL validation via regex before any lookup; no arbitrary server-side fetch of user-supplied URLs (§9).
- Rate limiting: simple Postgres-based counters in the friend-beta phase (e.g., a rolling count of `recommendations` created by `sender_id` in the last hour, checked in the server action) rather than standing up Redis/Upstash — proposed as Open Question #4, since a dedicated rate-limiting service is the more standard answer if abuse becomes real.
- Guest response edit authorization is a signed, httpOnly cookie compared server-side against `responses.guest_session_id` — never trusted from a client-readable value.
- Email auth abuse: Supabase Auth's built-in OTP rate limiting covers the baseline; no custom SMS/Twilio surface exists to abuse (spec explicitly excludes phone auth).
- `deleted_at is not null` rows are never returned by the public `/r/[id]` route or by any authenticated read path — enforced once, centrally, in each query rather than per-surface.

---

## 17. Edge-case handling

Most edge cases from `docs/USER_FLOWS.md` §12 are addressed inline above (guest upgrade edge cases in §4, duplicate submit in §14, source-deleted-after-pass-on in §6/§15, tracking params/unsupported URLs in §9). Remaining ones, briefly:

- **Same link opened repeatedly / on multiple devices:** stateless reads, no session requirement to view — works by construction.
- **Registered recipient opens while logged out:** sees the same public page as a guest would (no special-cased "you should log in" wall) — they can still view/listen; responding while logged out is treated as a guest response (`attribution = 'guest'`) even though `recipient_type = 'registered'`, until they authenticate. This is a deliberate simplification worth confirming — see Open Question #5.
- **Multiple people with the same display name:** `recipient_user_id` is always a real FK chosen from the picker (which should disambiguate visually, e.g. show email-derived initials or join date — a UI concern, not a data-model one); the guest-name case never needed uniqueness since it was never an identity claim to begin with.
- **Someone maliciously responds through another person's guest URL:** the response is always `attribution = 'guest'` for guest-recipient recommendations, and the UI is expected to never claim "Charles said X" — only "someone responded" framing, per V1_SCOPE's explicit instruction not to let a forwarded-link responder "silently become Charles."

---

## 18. Future-extension points

- **Canonical song/recording layer:** add `tracks.canonical_song_id` (nullable FK to a future `canonical_songs` table) without touching `recommendations`.
- **Visibility:** add `recommendations.visibility` enum (`public | unlisted | private`), defaulting all existing rows to `unlisted`, whenever that's approved.
- **Feed:** can be built as a read-model/materialized view over `recommendations` + `responses` filtered by `visibility = 'public'` — no separate "posts" table, per V1_SCOPE §9's explicit instruction.
- **Additional providers:** `tracks.provider` is already a free-text discriminator; add a new adapter function alongside the Spotify one.
- **Link rotation:** if ever needed, add a separate `public_id` column and switch the route to look up by it — a mechanical migration given today's `id`-based design (§10).

---

## 19. Explicit architectural decisions intentionally deferred

- Full graph visualization / lineage beyond simple parent-chain display — not needed until Feed exists.
- Any background job/worker infrastructure — nothing in V1 needs async processing outside a single request lifecycle.
- Separate read replicas / caching layer — friend-beta scale doesn't warrant it.
- A dedicated notifications system (SMS/push) — explicitly out of scope.

---

## 20. Open questions requiring product approval

1. **Do guest responses ever become `attribution = 'verified'` after the guest creates a persistent account?** Proposed: no, they remain `'guest'` permanently — a guest response is never provably from the *intended* recipient, only from *a* person who's now identifiable. Flag if you want a different semantic (e.g., a distinct `'guest_upgraded'` tier).
2. **Public URL = row's `id` directly, or a separate rotatable `public_id`?** Proposed: use `id` directly for V1 simplicity (§10).
3. **One Supabase project for dev + prod during the friend beta, or split now?** Proposed: one project + `is_founder` flag, split later if it becomes painful (§13).
4. **Rate limiting: simple Postgres counters, or a dedicated service (Upstash Redis)?** Proposed: Postgres counters for now (§16).
5. **Registered recipient responding while logged out — treat as a full guest response, or force a login prompt first?** Proposed: treat as guest response, no forced login wall, to preserve the "no signup wall before responding" principle even for registered recipients (§17). Worth explicit confirmation since it means a registered user's own response could end up `attribution = 'guest'` if they forget to log in.
6. **"Existing registered recipient" picker — open search by display name for any user, or restricted to people the sender has an existing relationship with?** Not fully specified in the docs; proposed open search since no sensitive fields are exposed by `display_name` alone (§8), but this is a real product decision about discoverability.
