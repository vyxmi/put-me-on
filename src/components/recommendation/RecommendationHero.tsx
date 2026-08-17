"use client";

import { Artwork } from "@/components/Artwork";
import { formatDuration } from "@/lib/utils/format";
import { track as trackAnalytics } from "@/lib/analytics";
import type { Track } from "@/lib/data/types";

export function RecommendationHero({
  track,
  note,
  recommendationId,
  size = "large",
}: {
  track: Track;
  note?: string;
  recommendationId: string;
  size?: "large" | "compact";
}) {
  const artSize = size === "large" ? 208 : 120;

  function handleListen() {
    trackAnalytics("listen_clicked", { recommendation_id: recommendationId, track_id: track.id });
    window.open(track.sourceUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <Artwork seed={track.artSeed} size={artSize} radius={6} />
      <div>
        <h1
          className={
            size === "large"
              ? "text-[26px] font-semibold tracking-tight text-text-primary sm:text-[34px]"
              : "text-[20px] font-semibold text-text-primary"
          }
        >
          {track.title}
        </h1>
        <p className="mt-1 text-[15px] text-text-secondary sm:text-[17px]">{track.artist}</p>
        {track.metadataStatus === "failed" ? (
          <p className="mt-1 font-mono text-[11px] text-text-tertiary">metadata couldn&apos;t be loaded</p>
        ) : null}
      </div>
      {note ? <p className="max-w-sm text-[15px] text-text-secondary italic">&ldquo;{note}&rdquo;</p> : null}
      <button
        type="button"
        onClick={handleListen}
        className="rounded-sm border border-border-strong px-5 py-2.5 text-[14px] text-text-primary transition-colors hover:border-accent-dim hover:text-accent"
      >
        listen <span aria-hidden="true">↗</span>
      </button>
      {formatDuration(track.durationMs) ? (
        <p className="font-mono text-[11px] text-text-tertiary">{formatDuration(track.durationMs)}</p>
      ) : null}
    </div>
  );
}
