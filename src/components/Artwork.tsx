function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(h, 31) + seed.charCodeAt(i)) >>> 0;
  }
  return h;
}

interface ArtworkProps {
  seed: string;
  size?: number;
  radius?: number;
  className?: string;
}

/** Generated placeholder art, standing in for real Spotify artwork until
 * metadata fetching exists (post architecture-approval). Deterministic per
 * track so the same track always looks the same, and distinct tracks read
 * as visually distinct the way real album covers would — this is what
 * gives list/detail views their color, per docs/design-direction. */
export function Artwork({ seed, size = 56, radius = 4, className }: ArtworkProps) {
  const h = hashSeed(seed);
  const hue1 = h % 360;
  const hue2 = (hue1 + 55 + (Math.floor(h / 97) % 90)) % 360;
  const angle = Math.floor(h / 7) % 360;
  const cx = 25 + (h % 45);
  const cy = 75 - (Math.floor(h / 13) % 40);
  const gradId = `art-${seed}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ borderRadius: radius, display: "block", flexShrink: 0 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} gradientTransform={`rotate(${angle} 50 50)`}>
          <stop offset="0%" stopColor={`hsl(${hue1} 42% 20%)`} />
          <stop offset="100%" stopColor={`hsl(${hue2} 36% 11%)`} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${gradId})`} />
      <circle cx={cx} cy={cy} r="40" fill={`hsl(${hue1} 55% 55% / 0.16)`} />
    </svg>
  );
}
