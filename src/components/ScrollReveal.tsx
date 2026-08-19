"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/** Content fades/settles in as it crosses into view on scroll, instead of
 * just appearing — used on pages long enough to actually scroll (Me).
 * Native scrolling throughout; this only watches, never hijacks it. */
export function ScrollReveal({ children, className, y = 18 }: { children: ReactNode; className?: string; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
