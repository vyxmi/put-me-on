"use client";

import type { ReactNode } from "react";
import { useSampledGlow } from "@/components/Artwork";
import { Atmosphere } from "@/components/Atmosphere";
import type { Track } from "@/lib/data/types";

/** The atmospheric stage a recommendation detail plays out on: the actual
 * album art's own sampled color washes the whole scene, not just a halo
 * behind the cover — this is the page where receiving a song from a
 * specific person should feel like an event. */
export function RecommendationScene({ track, children }: { track: Track; children: ReactNode }) {
  const color = useSampledGlow(track.artworkUrl);

  return (
    <div className="relative min-h-full flex-1 overflow-hidden">
      <Atmosphere seed={track.artSeed} color={color} intensity="hero" interactive />
      {/* z-0, not z-10 — just enough to paint above the absolutely-positioned
          Atmosphere sibling. A mobile sticky header living outside this tree
          needs to out-rank whatever this scene does internally, and z-index
          comparisons ignore DOM nesting depth: an equal-or-higher z-index
          buried in here would still win against a z-10 header purely by
          coming later in the document. */}
      <div className="relative z-0">{children}</div>
    </div>
  );
}
