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
    <div className="relative min-h-full overflow-hidden">
      <Atmosphere seed={track.artSeed} color={color} intensity="hero" interactive />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
