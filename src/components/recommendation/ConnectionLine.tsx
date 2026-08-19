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

/** The two-people-connecting primitive, expressed as a real SVG path: a
 * quiet line between two names that draws in and lights up once "put me
 * on" lands, with a point of light traveling across it the instant that
 * happens. It also breathes a little — bending gently toward a nearby
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
          stroke={connected ? "var(--accent)" : "var(--border-strong)"}
          strokeWidth={connected ? 1.6 : 1}
          strokeLinecap="round"
          style={{ transition: "stroke var(--duration-base) linear, stroke-width var(--duration-base) linear" }}
        />
        <circle cx={FROM_X} cy={MID_Y} r="2" fill={connected ? "var(--accent)" : "var(--border-strong)"} style={{ transition: "fill var(--duration-base) linear" }} />
        <circle
          cx={TO_X}
          cy={MID_Y}
          r="2"
          fill={connected ? "var(--accent)" : "var(--bg)"}
          stroke={connected ? "var(--accent)" : "var(--border-strong)"}
          strokeWidth="1"
          style={{ transition: "fill var(--duration-base) linear, stroke var(--duration-base) linear" }}
        />
        {justConnected && !reduceMotion ? (
          <motion.circle
            r="2"
            fill="var(--accent-light)"
            style={{ cx: dotX, cy: dotY, filter: "drop-shadow(0 0 3px var(--accent-light))" }}
          />
        ) : null}
      </svg>
      <span className={`font-semibold ${emphasize === "to" ? "text-text-primary" : "text-text-tertiary"}`}>{toLabel}</span>
    </div>
  );
}
