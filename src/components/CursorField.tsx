"use client";

import { useEffect, useRef } from "react";

/** Very low-amplitude cursor-reactive light, for the moments the design
 * direction calls "floating/reactive" — restrained, not a spectacle. */
export function CursorField({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function handleMove(e: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el!.style.setProperty("--x", `${x}%`);
      el!.style.setProperty("--y", `${y}%`);
    }

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
      style={{
        background: "radial-gradient(560px circle at var(--x, 50%) var(--y, 30%), var(--accent-glow), transparent 70%)",
        opacity: 0.3,
        transition: "background 400ms linear",
      }}
    />
  );
}
