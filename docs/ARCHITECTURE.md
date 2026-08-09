# Put Me On — V1 Architecture Proposal

Status: **PROPOSED — revised per feedback below. Still not approved. Do not implement (schema, RLS, auth, API routes, product behavior) until this doc is explicitly approved.**

This proposal follows the requirements in `CLAUDE.md` and is built from `docs/V1_SCOPE.md`, `docs/USER_FLOWS.md`, and `docs/ANALYTICS.md`. Section numbers below match the checklist in `CLAUDE.md`, with one addition (Security Assumptions) requested during review.

All six open questions from the first draft were reviewed and are marked **RESOLVED** in §20 — the original rationale is kept alongside each resolution rather than deleted, so the reasoning stays visible.

---

## 1. System overview

A single Next.js (App Router, TypeScript) app deployed on Vercel, backed by **two** Supabase projects (dev + prod — see §13), with PostHog for analytics and Spotify's Web API (Client Credentials, app-only) for track metadata.

```
Browser
  │  reads: Inbox/Sent/Me, recipient picker (RLS-scoped, direct Supabase client)
  │  writes: Server Actions (Next.js) ──► Supabase (service role, bypasses RLS)
  │  public page: /r/[public_id] rendered server-side (service role, read-only)
  │  guest identity: Supabase Anonymous Auth session (real auth.users row, is_anonymous=true)
  ▼
Next.js (Vercel)
  ├─ Server Actions: create recommendation, submit response, delete, pass-on
  └─ Spotify Client-Credentials token cache (in-memory, server-only)
        │
        ▼
Supabase (Postgres + Auth) — separate dev / prod projects
  ├─ auth.users (Supabase-managed: permanent via email OTP, or anonymous)
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
| DB | Supabase Postgres, **two projects (dev/prod)** | Relational is explicitly sufficient per spec; free tier supports two active projects, so dev and prod get real isolation at no extra cost (§13) |
| Auth | Supabase Auth — email OTP/magic link for permanent accounts, **Anonymous Auth for guests** | Passwordless email required by spec; Anonymous Auth gives guests a real, upgradeable identity instead of a bespoke cookie system (§3–4) |
| Analytics | PostHog (client + server capture) | Already chosen by you; supports the event taxonomy in `docs/ANALYTICS.md` directly |
| Track metadata | Spotify Web API, Client Credentials flow | App-only auth (no user OAuth, per spec); richer/more reliable data than oEmbed |
| Hosting | Vercel | Pairs naturally with Next.js; no infra to manage |

Explicitly avoided (per spec's "avoid unless proven necessary" list, and confirmed in review): a separate backend service, a queue/event bus, Redux, a second analytics vendor, Spotify user OAuth, realtime infrastructure, **and a dedicated rate-limiting service (Upstash/Redis)** — Postgres counters are sufficient until there's evidence otherwise (§16).

---

## 3. Authentication / guest identity strategy

**Registered users:** Supabase Auth, email + OTP (recommended over a clickable magic link since OTP codes work across devices — the user can read the code on their phone and type it wherever they started). Session via `@supabase/ssr` cookie-based sessions.

**Guests (no account yet): Supabase Anonymous Auth**, not a custom cookie/token scheme. The first time a browser needs to act as a guest (submitting a response), the client establishes a Supabase session via `signInAnonymously()` if it doesn't already have one. This creates a real `auth.users` row (`is_anonymous = true`) with a stable UID and a normal Supabase session/JWT — the same session mechanism used for permanent accounts.

This directly replaces the original design's `guest_session_id` cookie: `responder_user_id` is now **always** a real, validated user id (anonymous or permanent), never a nullable custom token. Editing a response later is just "does the calling session's `auth.uid()` match `responses.responder_user_id`" — no bespoke cookie-comparison logic needed.

**Important distinction preserved from feedback:** an anonymous session becoming a permanent account later does **not** retroactively prove anything about who the anonymous person was. For a named guest (free-text recipient name), there was never a verified identity claim to begin with — see `response_origin` in §5, which snapshots this fact permanently at response time rather than deriving it from the account's *current* status.

---

## 4. Guest-to-persistent-account upgrade strategy

Uses **Supabase's native anonymous-to-permanent conversion** (`supabase.auth.updateUser({ email })` called from the client while the anonymous session is active), not a manual data-transfer step.

1. Guest responds → `responses` row created with `responder_user_id = <anonymous auth.uid()>` (this *is* ownership — see §5), `response_origin = 'guest'` (snapshot, permanent), `identity_assurance` computed per §5.
2. Guest is shown the "save this?" email prompt (`docs/USER_FLOWS.md` §6). They submit an email.
3. Client calls `supabase.auth.updateUser({ email })` on the existing anonymous session. Supabase sends an OTP/confirmation to that address.
4. On successful verification, **Supabase converts the same `auth.users` row in place** — same UID, `is_anonymous` flips to `false`, an identity is linked. Because every `responses.responder_user_id` already pointed at that UID, **all of that guest's response history is already correctly attributed with zero migration/transfer code.** This is a meaningful simplification over the first draft's custom `guest_session_id` transfer query.
5. `response_origin` on existing rows is **not** rewritten — it still reads `'guest'` forever, because that's a historical fact about how the response was made, independent of what the account becomes later. New responses made *after* conversion (as the now-permanent account) get `response_origin = 'authenticated'`.
6. **Edge case — email already belongs to an existing permanent account:** Supabase's `updateUser({ email })` rejects this (the email is already claimed). We do not attempt to merge. The UI tells the person "this email already has an account — sign in instead," and their current anonymous session's history stays exactly where it is (still fully usable, still editable from that browser) rather than being silently discarded or force-merged.
7. **Edge case — confirmation opened on a different device:** because conversion mutates the underlying account (not a browser-scoped token), the account itself becomes permanent regardless of which device completes the confirmation. The device that completes it gets an authenticated session for that account; the originating device, if different, keeps functioning as before and picks up the new (permanent) state on its next session refresh — no history is lost on either device.
8. **Edge case — failed/abandoned verification:** the anonymous session is untouched; the guest keeps a fully functional, editable anonymous response with no account. Nothing is mutated until verification succeeds.
9. Display name and `handle` are not requested at this step (per spec/§5) — display name is asked for the first time this now-permanent account tries to *send* a recommendation; `handle` was already auto-assigned when the row was first created (§5).

---

## 5. Conceptual schema / tables

```
profiles              (1:1 with auth.users — created for both permanent and anonymous rows)
  id               uuid PK, references auth.users(id)
  handle           text not null unique      -- auto-assigned at creation, immutable in V1;
                                              -- exists only to disambiguate the recipient
                                              -- picker when display_name collides, not a
                                              -- social/public username system
  display_name     text null                 -- required before first send, not before
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
  id                       uuid PK default gen_random_uuid()   -- internal identity ONLY,
                                                                -- never exposed in a URL
  public_id                text not null unique                -- random, URL-safe (e.g. a
                                                                 -- 16-byte base62/nanoid value);
                                                                 -- this is what /r/[public_id]
                                                                 -- looks up. Decoupled from `id`
                                                                 -- on purpose — see §10.
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
  responder_user_id  uuid not null references profiles(id)   -- ALWAYS set now: anonymous or
                                                               -- permanent Supabase user, never
                                                               -- a bare cookie/token
  response_origin    text not null            -- 'guest' | 'authenticated' — a PERMANENT
                                                -- snapshot of whether responder_user_id was
                                                -- anonymous at the moment this row was written.
                                                -- Never recomputed after the account upgrades.
  identity_assurance text not null            -- 'none' | 'recipient_confirmed' — see rule below.
                                               -- Records what was actually VERIFIED about who
                                               -- responded. Does NOT decide whether this row
                                               -- belongs in someone's account — that's ownership
                                               -- (responder_user_id), a separate concern below.
  created_at         timestamptz not null default now()
  updated_at         timestamptz not null default now()
  unique (recommendation_id)
