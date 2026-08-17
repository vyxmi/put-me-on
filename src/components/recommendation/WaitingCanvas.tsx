"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { Artwork } from "@/components/Artwork";
import type { EnrichedRecommendation } from "@/lib/data/store";

const POSITIONS = [
  { x: 4, y: 6 },
  { x: 48, y: 26 },
  { x: 18, y: 58 },
  { x: 62, y: 4 },
  { x: 34, y: 62 },
  { x: 8, y: 36 },
];
const DEPTHS = [10, 16, 13, 18, 11, 14];

/** The inbox's one deliberately expressive moment: waiting recommendations
 * float gently, scattered rather than stacked. Desktop additionally drifts
 * toward the cursor; mobile keeps the same scattered/floating composition
 * without the parallax (nothing to react to on touch). */
export function WaitingCanvas({ items }: { items: EnrichedRecommendation[] }) {
  const [mouse, setMouse] = useState({ mx: 0, my: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const my = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMouse({ mx, my });
  }

  return (
    <div
      className="relative h-[260px] sm:h-[300px] md:h-[320px]"
      onMouseMove={handleMove}
      onMouseLeave={() => setMouse({ mx: 0, my: 0 })}
    >
      {items.map((item, idx) => {
        const pos = POSITIONS[idx % POSITIONS.length];
        const depth = DEPTHS[idx % DEPTHS.length];
        const px = mouse.mx * depth;
        const py = mouse.my * depth;
        const hovered = hoveredId === item.recommendation.id;
        return (
          <div
            key={item.recommendation.id}
            className="absolute"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`,
              transition: "transform .35s ease-out",
            }}
          >
            <div style={{ animation: `float${(idx % 3) + 1} ${7 + idx}s ease-in-out infinite` }}>
              <Link
                href={`/inbox/${item.recommendation.id}`}
                className="flex w-24 flex-col items-start gap-2.5 sm:w-28 sm:gap-3 md:w-[124px]"
                onMouseEnter={() => setHoveredId(item.recommendation.id)}
                onMouseLeave={() => setHoveredId((h) => (h === item.recommendation.id ? null : h))}
                onTouchStart={() => setHoveredId(item.recommendation.id)}
              >
                <span className="relative block transition-transform duration-300 ease-out hover:scale-[1.08]">
                  <Artwork seed={item.track.artSeed} imageUrl={item.track.artworkUrl} size={80} radius={2} halo animated />
                  <span
                    className="animate-pulse-dot absolute right-1.5 top-1.5 block h-[6px] w-[6px] rounded-full bg-accent sm:right-2 sm:top-2 sm:h-[7px] sm:w-[7px]"
                    style={{ boxShadow: "0 0 7px 2px rgba(166,160,240,.6)" }}
                  />
                </span>
                <span className="truncate text-[13.5px] font-semibold text-text-primary sm:text-[15px]">
                  {item.sender.displayName}
                </span>
                <span
                  className="text-[11px] text-text-tertiary sm:text-[12.5px]"
                  style={{
                    opacity: hovered ? 1 : 0,
                    transform: hovered ? "translateY(0)" : "translateY(-4px)",
                    transition: "opacity .25s, transform .25s",
                  }}
                >
                  {item.track.title} · {item.track.artist}
                </span>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
