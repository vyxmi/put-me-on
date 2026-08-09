# Put Me On — V1 Scope

Canonical product definition, principles, and constraints for V1. See also [USER_FLOWS.md](./USER_FLOWS.md) and [ANALYTICS.md](./ANALYTICS.md). Read all three (plus the root `CLAUDE.md`) before proposing or changing architecture.

---

## 1. Product

Put Me On is a web-first product for intentional person-to-person music recommendations.

Core idea:

> Spotify knows what you listen to. Put Me On remembers who put you on.

People already send songs to friends through Spotify links/texts, but:
- links get buried
- people forget to listen
- people forget to reply
- there is no persistent recommendation inbox
- there is no record of who shaped someone's taste
- there is no continuity when a recommendation travels from person to person

Put Me On digitizes that existing behavior.

This is NOT:
- a streaming service
- a playlist manager
- a music rating site
- an algorithmic recommendation engine
- a posting-based social network
- "Letterboxd for music"
- "Airbuds with manual recommendations"

The atomic product object is:

> Person A intentionally recommends Track X to Person B.

---

## 2. V1 hypothesis

Test:

> Do people who already send music to friends prefer Put Me On because it preserves recommendations, closes the response loop, and remembers interpersonal influence?

Most important early success signal:

> Users recommend music to each other without the founder initiating or participating in the interaction.

Signups alone are not success.

---

## 3. V1 product principles

### Directed, never broadcast

Every recommendation has exactly ONE intended recipient.

There is no:
- "post"
- broadcast
- mass send
- send to followers
- global recommendation composer

Even if recipient is not a registered user, sender must answer:

> Who's this for?

A free-text recipient name is sufficient.

### No feed in V1

V1 intentionally does NOT contain a public feed.

This isolates whether direct recommendation exchange itself is valuable.

Future feed behavior must be generated from real directed recommendations. Users must never gain a "post to feed" action.

### No algorithm chooses music

Software may:
- search
- parse links
- organize data
- detect spam
- normalize metadata

Software must not choose:

> You should listen to this.

A human does that.

### Social, not social media

Do not introduce:
- follower counts
- engagement ranking
- like counts
- streaks
- leaderboards
- tastemaker scores
- creator analytics
- engagement optimization
- For You recommendations

### Provenance over popularity

Do not equate obscure music with better taste.

The important information is:

> Who introduced whom to what?

---

## 4. V1 content scope

V1 supports only individual Spotify tracks.

Sender provides an exact Spotify track URL.

V1 does NOT support:
- albums
- artists as recommendation objects
- playlists
- podcasts
- movies
- restaurants
- TV
- other streaming providers as first-class send inputs

Architect so other providers could be added later, but do not prematurely build a generic media platform.

---

## 5. Track identity

The exact Spotify track/version selected by the sender is the V1 object.

Do NOT attempt to merge:
- remasters
- deluxe editions
- reissues
- live recordings
- compilations
- alternate versions

Do NOT deduplicate based only on artist + title.

Two Spotify track IDs are different provider items unless a future canonical-recording layer explicitly groups them.

Architecture should allow a future abstraction roughly like:

canonical song/recording → provider-specific track/version

but V1 should not implement that abstraction unless it is essentially free and does not create false merges.

Cache enough provider metadata to render recommendations even if metadata fetching later fails.

Likely metadata:
- provider
- provider track ID
- canonical/source URL
- track title
- artist display string
- album
- artwork
- duration if available
- external identifiers if reliably available

Do not depend on Spotify OAuth/user authorization in V1.

Do not build playback. Listening happens externally on Spotify.

---

## 6. Visibility and link model

V1 recommendations are UNLISTED.

Meaning:

> Anyone with the recommendation URL can view it.

But:
- there is no feed
- there is no public browse surface
- there is no public search
- there are no public profiles
- recommendation pages should not be intentionally indexed by search engines

Do not expose a public/private selector in V1.

Architect so future visibility could support: public / unlisted / private — but V1 uses unlisted only.

### Recommendation URL

Every recommendation gets one stable, non-expiring, opaque URL.