```

### Three separate concepts on `responses` — do not conflate them

This table intentionally keeps three different questions in three different fields, because collapsing them caused the wrong behavior in the first draft:

| Concept | Field | Mutable? | Answers |
|---|---|---|---|
| **Ownership** | `responder_user_id` | Yes, in principle | "Whose account does this response currently live under? What shows up in their Inbox/Me?" |
| **Origin** | `response_origin` | No — write-once | "What was the verification *context* at the moment this row was created — anonymous or already-permanent?" |
| **Identity assurance** | `identity_assurance` | No — computed once, at write time | "What did we actually confirm about who this was, at that moment?" |

**Ownership** is what determines whose history a response appears in. In V1, ownership only ever moves via Supabase's native anonymous→permanent conversion (§4) — the underlying `auth.users` row keeps the exact same UID, so `responder_user_id` never literally changes value; what changes is that UID's *account* going from ephemeral/anonymous to durable/permanent. This is deliberately left open as a concept (not hard-coded as "immutable once set") so a future explicit claim mechanism — e.g. recovering history from a different device/browser — can reassign ownership later without touching `response_origin` or `identity_assurance` on the historical rows at all. Nothing in V1 needs that second mechanism; the schema just doesn't foreclose it.

**`identity_assurance` rule (computed once, at write time, by the server action — never retroactively recomputed):**
`identity_assurance = 'recipient_confirmed'` if and only if `recommendation.recipient_type = 'registered'` **and** `responder_user_id = recommendation.recipient_user_id` **and** `response_origin = 'authenticated'` at that exact moment — i.e., we affirmatively confirmed this was the named recipient's own authenticated account responding. Every guest-recipient response, and every response made from an anonymous session, is `'none'` — not because it's illegitimate or excluded from anyone's history, but simply because there was nothing to confirm. Because registered-recipient responses now *require* login as the exact recipient before they can be created at all (§20 Q5), in practice every `recipient_type = 'registered'` response ends up `'recipient_confirmed'` — but the field is still computed explicitly rather than assumed, so the invariant is visible in the data itself, not just enforced procedurally.

**This is exactly what makes the intended guest→account experience work:** someone can arrive as a nameless guest, respond immediately, build a little history of `identity_assurance = 'none'` / `response_origin = 'guest'` responses under their anonymous account, decide Put Me On is useful, type their email, and the moment they verify it, that entire accumulated history appears under their new permanent account — automatically, with no filtering or re-processing — because ownership (`responder_user_id`) never had to change. `response_origin` and `identity_assurance` on those historical rows stay exactly as recorded, permanently — an honest record of what was actually true at the time, independent of what the account later becomes.

**Not modeled as tables:** `listen_clicked` is a PostHog event only — no product surface needs to query "did they click listen" from Postgres, so persisting it in the DB would be pure duplication. If that changes later, it's an additive table.

---

## 6. Important fields and constraints

- `recommendations` CHECK constraint enforces the registered-vs-guest recipient shape (§5) — the DB itself makes the "recipient must be exactly one of two types" invariant impossible to violate, not just an app-layer convention.
- `recommendations.public_id` is a **separate, random, unique identifier from `id`** — the permalink and the relational primary key are intentionally decoupled (§10). `id` never appears in a URL or client-visible string.
- `responses` has `unique(recommendation_id)` — one response per recommendation, edited in place (matches "responses should be editable," not versioned/appended).
- `responses.response_origin` is write-once, set only at row creation, never updated by any later action (including the anonymous→permanent conversion in §4) — it is historical truth, not current status.
- `tracks` has `unique(provider, provider_track_id)` — the natural dedup key; recommendations pointing at the "same song" but different Spotify track IDs (remaster, live version, etc.) correctly get different `tracks` rows, per `docs/V1_SCOPE.md` §5.
- Soft delete only: `recommendations.deleted_at`. Nothing is ever hard-deleted, which keeps `source_recommendation_id` foreign keys valid forever and keeps analytics/pass-on lineage intact even after a sender removes a recommendation, and keeps the "source recommendation deleted after track passed onward" edge case (`docs/USER_FLOWS.md` §12) trivial to handle.
- `note` is immutable after creation (no note-editing action exists) — per `docs/V1_SCOPE.md` §14's own suggested simplest-safe-approach: disallow note edits; sender can delete and resend.
- `profiles.handle` is unique and immutable in V1 — a disambiguator, not a feature. No handle-editing UI, no public handle page.

---

## 7. Indexes

```
recommendations (sender_id)
recommendations (recipient_user_id)
recommendations (source_recommendation_id)
recommendations (track_id)
responses (responder_user_id)
```
(`recommendations.public_id`, `recommendations.id`, `tracks(provider, provider_track_id)`, `responses(recommendation_id)`, and `profiles.handle` are already indexed via their PK/unique constraints.)

---

## 8. RLS / authorization model

**All mutations go through Next.js Server Actions using the Supabase service-role key. No `insert`/`update`/`delete` RLS policies exist for the `authenticated` or `anon` roles on any table — writes from those roles are denied by default.** This directly satisfies "server-authoritative mutations for sensitive actions" and "protection against users modifying sender/recipient IDs client-side": there is no client-side write path to bypass, full stop. (See the new §12 Security Assumptions table for the exact credential context of every action.)

**Reads** are split three ways:

- **Authenticated, own-data reads** (Inbox, Sent, Me) go **directly from the browser to Supabase** using the anon key + the caller's session JWT (permanent accounts only — anonymous sessions have no Inbox/Sent/Me to read), protected by RLS `select` policies scoped to `auth.uid()`:
  - `recommendations`: select where `sender_id = auth.uid() or recipient_user_id = auth.uid()`
  - `responses`: select where the joined recommendation's `sender_id = auth.uid() or recipient_user_id = auth.uid()`, **or** `responder_user_id = auth.uid()` directly — this last clause is a bonus enabled by Anonymous Auth: a guest's own browser can now read its own response row via RLS instead of only through the service-role page.
  - `tracks`: select allowed for any `authenticated` user (no sensitive data)
  - `profiles`: select own row directly; select `(id, handle, display_name)` of others only via a narrow `public_profiles` view (columns limited on purpose, and filtered to rows where `display_name is not null`, which naturally excludes anonymous/incomplete accounts from the picker).

- **The public, logged-out `/r/[public_id]` page** is rendered server-side using the **service role** (bypassing RLS entirely) in a Server Component, because it must work with zero authentication and must not require opening any RLS policy to the `anon` role. A logged-out visitor's browser never talks to Supabase directly at all on this page; every read goes through Next.js.

- **Response submission for a `recipient_type = 'registered'` recommendation** additionally requires the caller's session to match `recipient_user_id` exactly (§20 Q5) — this is an application-layer check inside the server action, not an RLS policy, since RLS has no insert policy on `responses` for any role to begin with.

---

## 9. Spotify metadata strategy

*(unchanged from the first draft)*

Use the **Client Credentials flow** (app-only, no user OAuth) against Spotify's Web API:

1. Sender pastes a URL. Server validates it matches `open.spotify.com/track/<id>` (regex), strips query params (e.g. `?si=...`), and extracts `provider_track_id`.
2. Server calls `GET /v1/tracks/{id}` using a cached app access token (fetched via Client Credentials, cached in-memory server-side with its expiry).
3. On success: upsert into `tracks` (`metadata_status = 'ok'`), fire `track_metadata_loaded`.
4. On failure: still create the `tracks` row with whatever's derivable from the URL alone, `metadata_status = 'failed'`, fire `track_metadata_failed`. The recommendation is still created.

This never fetches an arbitrary user-supplied URL server-side — it only ever calls Spotify's own API with an extracted ID — so there's no SSRF surface to defend, beyond the initial regex validation of the pasted URL.

---

## 10. URL / link strategy

**Revised per feedback: `recommendations.public_id` is a separate, randomly generated column — not the row's `id`.**

- `public_id`: a random, URL-safe value (e.g., 16 bytes, base62 or nanoid-encoded) generated at creation time, unique-constrained, used exclusively for `/r/[public_id]`.
- `id` (the real primary key, referenced by every FK including `source_recommendation_id`) is never exposed to any client, ever.
- This decouples the permalink from relational identity: a future need to rotate, revoke, or reissue a public link no longer requires touching the row's real identity or any FK that points at it — it's a single-column update on `public_id` itself (or, if true revocation-with-history is needed later, adding a `public_id_history` table is additive, not a migration of existing relationships).
- **"Recommendation URL ≠ authentication."** Knowing/having `public_id` grants exactly one thing: the ability to view that single unlisted page. It is never treated as a credential for anything else. Every other action — submitting a response as a specific registered recipient, editing a response, deleting a recommendation — is authorized via the caller's actual Supabase session, never via URL possession. This is stated explicitly in §16 Security Assumptions so it stays an enforced property, not just a design intention.
- Page behavior: Next.js Server Component at `/r/[public_id]`, service-role read by `public_id`, `deleted_at is null` check, renders full OG meta tags (so link previews work) and `<meta name="robots" content="noindex">`. Deleted/missing → the same neutral "this recommendation is no longer available" page regardless of which reason, so no information leaks about whether an id never existed vs. was deleted.
- `recommendation_viewed` fires **client-side after hydration**, not from the server render, so link-preview crawlers and bots don't pollute the metric (`docs/ANALYTICS.md` §3).

---

## 11. Server actions / API boundaries

| Action | Trigger | Notes |
|---|---|---|
| `createRecommendation` | Composer submit | Requires a **permanent** (non-anonymous) session — sender_id is read from that validated session, never client-submitted. Validates Spotify URL, resolves/upserts track, validates recipient. Idempotency key from client dedupes double-submit. |
| `submitResponse` — guest recipient | Recipient picks a response, `recipient_type = 'guest'` | Client ensures an anonymous session exists (`signInAnonymously()` if not) before calling. `responder_user_id` and `response_origin = 'guest'` are derived from that validated session. |
| `submitResponse` — registered recipient | Recipient picks a response, `recipient_type = 'registered'` | **Requires** `session.user.id === recommendation.recipient_user_id` and `!is_anonymous`. If not satisfied, rejects with an auth-required error; UI prompts login at this step specifically (view/listen remain open with no wall). This is the resolution to Q5 (§20) — it's what stops a forwarded link from letting someone else submit the *named* recipient's response. |
| `editResponse` | Recipient changes response | Authorization: `session.user.id === responses.responder_user_id`. Works identically for anonymous and permanent sessions — no separate cookie/token logic needed anymore. |
| `deleteRecommendation` | Sender removes a rec | Requires permanent session; `sender_id` match checked server-side. |
| `passItOn` | "Put someone else on" from a received rec | Requires a permanent session (same identity rule as `createRecommendation` — passing on means becoming a sender). Creates a *new* recommendation row with `source_recommendation_id` set; never mutates the original. |
| Anonymous → permanent conversion | Guest submits email to "save" | Handled by Supabase's native `updateUser({ email })` (§4) — not a bespoke route handler doing manual data transfer. A lightweight callback still exists to fire the `guest_upgraded_to_account` analytics event and to prompt for a display name on next send. |
| `setDisplayName` | First send attempt without a display name | Required before `createRecommendation` proceeds. |

All of these run with the service-role key server-side (except the native Supabase Auth conversion, which is Supabase's own surface — see §12); none are reachable as open Supabase REST/RPC endpoints from the client.

---

## 12. Security assumptions

*(New section, added per review — states explicitly which credential context each action uses and where RLS is/isn't the enforcement boundary, rather than leaving that implicit across §8 and §11.)*

| Action / surface | Credential context | RLS expectation |
|---|---|---|
| Client reads: Inbox, Sent, Me | Browser → Supabase directly, anon key + caller's own session JWT (permanent accounts) | RLS `select` policies scope every row to `auth.uid()`. This is the **only** path where RLS is the actual enforcement boundary. |
| Client reads: response row (guest or registered) | Browser → Supabase directly, anon key + session JWT (anonymous or permanent) | RLS `select` on `responses` includes `responder_user_id = auth.uid()`, enabled by Anonymous Auth giving guests a real session. |
| Client reads: recipient picker (`public_profiles` view) | Browser → Supabase directly, anon key + session JWT | RLS `select` on the view; limited to `id, handle, display_name`, filtered to rows with `display_name is not null`. |
| Public `/r/[public_id]` page | Next.js Server Component → Supabase using the **service-role key** | RLS is bypassed by design. No `anon`-role policy exists for this table — a logged-out browser never talks to Supabase directly, so the enforcement boundary is application code (Next.js route logic: look up by `public_id`, require `deleted_at is null`), not RLS. |
| `createRecommendation`, `deleteRecommendation`, `passItOn` | Server Action → Supabase using the **service-role key**, after validating the caller's session server-side and reading identity fields (`sender_id`, etc.) from that validated session — never from a client-submitted field | RLS has **no** `insert`/`update`/`delete` policy for `authenticated`/`anon` on `recommendations` at all — these actions are the only write path, full stop. |
| `submitResponse` (either recipient type) | Server Action → Supabase using the **service-role key**; `responder_user_id`/`response_origin` derived from the caller's validated session (anonymous or permanent) | No client insert policy on `responses`, ever. For registered recipients, the exact-match-and-non-anonymous check (§11) is application code inside this action, not RLS. |
| `editResponse` | Server Action → Supabase using the **service-role key**; authorization is `session.user.id === responses.responder_user_id` | Same no-client-write posture; identity check is in the action. |
| Anonymous → permanent conversion | Client SDK → Supabase Auth directly (`updateUser`) — this touches `auth.users`/`auth.identities`, not our `public` schema tables | N/A to our RLS — governed entirely by Supabase Auth's own rules. |
| Server-side rate-limit counters | Server Action → Supabase using the **service-role key** (checks/increments a counter row before allowing the real write to proceed) | Not client-reachable; same posture as the write actions above. |

**Standing assumption:** the `anon`/`authenticated` Postgres roles (used only by the client-read paths above) never have write access to anything, and the public unlisted page never uses them at all — it always uses the service role from trusted server code. If a future change ever adds a genuine client-side write, it must go through the same validated-session-then-service-role pattern used everywhere above, not a new RLS write policy for `anon`/`authenticated`.

---

## 13. Analytics integration

*(renumbered from §12 in the first draft — content unchanged except where noted)*

- **Client-side capture** (PostHog JS) for interaction/visibility events: `recommendation_viewed` (post-hydration), `listen_clicked`, `share_action_opened`, `share_link_copied`, `recommendation_composer_opened`, `inbox_viewed`, `sent_viewed`, `me_viewed`, `guest_save_prompt_shown`.
- **Server-side capture** (PostHog Node, from inside Server Actions) for persisted/authoritative events: `recommendation_created`, `response_submitted`, `put_on_confirmed`, `recommendation_passed_on`, `guest_email_submitted`, `guest_upgraded_to_account` (fired from the lightweight callback in §11, keyed off Supabase's `is_anonymous` flipping to false), `track_metadata_loaded`/`track_metadata_failed`.
- `is_founder` (from `profiles.is_founder`) is attached to every server-side event and set as a PostHog person property, so founder activity can be excluded from funnels via a saved filter.
- No PII (email, phone, note text, OTP/tokens) ever passed as an event property — only internal IDs, per the taxonomy. `is_anonymous`/`response_origin` are not PII and are fine to include as properties for funnel analysis (e.g., guest response rate vs. authenticated response rate).
- Local/dev events tagged with an `environment` property, filterable out of production dashboards — reinforced now that dev and prod also sit on physically separate Supabase projects (§14), so there's no ambiguity about which environment a row of data came from.

---

## 14. Environment strategy

**Revised per feedback: separate Supabase projects for dev and prod, set up now, not deferred.**

- **`put-me-on-dev`** — used by local development and Vercel Preview deployments.
- **`put-me-on-prod`** — used by Vercel Production only.

Both fit inside Supabase's free-tier allowance of two active projects, so there's no cost to doing this now, and it avoids the alternative cost later: cleaning fabricated test users, throwaway recommendations, and experimental migrations out of a database that's also feeding real product metrics — especially relevant here since AI coding agents (including this one) may run schema changes or seed data during development.

```
NEXT_PUBLIC_SUPABASE_URL          client-safe, differs per environment
NEXT_PUBLIC_SUPABASE_ANON_KEY     client-safe, differs per environment
SUPABASE_SERVICE_ROLE_KEY         server-only, never NEXT_PUBLIC_*, differs per environment
SPOTIFY_CLIENT_ID                 server-only (can be shared across environments)
SPOTIFY_CLIENT_SECRET             server-only (can be shared across environments)
NEXT_PUBLIC_POSTHOG_KEY           client-safe
NEXT_PUBLIC_POSTHOG_HOST          client-safe
```

`.env.local` (gitignored, already in place) holds `put-me-on-dev` credentials for local work. Vercel's dashboard holds the same variable names scoped per-environment (Preview → dev project, Production → prod project) using Vercel's native per-environment env var support.

Schema changes are authored as Supabase CLI migration files, applied to `put-me-on-dev` first and verified there, then applied to `put-me-on-prod` via the same migration files — so the two schemas stay identical by construction rather than by manual replication.

---

## 15. Error handling

*(renumbered from §14 — unchanged)*

- Server Actions return a typed result — `{ ok: true, data }` or `{ ok: false, code, message }` — never throw raw errors to the client.
- Track metadata failure degrades gracefully (§9) rather than blocking recommendation creation.
- Network/timeout errors on `createRecommendation` are safe to retry: the client generates one `idempotency_key` per composer session, and `unique(sender_id, idempotency_key)` makes a duplicate submit a no-op (return the existing row) rather than a duplicate recommendation.

---

## 16. Deletion / mutation behavior

*(renumbered from §15 — unchanged)*

- Recommendations: soft delete only (`deleted_at`), sender-only, server-action-gated.
- Responses: editable in place (`response_type`, `updated_at` change; no history kept in V1).
- Notes: immutable after creation.
- No hard deletes anywhere in V1.

---

## 17. Security / abuse protections

**Revised per feedback: Postgres-only rate limiting confirmed (no Upstash), and explicit reliance on Supabase Auth's own OTP protections.**

- **No client-side writes at all** (§8, §12) — the single biggest lever here, since it makes "modifying sender/recipient IDs client-side" structurally impossible rather than something to remember to check.
- Spotify URL validation via regex before any lookup; no arbitrary server-side fetch of user-supplied URLs (§9).
- **Rate limiting: simple Postgres-based counters** (e.g., a rolling count of `recommendations` created by `sender_id` in the last hour, checked in the server action before writing) — confirmed as sufficient; there's no evidence yet that a dedicated service (Upstash/Redis) is needed, and adding one now would be architecture-cosplay for a friend beta. Revisit if real abuse shows up.
- **Email OTP abuse:** rely on Supabase Auth's own built-in rate limiting for OTP requests rather than building custom throttling — no reason to reinvent it, and there's no SMS/Twilio surface in this product to worry about (phone auth is explicitly out of scope).
- Guest response edit authorization is the caller's real Supabase session (`auth.uid() = responder_user_id`, §11) — no signed cookie/token scheme to maintain, since Anonymous Auth gives guests a real session already.
- **Recommendation URL ≠ authentication** (§10, §12): `public_id` possession only ever grants read access to one page. It is never accepted as authorization for a response, edit, delete, or send — those all require the caller's actual session, checked explicitly in each server action.
- `deleted_at is not null` rows are never returned by the public `/r/[public_id]` route or by any authenticated read path — enforced once, centrally, in each query rather than per-surface.

---

## 18. Edge-case handling

*(renumbered from §17; §5's "registered recipient opens while logged out" case is now resolved differently than the first draft — see below)*

- **Same link opened repeatedly / on multiple devices:** stateless reads, no session requirement to view — works by construction.
- **Registered recipient opens while logged out:** they can still view/listen with no wall (the page itself never requires login). **Responding does require login as exactly that recipient** (§11, §20 Q5) — if they try to respond while logged out, or logged in as someone else, the action rejects and the UI prompts login for the correct account at that specific step. This is the direct fix for the "Maya forwards her link to Josh, Josh submits Maya's response" problem raised in review.
- **Multiple people with the same display name:** the recipient picker shows `handle` alongside `display_name` when there's a collision (§5) — `handle` exists for exactly this case. `recipient_user_id` is always the real FK selected from that disambiguated picker, never inferred from a name string alone.
- **Someone maliciously responds through another person's guest URL:** for guest-recipient recommendations there was never a verified identity to begin with, so this isn't a new failure mode — the response is always `identity_assurance = 'none'`, and the UI is expected to never claim "Charles said X," only "someone responded" framing. Whoever's browser actually submitted it still *owns* that response (§5) and can see/edit it in their own history — the point is only that nobody else, including the sender, gets to treat it as a confirmed statement from "Charles."

Remaining edge cases from `docs/USER_FLOWS.md` §12 not called out above are covered inline in §4 (guest upgrade), §15 (duplicate submit), and §16/§6 (source-deleted-after-pass-on, tracking params/unsupported URLs).

---

## 19. Future-extension points

*(renumbered from §18 — unchanged, plus one addition)*

- **Canonical song/recording layer:** add `tracks.canonical_song_id` (nullable FK to a future `canonical_songs` table) without touching `recommendations`.
- **Visibility:** add `recommendations.visibility` enum (`public | unlisted | private`), defaulting all existing rows to `unlisted`, whenever that's approved.
- **Feed:** can be built as a read-model/materialized view over `recommendations` + `responses` filtered by `visibility = 'public'` — no separate "posts" table, per `docs/V1_SCOPE.md` §9.
- **Additional providers:** `tracks.provider` is already a free-text discriminator; add a new adapter function alongside the Spotify one.
- **Recipient discovery beyond open search:** if/when a relationship graph exists (mutuals, recent recipients), the picker can prioritize those results without changing the underlying model — `docs/V1_SCOPE.md` explicitly excludes building following/contacts/friend-requests just to support this, so this stays a ranking change, not a new subsystem (§20 Q6).
- **Link rotation:** now cheap by construction, since `public_id` is already decoupled from `id` (§10) — rotating a link is a single-column update, no relational migration needed.

---

## 20. Explicit architectural decisions intentionally deferred

*(renumbered from §19 — unchanged)*

- Full graph visualization / lineage beyond simple parent-chain display — not needed until Feed exists.
- Any background job/worker infrastructure — nothing in V1 needs async processing outside a single request lifecycle.
- Separate read replicas / caching layer — friend-beta scale doesn't warrant it.
- A dedicated notifications system (SMS/push) — explicitly out of scope.

---

## 21. Open questions — RESOLVED

Original rationale is kept below each item; the resolution is appended, not a replacement.

**1. Do guest responses ever become `attribution = 'verified'` after the guest creates a persistent account?**
> Original proposal: no, they remain `'guest'` permanently.
>
> **RESOLVED — reframed into three separate concepts, per further review.** The original single `attribution` field was conflating two different questions: "what got verified" and "does this belong in someone's account." Split into:
> - **Ownership** (`responder_user_id`) — whose account this response lives under, and therefore what shows up in their Inbox/Me. This *can* change in principle; in V1 it moves exactly once, automatically, via Supabase's native anonymous→permanent conversion (§4) — same UID throughout, so a guest's full history becomes the new account's history with zero migration.
> - **`response_origin`** (`'guest'` | `'authenticated'`) — a permanent, write-once historical record of the verification *context* at creation time. Never changes, regardless of what ownership later becomes.
> - **`identity_assurance`** (`'none'` | `'recipient_confirmed'`) — a permanent, write-once record of what was actually *confirmed* about identity at that moment. Purely descriptive — it never gates whether a response belongs in someone's history; ownership alone decides that.
>
> Net effect is the same as originally intended (an account upgrade never retroactively proves a guest's identity) but stated more precisely, and it's what makes the "nameless guest builds history, then claims it by verifying an email" experience work cleanly — see §5.

**2. Public URL = the row's `id` directly, or a separate rotatable `public_id`?**
> Original proposal: use `id` directly for V1 simplicity.
>
> **RESOLVED:** Use a **separate `public_id` column**, decoupled from the primary key. The extra column is effectively free now and avoids ever having to migrate relational identity to support link rotation/revocation later. See §5, §10.

**3. One Supabase project for dev + prod during the friend beta, or split now?**
> Original proposal: one project + `is_founder` flag, split later if it becomes painful.
>
> **RESOLVED:** **Split now** — `put-me-on-dev` and `put-me-on-prod`, both within the free-tier two-project allowance. Given clean metrics matter and AI agents may run schema/data changes during development, isolating dev from prod now is worth the (small) setup cost. See §14.

**4. Rate limiting: simple Postgres counters, or a dedicated service (Upstash Redis)?**
> Original proposal: Postgres counters for now.
>
> **RESOLVED: Confirmed as proposed.** Postgres counters, no Upstash, no dedicated rate-limiting service — no evidence of need yet. Also rely on Supabase Auth's own OTP rate limiting rather than building custom throttling. Revisit only if real abuse appears. See §17.

**5. Registered recipient responding while logged out — treat as a full guest response, or force a login prompt first?**
> Original proposal: treat as guest response, no forced login wall, to preserve "no signup wall before responding" even for registered recipients.
>
> **RESOLVED — reversed.** Viewing/listening stays wall-free for everyone. **Responding to a `recipient_type = 'registered'` recommendation requires being logged in as exactly that recipient.** The original proposal would have let a forwarded link (e.g. Maya's URL sent to Josh) allow Josh to submit a response that reads as Maya's — directly undermining the product's provenance thesis. Guest-recipient responses are unaffected (there was never a verified identity claim to protect there). See §11, §18.

**6. "Existing registered recipient" picker — open search by display name for any user, or restricted to people the sender has an existing relationship with?**
> Original proposal: open search, flagged as a real product decision about discoverability.
>
> **RESOLVED: Confirmed as proposed — open search by handle/display name.** Restricting to existing relationships creates a chicken-and-egg problem with no relationship graph to seed it from. `handle` is shown alongside `display_name` when names collide (new field, added in §5 specifically for this). No following/contacts-syncing/friend-requests are built to support this — ranking by recency/mutuals is a future, additive change to the picker's query, not a new subsystem. See §5, §18, §19.
