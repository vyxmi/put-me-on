"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { Artwork } from "@/components/Artwork";
import { formatDuration } from "@/lib/utils/format";
import { track as trackAnalytics } from "@/lib/analytics";
import { playFlipInto } from "@/lib/utils/flip-transfer";
import type { Track } from "@/lib/data/types";

export function RecommendationHero({
  track,
  note,
  recommendationId,
  size = "large",
  celebrate = false,
}: {
  track: Track;
  note?: string;
  recommendationId: string;
  size?: "large" | "compact";
  /** One-shot brighten-and-settle on the artwork — reserve for the instant "put me on" lands. */
  celebrate?: boolean;
}) {
  const artSize = size === "large" ? 208 : 120;
  const artRef = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    playFlipInto(recommendationId, artRef.current);
    // one-shot handoff — only ever meaningful on the mount this hero was navigated in with
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleListen() {
    trackAnalytics("listen_clicked", { recommendation_id: recommendationId, track_id: track.id });
    window.open(track.sourceUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <span className="inline-block transition-transform duration-300 ease-out hover:-rotate-1 hover:scale-[1.015]">
        <span ref={artRef} data-hero-art style={{ display: "inline-block" }}>
          <Artwork
            seed={track.artSeed}
            imageUrl={track.artworkUrl}
            size={artSize}
            radius={2}
            halo
            animated
            className={celebrate ? "animate-celebrate" : undefined}
          />
        </span>
      </span>
      <div>
        <h1
          className={
            size === "large"
              ? "text-[30px] font-bold tracking-tight text-text-primary sm:text-[42px]"
              : "text-[20px] font-semibold text-text-primary"
          }
        >
          {track.title}
        </h1>
        <p className="mt-1 text-[15px] text-text-secondary sm:text-[17px]">{track.artist}</p>
        {track.album ? <p className="mt-0.5 text-[13px] text-text-quaternary">{track.album}</p> : null}
        {track.metadataStatus === "failed" ? (
          <p className="mt-1 font-mono text-[11px] text-text-tertiary">metadata couldn&apos;t be loaded</p>
        ) : null}
      </div>
      {note ? (
        <p className="max-w-sm border-l-2 border-border-strong py-0.5 pl-4 text-left text-[15px] leading-relaxed text-text-secondary">
          &ldquo;{note}&rdquo;
        </p>
      ) : null}
      <button
        type="button"
        onClick={handleListen}
        className="text-link flex items-center gap-1.5 text-[14.5px] text-accent-light"
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M4.7 1.5H10.5V7.3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10.5 1.5L4.9 7.1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <path
            d="M8 3.3H1.6V10.4H8.7V4"
            stroke="currentColor"
            strokeOpacity="0.55"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        listen on spotify
      </button>
      {formatDuration(track.durationMs) ? (
        <p className="font-mono text-[11px] text-text-tertiary">{formatDuration(track.durationMs)}</p>
      ) : null}
    </div>
  );
}
