"use client";

import { useEffect, useId, useRef } from "react";
import gsap from "gsap";

type RGB = readonly [number, number, number];

/** Deterministic spectral hue family — violet/blue/pink/ice, never a random
 * rainbow. Same palette family Artwork.tsx uses for generated covers, so a
 * page's ambient light and its album art always feel like the same world. */
const HUES = [252, 265, 235, 275, 208, 292, 320];

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(h, 31) + seed.charCodeAt(i)) >>> 0;
  return h;
}

/** Integer-only PRNG (no Math.sin/trig) — a sin-based hash can differ in
 * its last bits between server (Node's V8) and client (browser V8),
 * which flips fractional results after `x - Math.floor(x)` often enough
 * to break SSR hydration. Bitwise ops are bit-identical everywhere. */
function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hsl(h: number, s: number, l: number, a: number) {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

function rgba([r, g, b]: RGB, a: number) {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

interface Blob {
  hue: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  driftX: number;
  driftY: number;
  duration: number;
}

function buildBlobs(seed: string, color: RGB | null): Blob[] {
  const rand = mulberry32(hashSeed(seed));
  const baseHue = HUES[hashSeed(seed) % HUES.length];
  const count = 4;
  // color only changes how blobs are painted (see the render below), not
  // their layout — sampled-art-colored and hash-colored fields share one geometry
  void color;
  return Array.from({ length: count }, (_, i) => ({
    hue: Math.round((baseHue + i * 46 + rand() * 20) % 360),
    x: Number((15 + rand() * 70).toFixed(2)),
    y: Number((10 + rand() * 70).toFixed(2)),
    size: Number((46 + rand() * 30).toFixed(2)),
    opacity: Number((0.5 - i * 0.06).toFixed(2)),
    driftX: Number((6 + rand() * 10).toFixed(2)),
    driftY: Number((6 + rand() * 10).toFixed(2)),
    duration: Number((14 + rand() * 10).toFixed(2)),
  }));
}

interface AtmosphereProps {
  /** deterministic hue family when no sampled art color is available */
  seed: string;
  /** real color pulled from album art (Artwork.tsx's sampleGlowColor) — when present, blobs render in this color family instead of the hash hues */
  color?: RGB | null;
  className?: string;
  /** hero = brighter/bigger, for a page's signature scene. ambient = quieter, for a supporting field. */
  intensity?: "hero" | "ambient";
  /** pointer-reactive drift toward cursor. Off for small/ambient placements where it'd be more noise than signal. */
  interactive?: boolean;
  /** Mask the whole field to fully transparent well before the container's
   * literal edge, so an inset placement (a card, a list panel) dissolves
   * into the page instead of reading as a rectangle with light in it.
   * Defaults on for ambient (almost always inset) and off for hero (almost
   * always full-bleed, where reaching the edge is the point). */
  edgeFade?: boolean;
}

/** The shared "colorful, alive, layered light" surface: blurred hue blobs
 * drifting on their own slow independent loops, refracted by a shared SVG
 * turbulence/displacement filter, with a grain layer on top so it never
 * reads as a flat gradient. Built entirely from CSS + SVG filters + GSAP —
 * no WebGL/canvas dependency. */
export function Atmosphere({
  seed,
  color = null,
  className,
  intensity = "ambient",
  interactive = true,
  edgeFade = intensity === "ambient",
}: AtmosphereProps) {
  const filterId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);
  const turbRef = useRef<SVGFETurbulenceElement>(null);

  const blobs = buildBlobs(seed, color);
  const isHero = intensity === "hero";

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      blobRefs.current.forEach((el, i) => {
        if (!el) return;
        const b = blobs[i];
        if (reduce) return;
        gsap.to(el, {
          x: `+=${b.driftX}%`,
          y: `+=${b.driftY}%`,
          duration: b.duration,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      if (turbRef.current && !reduce) {
        const seedObj = { v: 0.008 };
        gsap.to(seedObj, {
          v: 0.014,
          duration: 9,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          onUpdate: () => turbRef.current?.setAttribute("baseFrequency", `${seedObj.v} ${seedObj.v * 1.4}`),
        });
      }

      if (interactive && containerRef.current && !reduce) {
        const el = containerRef.current;
        const setX = gsap.quickTo(el, "--px", { duration: 1.1, ease: "power3.out" });
        const setY = gsap.quickTo(el, "--py", { duration: 1.1, ease: "power3.out" });
        const handleMove = (e: PointerEvent) => {
          const rect = el.getBoundingClientRect();
          setX(((e.clientX - rect.left) / rect.width - 0.5) * 100);
          setY(((e.clientY - rect.top) / rect.height - 0.5) * 100);
        };
        el.addEventListener("pointermove", handleMove);
        return () => el.removeEventListener("pointermove", handleMove);
      }
    }, containerRef);

    return () => ctx.revert();
    // blobs is derived deterministically from seed/color each render; the
    // animation setup itself should only re-run if those actually change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, color, interactive]);

  const edgeMask = edgeFade ? "radial-gradient(ellipse 100% 100% at 50% 50%, black 18%, transparent 62%)" : undefined;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
      style={{
        ["--px" as string]: 0,
        ["--py" as string]: 0,
        maskImage: edgeMask,
        WebkitMaskImage: edgeMask,
      }}
    >
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id={filterId} colorInterpolationFilters="sRGB">
          <feTurbulence ref={turbRef} type="fractalNoise" baseFrequency="0.009 0.013" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={isHero ? 34 : 18} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div
        className="absolute inset-0"
        style={{
          filter: `url(#${filterId}) blur(${isHero ? 2 : 1}px)`,
          transform: interactive ? "translate(calc(var(--px) * 0.06px), calc(var(--py) * 0.06px))" : undefined,
          transition: "transform 200ms linear",
        }}
      >
        {blobs.map((b, i) => (
          <div
            key={i}
            ref={(el) => {
              blobRefs.current[i] = el;
            }}
            className="absolute"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.size}%`,
              height: `${b.size}%`,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background: color
                ? `radial-gradient(circle, ${rgba(color, b.opacity * (isHero ? 0.95 : 1))}, transparent 68%)`
                : `radial-gradient(circle, ${hsl(b.hue, 78, 60, b.opacity * (isHero ? 0.95 : 1))}, transparent 68%)`,
              filter: `blur(${isHero ? 40 : 26}px)`,
              mixBlendMode: "screen",
            }}
          />
        ))}
      </div>

      <div className="grain-overlay" style={{ position: "absolute", opacity: isHero ? 0.06 : 0.045 }} />

      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% 45%, transparent 0%, transparent 18%, var(--void) 90%)",
          opacity: isHero ? 0.68 : 0.75,
        }}
      />
    </div>
  );
}
