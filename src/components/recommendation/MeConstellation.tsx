"use client";

import { useEffect, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from "motion/react";
import { Artwork } from "@/components/Artwork";
import { Atmosphere } from "@/components/Atmosphere";
import { LightOrb } from "@/components/icons/LightOrb";
import type { EnrichedRecommendation } from "@/lib/data/store";

const MotionLink = motion.create(Link);

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
        /* the trail the song's light leaves behind as it travels toward you */
        <motion.path
          d={`M ${node.x} ${node.y} Q ${node.cx} ${node.cy} 50 50`}
          pathLength={progress}
          fill="none"
          stroke="var(--spectral-pink)"
          strokeWidth={0.9}
          vectorEffect="non-scaling-stroke"
          style={{ opacity: 0.4, filter: "blur(0.3px)" }}
        />
      ) : null}
    </g>
  );
}

/** The song's light itself, rendered outside the (deliberately
 * non-uniformly-stretched, so its curves stay anchored to the percentage-
 * positioned name nodes) SVG coordinate space — sized in real pixels on
 * plain percentage-positioned HTML so the orb actually stays round instead
 * of getting squashed by the svg's viewBox distortion. */
function TravelLight({ node, hovered }: { node: Placed; hovered: boolean }) {
  const reduceMotion = useReducedMotion();
  const progress = useMotionValue(0);
  const dot = useTransform(progress, (t) => bezier(t, [node.x, node.y], [node.cx, node.cy], [50, 50]));
  const left = useTransform(dot, (p) => `${p[0]}%`);
  const top = useTransform(dot, (p) => `${p[1]}%`);

  useEffect(() => {
    if (!hovered || reduceMotion) return;
    progress.set(0);
    const controls = animate(progress, 1, { duration: 0.9, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [hovered, reduceMotion, progress]);

  if (!hovered || reduceMotion) return null;

  return (
    <motion.div
      className="pointer-events-none absolute z-10"
      style={{ left, top, x: "-50%", y: "-50%", filter: "drop-shadow(0 0 2px var(--spectral-violet)) drop-shadow(0 0 3px var(--spectral-pink))" }}
    >
      <LightOrb size={14} />
    </motion.div>
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
  const containerRef = useRef<HTMLDivElement>(null);
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
    <div ref={containerRef} className="relative h-[400px] w-full overflow-hidden rounded-sm sm:h-[480px] md:h-[520px]">
      <Atmosphere seed={seed} intensity="hero" interactive />

      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {placed.map((node) => (
          <Beam key={node.entry.sender.id} node={node} hovered={hoveredId === node.entry.sender.id} />
        ))}
      </svg>

      {placed.map((node) => (
        <TravelLight key={node.entry.sender.id} node={node} hovered={hoveredId === node.entry.sender.id} />
      ))}

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-display text-text-primary drop-shadow-[0_2px_24px_rgba(0,0,0,0.6)]">{displayName.toUpperCase()}</p>
        <p className="mt-2 font-mono text-body-sm text-text-tertiary">@{handle}</p>
      </div>

      {placed.map((node, i) => (
        <ConstellationNode key={node.entry.sender.id} node={node} index={i} containerRef={containerRef} hovered={hoveredId === node.entry.sender.id} onHover={setHoveredId} />
      ))}
    </div>
  );
}

function ConstellationNode({
  node,
  index,
  containerRef,
  hovered,
  onHover,
}: {
  node: Placed;
  index: number;
  containerRef: RefObject<HTMLDivElement | null>;
  hovered: boolean;
  onHover: Dispatch<SetStateAction<string | null>>;
}) {
  const id = node.entry.sender.id;
  const draggedRef = useRef(false);

  return (
    <div className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: `${node.x}%`, top: `${node.y}%` }}>
      <MotionLink
        href={`/inbox/${node.entry.recommendation.id}`}
        drag
        dragConstraints={containerRef}
        dragElastic={0.15}
        dragMomentum={false}
        whileDrag={{ scale: 1.15, zIndex: 30 }}
        onDragStart={() => {
          draggedRef.current = true;
        }}
        onClick={(e) => {
          if (draggedRef.current) {
            e.preventDefault();
            draggedRef.current = false;
          }
        }}
        className="flex cursor-grab touch-none flex-col items-center gap-1.5 active:cursor-grabbing"
        onMouseEnter={() => onHover(id)}
        onMouseLeave={() => onHover((h) => (h === id ? null : h))}
        onTouchStart={() => onHover(id)}
      >
        {/* the person is the name — typography, never a node shape. The
            small square is the song they sent, a quiet accent, not a face.
            A gentle idle float on its own inner layer, separate from the
            drag gesture's own transform on the link itself. */}
        <div style={{ animation: `float${(index % 3) + 1} ${9 + index}s ease-in-out infinite` }}>
          <motion.span
            className="block"
            animate={{ scale: hovered ? 1.1 : 1, opacity: hovered ? 1 : 0.85 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Artwork seed={node.entry.track.artSeed} imageUrl={node.entry.track.artworkUrl} size={30} radius={2} />
          </motion.span>
          <span
            className="block text-body font-semibold text-text-primary drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]"
            style={{
              textShadow: hovered ? "0 0 14px var(--spectral-violet)" : undefined,
              transition: "text-shadow 260ms var(--ease-out)",
            }}
          >
            {node.entry.sender.displayName}
          </span>
          <span
            className="block max-w-24 truncate text-center text-caption text-text-tertiary drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]"
            style={{ opacity: hovered ? 1 : 0, transition: "opacity 200ms var(--ease-out)" }}
          >
            {node.entry.track.title}
          </span>
        </div>
      </MotionLink>
    </div>
  );
}
