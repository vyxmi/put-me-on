# Put Me On — V1 User Flows

Canonical flow and identity behavior for V1. See also [V1_SCOPE.md](./V1_SCOPE.md) and [ANALYTICS.md](./ANALYTICS.md).

---

## 1. Sender identity

A sender must have a persistent verified account before creating recommendations.

V1 account authentication should be email-based, passwordless.

Preferred user experience: email → magic link or OTP → persistent session.

Do not add phone authentication or Twilio in V1.

A sender must have a display name before sending their first recommendation.

Do not require unnecessary onboarding fields. No required: bio, avatar, pronouns, taste quiz, favorite artists, genres, location.

Avoid pronouns in product copy when name-based copy works. Example: "let Vyomi know what you think" instead of requiring pronoun selection.

---

## 2. Recipient types

There are only two conceptual recipient states in V1.

### A. Existing registered recipient

Sender selects a known Put Me On user. Store their persistent user ID. Recommendation is added to their Inbox.

### B. Named guest recipient

Sender enters a simple name (e.g. "Charles"). No recipient account, email, or phone is required.

Store: recipient display label/name. No persistent recipient user ID yet.

Do NOT: collect someone else's phone number, create a public shadow profile, require contacts permission, require recipient signup before sender can send.

---

## 3. Guest-first receiving

The recipient landing page is a critical acquisition surface.

A recipient MUST be able to open an unlisted recommendation while logged out and immediately see: sender name, intended recipient name, track, artist, artwork, optional sender note, Listen action.

Example:

> vyomi wants to put charles on to
>
> Carry the Zero
> Built to Spill
>
> trust me after 2:34
>
> [ listen ]

There must be NO signup wall before viewing or listening.

---

## 4. Listening semantics

Clicking Listen means ONLY `listen_clicked`.

It does NOT mean: listened, completed track, liked, heard.

Put Me On cannot reliably know what happened after someone leaves for Spotify. Do not fake this data.

The recommendation remains available when the person returns through: original text/link, browser history, Inbox if logged in, existing browser session.

---

## 5. Response model

After returning, recipient sees: "what did you think?"

Exactly these V1 response types:
- already knew it
- not for me
- liked it
- put me on

A recommendation is NOT automatically a put-on. "put me on" is an explicit recipient response confirming meaningful attribution.

Responses should be editable because users can misclick.

### Guest responses

Do NOT force account creation before a named guest can respond. A guest may respond frictionlessly.

However, possession of an unlisted link does not cryptographically prove the viewer is the intended recipient.

Therefore architecture MUST preserve the distinction between:
- guest/unverified response
- response associated with an authenticated account
- response from the known registered intended recipient

Do not overengineer identity verification for the friend beta.

A forwarded URL is a known limitation. If a third party sees "Vyomi wants to put Charles on to Carry the Zero," they can view/listen because the URL is unlisted — but they must never silently become "Charles."

Strong/public lineage later should be able to distinguish verified from unverified provenance. Do not make V1 UI overly technical about this distinction.

---

## 6. Saving after response

After a guest responds, do NOT hard-sell "create an account." Use persistence framing.

Example:

> saved :-)
>
> save this + the music people send you?
>
> [your name] [email address] [save]

**Revised 2026-08-17 (product decision):** the save step asks for a display name as well as email, prefilled with the guest name the sender used for them on the recommendation (editable — the sender may have typed it wrong, or the guest may want something else). This intentionally supersedes the original guidance below, which is kept for context on the tradeoff being made.

Original guidance: do not force display name/handle at this save step unless technically necessary — email is the only information requested at this moment; if they later attempt to SEND a recommendation and do not yet have a display name, ask for it then. The tradeoff accepted by revising this: one extra field at the save moment, in exchange for the guest never hitting a second "what's your name?" interruption later at their first send, and their Inbox/response history reading with their own name immediately rather than the sender's guess at it.

After email verification:
- preserve the recommendation/response where technically safe
- give them a persistent account with the confirmed display name
- land them in their Inbox

