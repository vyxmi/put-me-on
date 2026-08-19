"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, animate } from "motion/react";

interface ConnectionLineProps {
  fromLabel: string;
  toLabel: string;
  connected: boolean;
  justConnected?: boolean;
  emphasize: "from" | "to";
}

const W = 72;
const H = 22;
const FROM_X = 7;
const TO_X = W - 7;
const MID_Y = H / 2;
const BEND_RANGE = 9;
const PROXIMITY = 15;

function bezier(t: number, p0: readonly [number, number], p1: readonly [number, number], p2: readonly [number, number]) {
  const mt = 1 - t;
  return [mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0], mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1]] as const;
}

/** The trajectory between two named people, expressed as a real SVG path.
 * People are the two labels — never node shapes; the only thing that moves
 * along the line is the song's own light, traveling from sender to
 * recipient the instant "put me on" lands and leaving a soft trail behind
 * it. The path also breathes a little — bending gently toward a nearby
 * cursor and springing back — so the connection reads as something alive
 * rather than a static rule. */
export function ConnectionLine({ fromLabel, toLabel, connected, justConnected, emphasize }: ConnectionLineProps) {
  const reduceMotion = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const bendY = useMotionValue(0);
  const bendYSpring = useSpring(bendY, { stiffness: 240, damping: 20, mass: 0.6 });
  const progress = useMotionValue(0);

  const dot = useTransform([bendYSpring, progress] as const, ([bendVal, t]: number[]) =>
    bezier(t, [FROM_X, MID_Y], [W / 2, MID_Y + bendVal], [TO_X, MID_Y])
  );
  const dotX = useTransform(dot, (p) => p[0]);
  const dotY = useTransform(dot, (p) => p[1]);
  const pathD = useTransform(bendYSpring, (v) => `M ${FROM_X} ${MID_Y} Q ${W / 2} ${MID_Y + v} ${TO_X} ${MID_Y}`);

  useEffect(() => {
    if (!justConnected || reduceMotion) return;
    progress.set(0);
    const controls = animate(progress, 1, { duration: 0.7, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [justConnected, reduceMotion, progress]);

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (reduceMotion) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    if (px < FROM_X || px > TO_X) {
      bendY.set(0);
      return;
    }
    const dist = py - MID_Y;
    const falloff = Math.max(0, 1 - Math.abs(dist) / PROXIMITY);
    bendY.set(Math.max(-BEND_RANGE, Math.min(BEND_RANGE, dist * falloff * 0.7)));
  }

  function handlePointerLeave() {
    bendY.set(0);
  }

  return (
    <div className="flex items-center text-[15px]">
      <span className={`font-semibold ${emphasize === "from" ? "text-text-primary" : "text-text-tertiary"}`}>{fromLabel}</span>
      <svg
        ref={svgRef}
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="mx-2.5 shrink-0 overflow-visible"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        aria-hidden="true"
      >
        <motion.path
          d={pathD}
          fill="none"
          stroke={connected ? "var(--white-glass-strong)" : "var(--border-strong)"}
          strokeWidth={connected ? 1.6 : 1}
          strokeLinecap="round"
          style={{
            transition: "stroke var(--duration-base) linear, stroke-width var(--duration-base) linear",
            filter: connected ? "drop-shadow(0 0 3px rgba(124,92,255,0.5)) drop-shadow(0 0 3px rgba(255,95,168,0.35))" : undefined,
          }}
        />
        {justConnected && !reduceMotion ? (
          <>
            {/* the trail: the song's light leaves the path glowing behind it as it travels */}
            <motion.path
              d={pathD}
              pathLength={progress}
              fill="none"
              stroke="var(--spectral-pink)"
              strokeWidth={2.4}
              strokeLinecap="round"
              style={{ opacity: 0.4, filter: "blur(1.5px)" }}
            />
            <motion.circle
              r="3.2"
              fill="var(--white-glass-strong)"
              style={{ cx: dotX, cy: dotY, filter: "drop-shadow(0 0 5px var(--spectral-violet)) drop-shadow(0 0 8px var(--spectral-pink))" }}
            />
          </>
        ) : null}
      </svg>
      <span className={`font-semibold ${emphasize === "to" ? "text-text-primary" : "text-text-tertiary"}`}>{toLabel}</span>
    </div>
  );
}
