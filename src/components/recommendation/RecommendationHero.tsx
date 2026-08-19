"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import Tilt from "react-parallax-tilt";
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
      <span ref={artRef} data-hero-art style={{ display: "inline-block" }}>
        <Tilt
          tiltEnable={!reduceMotion}
          tiltMaxAngleX={6}
          tiltMaxAngleY={6}
          perspective={900}
          scale={1.015}
          transitionSpeed={1200}
          glareEnable={false}
        >
          <Artwork
            seed={track.artSeed}
            imageUrl={track.artworkUrl}
            size={artSize}
            radius={2}
            halo
            animated
            className={celebrate ? "animate-celebrate" : undefined}
          />
        </Tilt>
      </span>
      <div className="flex flex-col items-center gap-2">
        <h1 className={size === "large" ? "text-track-title-hero text-text-primary" : "text-track-title-compact text-text-primary"}>
          {track.title}
        </h1>
        <p className={size === "large" ? "text-track-artist-hero text-text-secondary" : "text-body-lg font-semibold text-text-secondary"}>
          {track.artist}
        </p>
        {track.album ? (
          <span
            className="mt-1 rounded-full border px-3 py-1 text-caption font-medium text-text-tertiary"
            style={{ borderColor: "var(--border-strong)" }}
          >
            {track.album}
          </span>
        ) : null}
        {track.metadataStatus === "failed" ? (
          <p className="mt-1 text-mono-caption text-text-tertiary">metadata couldn&apos;t be loaded</p>
        ) : null}
      </div>
      {note ? (
        <p
          className="relative max-w-sm py-0.5 pl-4 text-left text-body-lg leading-relaxed text-text-primary"
          style={{ borderLeft: "2px solid var(--border-strong)" }}
        >
          &ldquo;{note}&rdquo;
        </p>
      ) : null}
      <button
        type="button"
        onClick={handleListen}
        className="text-link flex items-center gap-1.5 text-body text-text-secondary transition-colors hover:text-text-primary"
      >
        listen on spotify
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M3.5 8.5L8.5 3.5M8.5 3.5H4.3M8.5 3.5V7.7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {formatDuration(track.durationMs) ? (
        <p className="text-mono-caption text-text-tertiary">{formatDuration(track.durationMs)}</p>
      ) : null}
    </div>
  );
}
