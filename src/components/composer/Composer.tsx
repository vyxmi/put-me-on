"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Artwork } from "@/components/Artwork";
import { CursorField } from "@/components/CursorField";
import { ShareIcon } from "@/components/icons/UtilityIcons";
import { useCurrentUser, usePeople, useRecommendation, useResponseActions, CURRENT_USER_ID } from "@/lib/data/store";
import { track as trackAnalytics } from "@/lib/analytics";
import type { Recipient, Track } from "@/lib/data/types";

export function Composer({ sourceId }: { sourceId?: string }) {
  const { resolveTrack, createRecommendation } = useResponseActions();
  const people = usePeople();
  const currentUser = useCurrentUser();
  const sourceItem = useRecommendation(sourceId ?? "");

  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [trackResult, setTrackResult] = useState<{ track: Track; ok: boolean } | null>(() =>
    sourceItem ? { track: sourceItem.track, ok: true } : null
  );

  const [recipientQuery, setRecipientQuery] = useState("");
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ id: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const isPassOn = Boolean(sourceId && sourceItem);

  useEffect(() => {
    if (isPassOn) {
      trackAnalytics("pass_on_started", { recommendation_id: sourceId });
    } else {
      trackAnalytics("recommendation_composer_opened");
    }
    // fire once per mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const otherPeople = useMemo(() => people.filter((p) => p.id !== CURRENT_USER_ID), [people]);
  const chips = useMemo(() => {
    const q = recipientQuery.trim().toLowerCase();
    const pool = q ? otherPeople.filter((p) => p.displayName.toLowerCase().includes(q)) : otherPeople;
    return pool.slice(0, 6);
  }, [otherPeople, recipientQuery]);
  const exactMatch = chips.some((p) => p.displayName.toLowerCase() === recipientQuery.trim().toLowerCase());

  async function handleUrlSubmit(e: FormEvent) {
    e.preventDefault();
    if (resolving) return;
    trackAnalytics("track_link_submitted");
    setResolving(true);
    const result = await resolveTrack(urlInput);
    setResolving(false);
    if ("error" in result) {
      setUrlError(true);
      return;
    }
    setUrlError(false);
    setTrackResult(result);
  }

  function handleSubmit() {
    if (!trackResult || !recipient || submitting) return;
    setSubmitting(true);
    const rec = createRecommendation({
      recipient,
      trackId: trackResult.track.id,
      note: note.trim() || undefined,
      sourceRecommendationId: isPassOn ? sourceId : undefined,
    });
    if (isPassOn) trackAnalytics("recommendation_passed_on", { recommendation_id: rec.id, source_recommendation_id: sourceId });
    setCreated(rec);
  }

  const recipientLabel = recipient
    ? recipient.type === "registered"
      ? people.find((p) => p.id === recipient.personId)?.displayName
      : recipient.name
    : null;

  if (created) {
    const url = typeof window !== "undefined" ? `${window.location.origin}/r/${created.id}` : `/r/${created.id}`;

    async function handleCopy() {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        // clipboard unavailable — the link is still visible to select manually
      }
      trackAnalytics("share_link_copied", { recommendation_id: created!.id });
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }

    async function handleShare() {
      trackAnalytics("share_action_opened", { recommendation_id: created!.id });
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        try {
          await navigator.share({ title: "put me on", url });
          return;
        } catch {
          // user dismissed the native sheet — fall through to copy
        }
      }
      handleCopy();
    }

    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-5 py-16 sm:px-6 text-center animate-fade-slide">
        {trackResult ? (
          <span className="relative inline-block">
            <Artwork
              seed={trackResult.track.artSeed}
              imageUrl={trackResult.track.artworkUrl}
              size={96}
              radius={2}
              halo
              className="animate-celebrate"
            />
            <span className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-xs bg-accent text-[13px] text-bg shadow-[0_0_20px_4px_rgba(166,160,240,.5)]">
              ✓
            </span>
          </span>
        ) : null}
        <p className="text-[17px] font-semibold text-text-primary">
          {isPassOn ? `passed on to ${recipientLabel}` : `sent to ${recipientLabel}`}
        </p>
        <p className="text-[13.5px] text-text-tertiary">they&apos;ll see it whenever they open the link.</p>
        <div className="flex w-full flex-col items-center gap-2">
          <div className="flex w-full items-center gap-2.5 rounded-xs border border-border px-4 py-2.5">
            <span className="min-w-0 flex-1 truncate text-left font-mono text-[12px] text-text-tertiary">{url}</span>
            <button type="button" onClick={handleCopy} className="shrink-0 text-[12px] text-accent-light hover:text-text-primary">
              copy
            </button>
          </div>
          {copied ? <p className="animate-copied font-mono text-[11px] text-accent">copied</p> : <p className="h-4" />}
        </div>
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 text-[13px] text-text-secondary transition-colors hover:text-text-primary"
        >
          <ShareIcon size={14} /> share
        </button>
        <Link href={`/sent/${created.id}`} className="text-link text-[13px] text-text-tertiary">
          view in sent →
        </Link>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col gap-8 overflow-hidden px-5 py-10 sm:px-6">
      <CursorField className="opacity-60" />
      <h1 className="relative z-10 text-center text-[20px] font-semibold text-text-primary">
        {isPassOn ? "pass it on" : "put someone on"}
      </h1>

      <div className="relative z-10 flex flex-col gap-8">
        {trackResult ? (
          <div className="flex animate-rise-in flex-col gap-2">
            <div className="flex items-center gap-4 rounded-xs border border-border p-4">
              <Artwork seed={trackResult.track.artSeed} imageUrl={trackResult.track.artworkUrl} size={52} radius={2} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-text-primary">{trackResult.track.title}</p>
                <p className="truncate text-[13px] text-text-secondary">{trackResult.track.artist}</p>
              </div>
              {isPassOn ? null : (
                <button
                  type="button"
                  onClick={() => {
                    setTrackResult(null);
                    setUrlInput("");
                  }}
                  className="shrink-0 text-[12px] text-text-tertiary transition-colors hover:text-text-secondary"
                >
                  change
                </button>
              )}
            </div>
            {!trackResult.ok ? (
              <p className="text-[12px] text-text-tertiary">
                couldn&apos;t load this one&apos;s details — you can still send it, they&apos;ll see it fine on spotify.
              </p>
            ) : null}
          </div>
        ) : (
          <form onSubmit={handleUrlSubmit} className="flex flex-col gap-2">
            <label htmlFor="spotify-url" className="text-[11px] uppercase tracking-wider text-text-tertiary">
              spotify link
            </label>
            <input
              id="spotify-url"
              type="url"
              inputMode="url"
              placeholder="paste a track link…"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={resolving}
              className="w-full border-0 border-b border-border bg-transparent px-0.5 py-2.5 text-[15px] text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none disabled:opacity-50"
            />
            {urlError ? (
              <p className="text-[12px] text-warn">that doesn&apos;t look like a spotify link yet.</p>
            ) : null}
            <button
              type="submit"
              disabled={resolving}
              className="text-link mt-1 self-start text-[13px] text-accent-light disabled:opacity-60"
            >
              {resolving ? "looking it up…" : "continue"}
            </button>
          </form>
        )}

        {trackResult ? (
          <div className="flex animate-rise-in flex-col gap-2">
            <p className="text-[11px] uppercase tracking-wider text-text-tertiary">to</p>
            {recipient ? (
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold text-text-primary">{recipientLabel}</span>
                <button
                  type="button"
                  onClick={() => {
                    setRecipient(null);
                    setRecipientQuery("");
                  }}
                  className="text-[12px] text-text-tertiary transition-colors hover:text-text-secondary"
                >
                  change
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={recipientQuery}
                  onChange={(e) => setRecipientQuery(e.target.value)}
                  placeholder="search a name or type someone new…"
                  className="w-full border-0 border-b border-border bg-transparent px-0.5 py-2.5 text-[15px] text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
                />
                <div className="flex flex-wrap gap-2">
                  {chips.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setRecipient({ type: "registered", personId: p.id });
                        setRecipientQuery(p.displayName);
                      }}
                      className="rounded-xs border border-border px-3.5 py-2 text-[13px] text-text-secondary transition-all hover:border-border-strong hover:text-text-primary"
                    >
                      {p.displayName}
                    </button>
                  ))}
                  {recipientQuery.trim() && !exactMatch ? (
                    <button
                      type="button"
                      onClick={() => setRecipient({ type: "guest", name: recipientQuery.trim() })}
                      className="rounded-xs border border-dashed border-accent-dim px-3.5 py-2 text-[13px] text-accent-light"
                    >
                      add &ldquo;{recipientQuery.trim()}&rdquo; as someone new
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {recipient ? (
          <div className="flex animate-rise-in flex-col gap-2">
            <label htmlFor="note" className="text-[11px] uppercase tracking-wider text-text-tertiary">
              note (optional)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 140))}
              rows={2}
              placeholder="the part you want them to hear…"
              className="w-full resize-none border-0 border-b border-border bg-transparent px-0.5 py-2.5 text-[14.5px] text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
            />
          </div>
        ) : null}

        {recipient ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="animate-rise-in rounded-xs bg-accent px-4 py-3.5 text-[15px] font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isPassOn ? `pass it on to ${recipientLabel}` : `send to ${recipientLabel}`}
          </button>
        ) : null}
      </div>
      <p className="relative z-10 text-center font-mono text-[11px] text-text-tertiary">
        sending as {currentUser.displayName}
      </p>
    </div>
  );
}