Example conceptually: `/r/<unguessable-public-id>`

It must:
- remain usable over time
- allow repeat visits
- survive link previews/crawlers
- not expire after N clicks
- not confer identity
- not automatically "claim" a recipient

Do not use sequential enumerable recommendation IDs in public URLs.

There are NO claim tokens in V1.

The recommendation URL answers "which recommendation is this?" — it does NOT answer "who are you?"

---

## 7. Logged-in information architecture

Logged-in V1 has:
- Inbox
- Sent
- Put someone on
- Me
- minimal account/settings

No Feed. No Explore. No public social profile. No Notifications tab.

This is a responsive WEBSITE, not a native-app shell.

Frontend design is still actively being worked on. Do not redesign or replace current front-end work unless explicitly requested.

---

## 8. Me

Me is a PRIVATE personal archive in V1, not a public social profile.

It exists to demonstrate accumulated value from account ownership.

Possible V1 information:
- people who put you on
- things you successfully put others on to
- recently put on to
- lightweight counts
- observed recommendation chains from pass-on activity

Do NOT add: bio, followers, following counts, profile completion, popularity, genre scores, taste scores, badges, leaderboards.

### Chains

It is acceptable to show simple chains based on real observed V1 data, e.g.:

> Sam → You → Josh
> Dagger · Slowdive

Do not fabricate historical lineage. Do not implement a full graph visualization. Do not implement retroactive attribution in V1.

---

## 9. No public Feed in V1

Do not build a Feed now.

Future Feed requirement: the feed is generated from directed recommendation events. Users NEVER post to the feed.

Future example:

> Maya → Josh
> Carry the Zero · Built to Spill

A future user could observe this interaction. Possible later action: "listen too."

Future public activity may be filtered by following people, but following must mean "observe that person's real recommendation activity," not "subscribe to posts they broadcast."

Architecture should avoid making future Feed require a separate "posts" table/object if recommendation activity itself can drive it.

---

## 10. Future features architecture should not block

Do not implement these now, but avoid obvious dead ends:
- public recommendations
- private recommendations
- public feed
- public following
- third-party "listen too"
- richer lineage visualization
- retroactive attribution
- artist-level attribution
- native share extension
- automated SMS notifications
- web push
- additional music providers
- albums
- eventually other recommendation categories

Do NOT prematurely generalize V1 into a universal recommendation platform merely because these may exist later. Music comes first.

---

## 11. Retroactive attribution is NOT V1

Future example:

> Vyomi credits Josh with putting her onto Broadcast.

This differs from observed V1 provenance. Future historical attribution should be modeled as a user-authored claim, not an objective system fact.

Potential future non-user attribution: `Josh · pending` then a claim/acceptance flow.

Do not build: pending credit, claim links, artist attribution, historical attribution, non-user shadow profiles — in V1.

---

## 12. Conceptual data requirements

Do NOT implement schema until architecture approval.

The architecture proposal should account for concepts roughly equivalent to:

**User** — Persistent authenticated identity. Email is credential/contact data, not the conceptual permanent ID.

**Track** — Provider-specific exact track/version.

**Recommendation** — A directed recommendation containing: sender, intended recipient, track, optional note, visibility state, source recommendation if passed onward, timestamps/status/deletion as needed. Recipient must support: registered user, named guest.

**Response** — Recipient reaction: `already_knew`, `not_for_me`, `liked_it`, `put_me_on`. Must preserve whether attribution is verified/authenticated versus guest/unverified.

**Guest/anonymous state** — Must allow frictionless recipient behavior before permanent signup and safe upgrade to persistent identity.

Do not use a graph database for V1. A relational database should be sufficient.

Do not duplicate derived state unnecessarily if it can be safely derived from authoritative records.

---

## 13. Important data invariants

