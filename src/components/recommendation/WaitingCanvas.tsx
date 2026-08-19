"use client";

import { useState } from "react";
import Link from "next/link";
import { Artwork } from "@/components/Artwork";
import { Atmosphere } from "@/components/Atmosphere";
import { captureFlipSource } from "@/lib/utils/flip-transfer";
import type { EnrichedRecommendation } from "@/lib/data/store";

/** A real wrapping grid, not absolute-positioned coordinates — the previous
 * arc/spiral layouts looked "floating" with 1-2 items but started
 * overlapping the moment more than a handful were waiting, since percentage
 * positions don't account for how wide a tile actually is. A grid can't
 * overlap by construction, and each tile still floats gently in place. */
export function WaitingCanvas({ items }: { items: EnrichedRecommendation[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="relative">
      <Atmosphere seed="inbox-waiting-field" intensity="ambient" interactive={false} className="opacity-70" />
      <div className="relative flex flex-wrap gap-x-4 gap-y-6 px-1 py-6">
        {items.map((item, idx) => {
          const hovered = hoveredId === item.recommendation.id;
          return (
            <div key={item.recommendation.id} style={{ animation: `float${(idx % 3) + 1} ${8 + idx}s ease-in-out infinite` }}>
              <Link
                href={`/inbox/${item.recommendation.id}`}
                className="flex w-[84px] flex-col items-center gap-2 sm:w-[92px]"
                onMouseEnter={() => setHoveredId(item.recommendation.id)}
                onMouseLeave={() => setHoveredId((h) => (h === item.recommendation.id ? null : h))}
                onTouchStart={() => setHoveredId(item.recommendation.id)}
                onClick={(e) => {
                  const artEl = e.currentTarget.querySelector("[data-flip-art]");
                  captureFlipSource(item.recommendation.id, artEl);
                }}
              >
                <span data-flip-art className="relative block transition-transform duration-300 ease-out hover:scale-[1.08]">
                  <Artwork seed={item.track.artSeed} imageUrl={item.track.artworkUrl} size={68} radius={2} halo animated />
                  <span
                    className="animate-pulse-dot absolute right-1 top-1 block h-[6px] w-[6px] rounded-full bg-white-glass-strong"
                    style={{ boxShadow: "0 0 7px 2px var(--spectral-violet)" }}
                  />
                </span>
                <span className="max-w-full truncate text-[13px] font-semibold text-text-primary">{item.sender.displayName}</span>
                <span
                  className="max-w-full truncate text-center text-[10.5px] text-text-tertiary"
                  style={{
                    opacity: hovered ? 1 : 0,
                    transform: hovered ? "translateY(0)" : "translateY(-3px)",
                    transition: "opacity .25s, transform .25s",
                  }}
                >
                  {item.track.title}
                </span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
