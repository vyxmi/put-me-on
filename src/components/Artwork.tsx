"use client";

import { useEffect, useState } from "react";

export type RGB = [number, number, number];

/** Sampled per imageUrl once, then reused — avoids re-decoding the same
 * cover art every time an Artwork instance mounts (list + hero both use it). */
const glowCache = new Map<string, RGB | null>();

/** Downsamples the real cover art to a tiny canvas and averages its pixels,
 * weighted toward the more saturated ones, so the glow reads as "a color
 * pulled from this photo" rather than a muddy gray average. Resolves null
 * (silently — the hash-based glow below is the fallback) if the image
 * hasn't loaded cross-origin cleanly, since that just means a tainted
 * canvas rather than an error worth surfacing. */
export function sampleGlowColor(url: string): Promise<RGB | null> {
  const cached = glowCache.get(url);
  if (cached !== undefined) return Promise.resolve(cached);

  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const size = 24;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let rSum = 0;
        let gSum = 0;
        let bSum = 0;
        let weightSum = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (a < 128) continue;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max === 0 ? 0 : (max - min) / max;
          const weight = 0.15 + saturation;
          rSum += r * weight;
          gSum += g * weight;
          bSum += b * weight;
          weightSum += weight;
        }
        const rgb: RGB | null = weightSum === 0 ? null : [Math.round(rSum / weightSum), Math.round(gSum / weightSum), Math.round(bSum / weightSum)];
        glowCache.set(url, rgb);
        resolve(rgb);
      } catch {
        glowCache.set(url, null);
        resolve(null);
      }
    };
    img.onerror = () => {
      glowCache.set(url, null);
      resolve(null);
    };
    img.src = url;
  });
}

/** Same sampled color Artwork's own halo uses, for anything else on the
 * page that wants to be lit by the actual album art (e.g. Atmosphere). */
export function useSampledGlow(imageUrl: string | undefined): RGB | null {
  const [glow, setGlow] = useState<RGB | null>(null);
  useEffect(() => {
    if (!imageUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting derived state when the input goes away, not a render-cascade risk
      setGlow(null);
      return;
    }
    let cancelled = false;
    sampleGlowColor(imageUrl).then((rgb) => {
      if (!cancelled) setGlow(rgb);
    });
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);
  return glow;
}

const NOISE_BG =
  "url(\"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Purple/blue/violet family only — keeps generated art visually part of
 * the same spectral world as Atmosphere.tsx, rather than a random rainbow. */
const HUES = [252, 265, 235, 275, 208, 292, 320];

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(h, 31) + seed.charCodeAt(i)) >>> 0;
  }
  return h;
}

interface ArtworkProps {
  seed: string;
  /** Real Spotify cover, when available. Falls back to generated art if this fails to load. */
  imageUrl?: string;
  size?: number;
  radius?: number;
  className?: string;
  /** Soft colored glow behind the tile — reserve for hero/detail sizes, skip in list rows. */
  halo?: boolean;
  /** Slow hue-breathing — reserve for hero/detail sizes, and only meaningful on generated art. */
  animated?: boolean;
}

/** Track artwork: real Spotify cover when we have one, otherwise generated
 * placeholder art. Deterministic per track, curated hue family so a page of
 * generated covers still reads as one coherent palette instead of a random
 * rainbow — and so the halo glow stays on-theme even behind a real photo. */
export function Artwork({ seed, imageUrl, size = 56, radius = 2, className, halo = false, animated = false }: ArtworkProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !imageFailed;

  const [sampledGlow, setSampledGlow] = useState<RGB | null>(null);
  useEffect(() => {
    if (!halo || !showImage || !imageUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting derived state when the inputs that produced it go away, not a render-cascade risk
      setSampledGlow(null);
      return;
    }
    let cancelled = false;
    sampleGlowColor(imageUrl).then((rgb) => {
      if (!cancelled) setSampledGlow(rgb);
    });
    return () => {
      cancelled = true;
    };
  }, [halo, showImage, imageUrl]);

  const n = hashSeed(seed);
  const hue = HUES[n % HUES.length];
  const hue2 = (hue + 32 + (n % 97) * 7) % 360;
  const x1 = 15 + (n % 55);
  const y1 = 10 + ((n >> 3) % 60);
  const x2 = 60 + ((n >> 5) % 35);
  const y2 = 55 + ((n >> 7) % 40);
  const angle = (n >> 9) % 360;

  const background = `radial-gradient(circle at ${x1}% ${y1}%, hsla(${hue},70%,62%,.85), transparent 62%), radial-gradient(circle at ${x2}% ${y2}%, hsla(${hue2},60%,42%,.9), transparent 58%), linear-gradient(${angle}deg, #100f16, #060607)`;

  return (
    <span
      aria-hidden="true"
      className={className}
      style={{ display: "block", position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      {halo ? (
        <span
          style={{
            position: "absolute",
            inset: `${-size * 0.38}px`,
            zIndex: -1,
            display: "block",
            borderRadius: "50%",
            filter: `blur(${Math.round(size * 0.34)}px)`,
            transition: "background 400ms var(--ease-out)",
            background: sampledGlow
              ? `radial-gradient(circle at 35% 35%, rgba(${sampledGlow[0]},${sampledGlow[1]},${sampledGlow[2]},.55), transparent 62%), radial-gradient(circle at 65% 65%, rgba(${Math.round(sampledGlow[0] * 0.55)},${Math.round(sampledGlow[1] * 0.55)},${Math.round(sampledGlow[2] * 0.55)},.4), transparent 60%)`
              : `radial-gradient(circle at 35% 35%, hsla(${hue},75%,60%,.55), transparent 62%), radial-gradient(circle at 65% 65%, hsla(${hue2},65%,45%,.4), transparent 60%)`,
          }}
        />
      ) : null}
      <span
        style={{
          display: "block",
          width: size,
          height: size,
          borderRadius: radius,
          position: "relative",
          overflow: "hidden",
          background: showImage ? "#100f16" : background,
          animation: !showImage && animated ? "hue-drift 10s ease-in-out infinite" : undefined,
        }}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            width={size}
            height={size}
            onError={() => setImageFailed(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <span
            style={{
              position: "absolute",
              inset: 0,
              display: "block",
              opacity: 0.07,
              mixBlendMode: "overlay",
              backgroundImage: NOISE_BG,
            }}
          />
        )}
      </span>
    </span>
  );
}
