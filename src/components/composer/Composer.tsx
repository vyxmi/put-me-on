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

  const matches = useMemo(() => {
    const q = recipientQuery.trim().toLowerCase();
    if (!q) return [];
    return people.filter((p) => p.id !== CURRENT_USER_ID && p.displayName.toLowerCase().includes(q)).slice(0, 5);
  }, [people, recipientQuery]);

  const exactMatch = matches.some((p) => p.displayName.toLowerCase() === recipientQuery.trim().toLowerCase());

  function handleUrlSubmit(e: FormEvent) {
    e.preventDefault();
    trackAnalytics("track_link_submitted");
    const result = resolveTrack(urlInput);
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
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center animate-fade-slide">
        {trackResult ? <Artwork seed={trackResult.track.artSeed} size={96} radius={5} /> : null}
        <p className="text-[16px] text-text-primary">put on :-)</p>
        <div className="flex w-full flex-col items-center gap-2">
          <div className="w-full truncate rounded-sm border border-border px-3 py-2 font-mono text-[13px] text-text-secondary">
            {url}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-sm border border-border-strong px-3 py-1.5 text-[13px] text-text-primary transition-colors hover:border-accent-dim hover:text-accent"
            >
              <ShareIcon size={14} /> share
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-sm border border-border px-3 py-1.5 text-[13px] text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
            >
              copy link
            </button>
          </div>
          {copied ? <p className="animate-copied font-mono text-[11px] text-accent">copied</p> : <p className="h-4" />}
        </div>
        <Link href={`/sent/${created.id}`} className="text-link text-[13px] text-text-secondary">
          view in sent →
        </Link>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col gap-8 overflow-hidden px-6 py-10">
      <CursorField className="opacity-60" />
      <h1 className="relative z-10 text-center text-[20px] font-semibold text-text-primary">
        {isPassOn ? "pass it on" : "put someone on"}
      </h1>

      <div className="relative z-10 flex flex-col gap-8">
        {trackResult ? (
          <div className="flex animate-rise-in items-center gap-4 rounded-sm border border-border p-4">
            <Artwork seed={trackResult.track.artSeed} size={56} radius={4} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] text-text-primary">{trackResult.track.title}</p>
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
        ) : (
          <form onSubmit={handleUrlSubmit} className="flex flex-col gap-2">
            <label htmlFor="spotify-url" className="text-[14px] text-text-secondary">
              paste a Spotify link
            </label>
            <input
              id="spotify-url"
              type="url"
              inputMode="url"
              placeholder="https://open.spotify.com/track/..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="rounded-sm border border-border bg-transparent px-3 py-2.5 text-[14px] text-text-primary placeholder:text-text-tertiary focus:border-accent-dim"
            />
            {urlError ? (
              <p className="text-[12px] text-text-tertiary">that doesn&apos;t look like a Spotify track link yet.</p>
            ) : null}
            <button
              type="submit"
              className="mt-1 self-start rounded-sm border border-border-strong px-4 py-2 text-[13px] text-text-primary transition-colors hover:border-accent-dim hover:text-accent"
            >
              continue
            </button>
          </form>
        )}

        {trackResult ? (
          <div className="flex animate-rise-in flex-col gap-2">
            <p className="text-[14px] text-text-secondary">who&apos;s this for?</p>
            {recipient ? (
              <div className="flex items-center justify-between rounded-sm border border-border-strong px-3 py-2">
                <span className="text-[14px] text-text-primary">
                  {recipient.type === "registered"
                    ? people.find((p) => p.id === recipient.personId)?.displayName
                    : recipient.name}
                </span>
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
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  value={recipientQuery}
                  onChange={(e) => setRecipientQuery(e.target.value)}
                  placeholder="type a name"
                  className="rounded-sm border border-border bg-transparent px-3 py-2.5 text-[14px] text-text-primary placeholder:text-text-tertiary focus:border-accent-dim"
                />
                {recipientQuery.trim() ? (
                  <div className="flex flex-col overflow-hidden rounded-sm border border-border">
                    {matches.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setRecipient({ type: "registered", personId: p.id });
                          setRecipientQuery(p.displayName);
                        }}
                        className="px-3 py-2 text-left text-[14px] text-text-primary transition-colors hairline-b hover:bg-surface last:border-b-0"
                      >
                        {p.displayName}
                      </button>
                    ))}
                    {!exactMatch ? (
                      <button
                        type="button"
                        onClick={() => setRecipient({ type: "guest", name: recipientQuery.trim() })}
                        className="px-3 py-2 text-left text-[13px] text-text-secondary transition-colors hover:bg-surface"
                      >
                        put &ldquo;{recipientQuery.trim()}&rdquo; on — new
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ) : null}

        {recipient ? (
          <div className="flex animate-rise-in flex-col gap-2">
            <label htmlFor="note" className="text-[14px] text-text-secondary">
              say something? <span className="text-text-tertiary">optional</span>
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 140))}
              rows={2}
              placeholder="trust me after 2:34"
              className="resize-none rounded-sm border border-border bg-transparent px-3 py-2.5 text-[14px] text-text-primary placeholder:text-text-tertiary focus:border-accent-dim"
            />
          </div>
        ) : null}

        {recipient ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="animate-rise-in rounded-sm border border-accent-dim bg-transparent px-4 py-3 text-[15px] text-accent transition-colors hover:bg-accent-glow disabled:opacity-50"
          >
            put {recipient.type === "registered" ? people.find((p) => p.id === recipient.personId)?.displayName : recipient.name} on
          </button>
        ) : null}
      </div>
      <p className="relative z-10 text-center font-mono text-[11px] text-text-tertiary">
        sending as {currentUser.displayName}
      </p>
    </div>
  );
}
