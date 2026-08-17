"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { Artwork } from "@/components/Artwork";
import type { EnrichedRecommendation } from "@/lib/data/store";

const POSITIONS = [
  { x: 4, y: 6 },
  { x: 52, y: 28 },
  { x: 20, y: 60 },
  { x: 70, y: 2 },
  { x: 38, y: 64 },
  { x: 10, y: 38 },
];
const DEPTHS = [10, 16, 13, 18, 11, 14];

/** The inbox's one deliberately expressive moment: waiting recommendations
 * float gently and drift toward the cursor, echoing music arriving rather
 * than sitting in a plain list. Desktop only — mobile falls back to a
 * calmer floating card row below. */
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
    <>
      <div
        className="relative hidden h-[320px] md:block"
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
                  className="flex w-[124px] flex-col items-start gap-3"
                  onMouseEnter={() => setHoveredId(item.recommendation.id)}
                  onMouseLeave={() => setHoveredId((h) => (h === item.recommendation.id ? null : h))}
                >
                  <span className="relative block transition-transform duration-300 ease-out hover:scale-[1.08]">
                    <Artwork
                      seed={item.track.artSeed}
                      imageUrl={item.track.artworkUrl}
                      size={96}
                      radius={2}
                      halo
                      animated
                    />
                    <span
                      className="animate-pulse-dot absolute right-2 top-2 block h-[7px] w-[7px] rounded-full bg-accent"
                      style={{ boxShadow: "0 0 7px 2px rgba(166,160,240,.6)" }}
                    />
                  </span>
                  <span className="text-[15px] font-semibold text-text-primary">{item.sender.displayName}</span>
                  <span
                    className="text-[12.5px] text-text-tertiary"
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

      <div className="flex flex-col gap-2 md:hidden">
        {items.map((item, idx) => (
          <div key={item.recommendation.id} style={{ animation: `float${(idx % 3) + 1} ${8 + idx}s ease-in-out infinite` }}>
            <Link
              href={`/inbox/${item.recommendation.id}`}
              className="flex items-center gap-3.5 rounded-xs px-2.5 py-3"
              style={{ background: "linear-gradient(180deg, rgba(245,243,239,0.03), transparent)" }}
            >
              <span className="relative block shrink-0">
                <Artwork seed={item.track.artSeed} imageUrl={item.track.artworkUrl} size={64} radius={2} animated />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[15px] font-semibold text-text-primary">{item.sender.displayName}</span>
                <span className="text-[12px] text-text-tertiary">listen on spotify</span>
              </span>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
