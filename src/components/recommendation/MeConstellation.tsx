"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from "motion/react";
import { Artwork } from "@/components/Artwork";
import { Atmosphere } from "@/components/Atmosphere";
import type { EnrichedRecommendation } from "@/lib/data/store";

function bezier(t: number, p0: readonly [number, number], p1: readonly [number, number], p2: readonly [number, number]) {
  const mt = 1 - t;
  return [mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0], mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1]] as const;
}

interface Placed {
  entry: EnrichedRecommendation;
  x: number;
  y: number;
  cx: number;
  cy: number;
}

function Beam({ node, hovered }: { node: Placed; hovered: boolean }) {
  const reduceMotion = useReducedMotion();
  const progress = useMotionValue(0);
  const dot = useTransform(progress, (t) => bezier(t, [node.x, node.y], [node.cx, node.cy], [50, 50]));
  const dotX = useTransform(dot, (p) => p[0]);
  const dotY = useTransform(dot, (p) => p[1]);

  useEffect(() => {
    if (!hovered || reduceMotion) return;
    progress.set(0);
    const controls = animate(progress, 1, { duration: 0.9, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [hovered, reduceMotion, progress]);

  return (
    <g>
      <path
        d={`M ${node.x} ${node.y} Q ${node.cx} ${node.cy} 50 50`}
        fill="none"
        stroke={hovered ? "var(--white-glass-strong)" : "rgba(230, 232, 245, 0.4)"}
        strokeWidth={hovered ? 0.55 : 0.42}
        vectorEffect="non-scaling-stroke"
        style={{
          transition: "stroke 260ms var(--ease-out), stroke-width 260ms var(--ease-out)",
          filter: hovered ? "drop-shadow(0 0 2px var(--spectral-violet))" : undefined,
        }}
      />
      {hovered && !reduceMotion ? (
        <motion.circle
          r="0.9"
          fill="var(--white-glass-strong)"
          style={{ cx: dotX, cy: dotY, filter: "drop-shadow(0 0 3px var(--spectral-violet)) drop-shadow(0 0 4px var(--spectral-pink))" }}
        />
      ) : null}
    </g>
  );
}

export function MeConstellation({
  displayName,
  handle,
  entries,
  seed,
}: {
  displayName: string;
  handle: string;
  entries: EnrichedRecommendation[];
  seed: string;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const n = entries.length;

  // Rounded to a fixed precision: Math.cos/sin aren't guaranteed
  // bit-identical across V8 builds (Node's vs the browser's), which is
  // enough to break SSR hydration on a raw float — round at the source
  // instead of chasing it through every consumer.
  const round = (v: number) => Number(v.toFixed(3));

  const placed: Placed[] = entries.map((entry, i) => {
    const angle = (i / Math.max(n, 1)) * Math.PI * 2 - Math.PI / 2;
    const r = 33;
    const x = round(50 + Math.cos(angle) * r);
    const y = round(50 + Math.sin(angle) * r * 0.82);
    const perp = angle + Math.PI / 2;
    const bow = i % 2 === 0 ? 4 : -4;
    const cx = round((x + 50) / 2 + Math.cos(perp) * bow);
    const cy = round((y + 50) / 2 + Math.sin(perp) * bow);
    return { entry, x, y, cx, cy };
  });

  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-sm sm:h-[480px] md:h-[520px]">
      <Atmosphere seed={seed} intensity="hero" interactive />

      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {placed.map((node) => (
          <Beam key={node.entry.sender.id} node={node} hovered={hoveredId === node.entry.sender.id} />
        ))}
      </svg>

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-[44px] font-bold leading-none tracking-tight text-text-primary drop-shadow-[0_2px_24px_rgba(0,0,0,0.6)] sm:text-[64px]">
          {displayName.toUpperCase()}
        </p>
        <p className="mt-2 font-mono text-[13px] text-text-tertiary">@{handle}</p>
      </div>

      {placed.map((node) => {
        const hovered = hoveredId === node.entry.sender.id;
        return (
          <Link
            key={node.entry.sender.id}
            href={`/inbox/${node.entry.recommendation.id}`}
            className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            onMouseEnter={() => setHoveredId(node.entry.sender.id)}
            onMouseLeave={() => setHoveredId((h) => (h === node.entry.sender.id ? null : h))}
            onTouchStart={() => setHoveredId(node.entry.sender.id)}
          >
            <motion.span
              className="block rounded-full"
              animate={{ scale: hovered ? 1.16 : 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                boxShadow: hovered
                  ? "0 0 0 2px var(--white-glass-strong), 0 0 20px 4px rgba(124,92,255,0.4)"
                  : "0 0 0 1px var(--border-strong)",
              }}
            >
              <Artwork seed={node.entry.track.artSeed} imageUrl={node.entry.track.artworkUrl} size={56} radius={999} halo />
            </motion.span>
            <span className="text-[13px] font-semibold text-text-primary drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
              {node.entry.sender.displayName}
            </span>
            <span
              className="max-w-24 truncate text-center text-[11px] text-text-tertiary drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]"
              style={{ opacity: hovered ? 1 : 0, transition: "opacity 200ms var(--ease-out)" }}
            >
              {node.entry.track.title}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
