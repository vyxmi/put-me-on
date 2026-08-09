@AGENTS.md

# Put Me On

Web-first product for intentional person-to-person music recommendations. "Spotify knows what you listen to. Put Me On remembers who put you on." Directed (one sender → one recipient) music recommendations with a persistent Inbox — not a feed, not a streaming service, not an algorithmic recommender.

Full product context lives in:
- [docs/V1_SCOPE.md](./docs/V1_SCOPE.md) — product definition, principles, non-goals, data invariants, security requirements, architecture philosophy
- [docs/USER_FLOWS.md](./docs/USER_FLOWS.md) — sender/recipient identity, guest handling, response model, creation and acquisition flows, edge cases
- [docs/ANALYTICS.md](./docs/ANALYTICS.md) — event taxonomy, metrics, instrumentation caveats
- docs/ARCHITECTURE.md — proposed once the three docs above have been read; requires explicit approval before implementation (see below)

Read all three product docs before making any architectural or product-behavior decision in this repo.

## Phase gating — read before doing anything

1. Repository/environment setup (git, GitHub, MCP servers, env files) — no gate.
2. Product docs above are canonical once present in the repo.
3. Propose `docs/ARCHITECTURE.md` for review. Do not implement until it is explicitly approved.
4. Only after approval: database schema, Supabase tables, RLS policies, authentication architecture, API routes/server actions, product behavior.

If anything in the product docs is ambiguous or technically problematic, flag it in the architecture proposal instead of silently choosing behavior. Do not make product decisions based on assumptions before reading the docs above.

## Architecture proposal requirements

When proposing `docs/ARCHITECTURE.md`, include:

1. system overview
2. recommended stack and why
3. authentication/guest identity strategy
4. guest-to-persistent-account upgrade strategy
5. conceptual schema/tables
6. important fields and constraints
7. indexes
8. RLS/authorization model
9. Spotify metadata strategy
10. URL/link strategy
11. server actions/API boundaries
12. analytics integration
13. environment strategy
14. error handling
15. deletion/mutation behavior
16. security/abuse protections
17. edge-case handling
18. future-extension points
19. explicit architectural decisions that are intentionally deferred
20. open questions requiring product approval

For every nontrivial decision, explain: chosen approach, why, alternative considered, cost/complexity, future downside. Prefer the simplest architecture that correctly preserves the product semantics in the docs above.

## Secrets

Never commit secrets. `.env.local` is gitignored; `.env.example` (committed) lists variable names only.