Architecture proposal must explicitly explain how guest activity safely transitions to a persistent authenticated account, including edge cases involving: existing email/account, same browser, email verification opened on another device, duplicate identities, failed verification.

Do not silently merge accounts or histories if identity cannot be established safely.

---

## 7. Inbox

Inbox is the default logged-in destination/home. It contains recommendations sent to the user.

### Waiting

Recommendations without a response. Do not call them "unheard" — the product cannot know whether the person has heard the song. Do not use guilt/task-management language such as "overdue," "task," "pending action."

### History

Recommendations the user has responded to. Completed attribution semantics should be clear.

Example, after responding "put me on":

> Charles put you on
> Cleva · Erykah Badu

Not ambiguous copy like "Charles put me on."

Inbox is a persistent archive. Responding does not delete the recommendation.

---

## 8. Sent

Sent contains recommendations created by the user. It should make it easy to answer: "What happened to the thing I sent Maya?"

States: waiting for response, responded. Sender can see the recipient response.

V1 does not need automated SMS notifications.

---

## 9. Put someone on (creation flow)

Primary creation flow:

authenticated sender
→ paste exact Spotify track URL
→ fetch/display track metadata
→ choose recipient (existing user OR free-text guest name)
→ optional note
→ create recommendation
→ generate stable unlisted URL
→ open Web Share API / native device share sheet where supported
→ copy-link fallback

One recipient only. No mass recs. No visibility choice.

---

## 10. Pass it on / continuity

Keep lightweight pass-on behavior in V1 because it tests a core differentiator.

If Josh sends a track to Vyomi and Vyomi later recommends the same track onward from that recommendation: Josh → Vyomi → Charles.

The new recommendation is a NEW directed recommendation object. It should retain a reference to its source recommendation.

Important: forwarding/copying Josh's original URL to Charles does NOT create a new recommendation edge. Only an explicit "put someone else on" action creates the new edge.

### Semantics

Source provenance and confirmed "put-on" lineage are not identical.

Example: Josh → Vyomi exists because Josh sent Vyomi a rec. If Vyomi says "already knew it" and then sends the track to Charles, the source relationship can still be preserved, but do NOT describe Josh as having "put Vyomi on."

A confirmed put-on chain requires the relevant recipient response(s) to support that claim.

Architecture must keep recommendation transmission and confirmed put-on attribution semantically distinct.

---

## 11. Recommendation landing/acquisition flow (end to end)

registered sender
→ exact Spotify link
→ select existing recipient OR type recipient name
→ optional note
→ create
→ stable unlisted recommendation URL
→ sender manually shares link
→ recipient opens without signup
→ sees recommendation
→ clicks Listen
→ leaves to Spotify
→ returns
→ responds
→ response saved
→ guest is optionally asked for email to save history
→ email verification
→ persistent Inbox
→ later user can send their own recommendation

Do not interrupt this flow with unnecessary onboarding.

---

## 12. Important link/identity edge cases

Architecture proposal must explicitly address:

- recommendation link forwarded to someone else
- recommendation opened by link-preview bots/crawlers
- same link opened repeatedly
- same link opened on multiple devices
- registered recipient opens while logged out
- guest responds without signup
- guest responds then verifies email
- guest enters an email belonging to an existing account
- verification link opened on another device
- multiple people with same display name
- someone maliciously responds through another person's guest URL
- sender sends the same track to same recipient multiple times
- sender sends different Spotify versions of same song
- recipient changes response
- recipient later becomes registered
- sender deletes recommendation after response
- source recommendation is deleted after track was passed onward
- source recommendation had response other than put_me_on
- Spotify metadata fetch fails
- Spotify track later becomes unavailable
- unsupported Spotify URL type
- Spotify URL contains tracking/query parameters
- API/network timeout during creation
- duplicate submit caused by double-click/retry

Prefer graceful behavior and data integrity over elaborate UX.
