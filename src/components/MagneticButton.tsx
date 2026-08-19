"use client";

import { useRef, type ReactNode, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

/** Wraps any control so it drifts a few px toward the cursor on approach
 * and springs back on leave — the "buttons lightly magnetize" detail.
 * Strength is deliberately small; this should read as the control noticing
 * you, not chasing the pointer. */
export function MagneticButton({
  children,
  className,
  strength = 0.35,
  range = 46,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  range?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 16, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 220, damping: 16, mass: 0.5 });

  function handleMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (reduceMotion) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > range) {
      x.set(0);
      y.set(0);
      return;
    }
    x.set(dx * strength);
    y.set(dy * strength);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
