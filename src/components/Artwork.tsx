"use client";

import { useState } from "react";

const NOISE_BG =
  "url(\"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Purple/blue/violet family only — keeps generated art visually part of
 * the same world as the accent color, rather than a random rainbow. */
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
            background: `radial-gradient(circle at 35% 35%, hsla(${hue},75%,60%,.55), transparent 62%), radial-gradient(circle at 65% 65%, hsla(${hue2},65%,45%,.4), transparent 60%)`,
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
