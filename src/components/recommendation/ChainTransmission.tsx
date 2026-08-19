"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useTransform, animate } from "motion/react";

/** A → you → B, for the instant a pass-on actually happens: the segment
 * behind "you" is already-connected and static (however this reached you),
 * while the segment ahead — the one just created — draws in and sends its
 * own signal a beat later. Passing something on visibly extends the same
 * line rather than starting a new, unrelated one. */
export function ChainTransmission({ fromLabel, toLabel }: { fromLabel: string; toLabel: string }) {
  const reduceMotion = useReducedMotion();
  const progress = useMotionValue(0);
  const dotX = useTransform(progress, [0, 1], [4, 40]);

  useEffect(() => {
    if (reduceMotion) return;
    progress.set(0);
    const controls = animate(progress, 1, { duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [reduceMotion, progress]);

  return (
    <div className="flex items-center gap-2 text-[13px]">
      <span className="text-text-tertiary">{fromLabel}</span>
      <svg width={44} height={14} viewBox="0 0 44 14" className="shrink-0 overflow-visible" aria-hidden="true">
        <line x1="4" y1="7" x2="40" y2="7" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="4" cy="7" r="2" fill="var(--accent)" />
        <circle cx="40" cy="7" r="2" fill="var(--accent)" />
      </svg>
      <span className="font-semibold text-text-primary">you</span>
      <svg width={44} height={14} viewBox="0 0 44 14" className="shrink-0 overflow-visible" aria-hidden="true">
        <motion.line
          x1="4"
          y1="7"
          x2="40"
          y2="7"
          stroke="var(--accent)"
          strokeWidth="1.4"
          strokeLinecap="round"
          style={{ pathLength: reduceMotion ? 1 : progress }}
        />
        <circle cx="4" cy="7" r="2" fill="var(--accent)" />
        <circle cx="40" cy="7" r="2" fill="var(--accent)" />
        {!reduceMotion ? (
          <motion.circle r="2" fill="var(--accent-light)" style={{ cx: dotX, cy: 7, filter: "drop-shadow(0 0 3px var(--accent-light))" }} />
        ) : null}
      </svg>
      <span className="text-text-tertiary">{toLabel}</span>
    </div>
  );
}