- A recommendation has exactly one sender.
- Sender is a persistent authenticated user.
- A recommendation has exactly one intended recipient conceptually.
- Recipient can be registered or a named guest.
- A recommendation has exactly one V1 track.
- A recommendation can have zero or one source recommendation.
- Pass-on creates a NEW recommendation.
- Recommendation != put-on.
- Listen click != listened.
- Response != verified identity.
- Guest response must remain distinguishable from verified intended-recipient response.
- Public URL possession != identity.
- Same track may be recommended many times.
- Do not deduplicate recommendation events.
- Track metadata may be deduplicated/cached by provider track identity.
- Recommendations and responses should retain historical timestamps.
- Response should be editable.
- Strong future lineage should be derivable without rewriting historical meaning.

---

## 14. Deletion / mutation behavior

Preferred principles:
- editing a response is allowed
- editing a recommendation note after sending should either be disallowed or clearly auditable; propose simplest safe approach
- sender should have a way to remove/delete a recommendation
- deleted recommendation URLs should show a neutral unavailable state
- prefer soft deletion if needed to preserve relational integrity/analytics without exposing removed content
- never expose deleted/private content through public endpoints

Do not overbuild moderation tooling for the friend beta.

---

## 15. Security requirements

Architecture proposal must explicitly cover:
- Supabase RLS or equivalent row-level authorization
- server-authoritative mutations for sensitive actions
- authenticated sender authorization
- safe guest/anonymous behavior
- opaque unguessable public recommendation identifiers
- no secrets in client code
- no secrets committed to git
- URL validation
- only fetch metadata from allowlisted provider domains
- do not server-fetch arbitrary user URLs
- rate limiting where abuse could cause cost or spam
- account/session handling
- email auth abuse prevention
- private future visibility compatibility
- protection against users modifying sender/recipient IDs client-side

Do not trust client-supplied identity fields.

---

## 16. Architecture philosophy

Optimize for: cheapest reasonable implementation, low operational complexity, fast iteration, strong data semantics, future extensibility without premature abstraction.

Prefer:
- Next.js / TypeScript / existing repo stack
- Postgres
- Supabase for DB/auth if appropriate
- server actions/API routes only where needed
- simple provider adapters
- PostHog for product analytics if appropriate
- Vercel deployment if appropriate

Avoid unless proven necessary: graph databases, microservices, queues, event buses, Redux, multiple analytics vendors, multiple auth vendors, Spotify user OAuth, realtime infrastructure, native applications, complex caching infrastructure, premature generic media abstractions.

"Vibe coded" means implementation labor is cheaper. It does NOT mean: more product states are free, security matters less, analytics can be improvised, data semantics can be vague, unnecessary features should be included.

---

## 17. V1 front-end surfaces

Current front-end is still being designed. Architecture must support these surfaces without dictating visual design:

**Logged out** — minimal homepage/login, recommendation landing page, email verification flow.

**Logged in** — Inbox, Sent, Me, Put someone on composer, recommendation detail, minimal account/settings.

Desktop website should be allowed to use master/detail layouts. Do not architect around mobile-native navigation assumptions.

---

## 18. V1 non-goals

Do NOT implement unless scope is explicitly changed:

Feed, Explore, public profiles, following, public/private visibility selector, SMS authentication, automated SMS notifications, web push, native mobile apps, native share extension, Spotify account connection, Spotify listening-history import, Spotify playback, search-for-song composer, canonical song/version merging, Last.fm integration, Apple Music integration, contact syncing, mass recommendations, comments, ratings, reviews, playlists, likes, follower counts, streaks, badges, taste scores, leaderboards, retroactive attribution, artist attribution, claim tokens, historical taste import, full graph visualization, AI recommendations, monetization, subscriptions, advertising, sponsored recommendations, other media categories.

---

## 19. Future product semantics to protect

**Feed** — Shows public directed recommendation events. No feed-specific posts.

**Listen too** — Third party discovers a track from observing someone else's recommendation. Must remain semantically distinct from direct recipient / direct put-on.

**Retroactive attribution** — User-authored historical claim (e.g. "Vyomi credits Josh with putting her onto Broadcast"). Not the same as observed product history.

**Artist attribution** — May connect a gateway track to broader artist influence. Must remain separate from track-level recommendation data.

**Non-user historical credit** — May eventually support pending attribution/claiming. Not V1.

**Other categories** — Put Me On may eventually extend beyond music. Do not optimize V1 architecture around this now.
