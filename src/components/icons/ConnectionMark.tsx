export type ConnectionState = "default" | "hover" | "connected";

interface ConnectionMarkProps {
  state?: ConnectionState;
  size?: number;
  className?: string;
}

/** The brand primitive: a song's light in transit along a trajectory —
 * never a pair of person-nodes. People are always named in typography
 * elsewhere; this mark is only ever the light and the line it travels.
 * Default rests the light near the start, hover nudges it forward as
 * anticipation, connected sends it all the way to the far end and lets
 * it glow there. */
export function ConnectionMark({ state = "default", size = 48, className }: ConnectionMarkProps) {
  const height = Math.round(size * 0.28);
  const isHover = state === "hover";
  const isConnected = state === "connected";

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 64 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <line x1="4" y1="8" x2="60" y2="8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" style={{ opacity: 0.3 }} />
      <circle
        cx="4"
        cy="8"
        r={isConnected ? 2.2 : 1.4}
        fill="currentColor"
        style={{
          opacity: isConnected ? 1 : isHover ? 0.85 : 0.55,
          transform: isConnected ? "translateX(52px)" : isHover ? "translateX(26px)" : "translateX(0)",
          transformBox: "fill-box",
          transformOrigin: "center",
          filter: isConnected ? "drop-shadow(0 0 3px var(--spectral-violet)) drop-shadow(0 0 4px var(--spectral-pink))" : undefined,
          transition: "transform 480ms var(--ease-out), r 280ms var(--ease-out), opacity 280ms var(--ease-out)",
        }}
      />
    </svg>
  );
}

interface ChainMarkProps {
  size?: number;
  className?: string;
  /** whether the second segment (the pass-on) is drawn in */
  secondSegmentDrawn?: boolean;
}

/** A chain is the visible trajectory of a song moving from one named
 * person to another — so this is a path with waypoint ticks (never
 * circular person-nodes) and, once the pass-on lands, the song's own
 * light traveling the newly-drawn second segment. */
export function ChainMark({ size = 96, className, secondSegmentDrawn = true }: ChainMarkProps) {
  const height = Math.round(size * 0.16);
  return (
    <svg width={size} height={height} viewBox="0 0 112 16" fill="none" aria-hidden="true" className={className}>
      <line x1="8" y1="5.5" x2="8" y2="10.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" style={{ opacity: 0.45 }} />
      <line x1="56" y1="5.5" x2="56" y2="10.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" style={{ opacity: 0.45 }} />
      <line x1="104" y1="5.5" x2="104" y2="10.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" style={{ opacity: 0.45 }} />
      <line x1="8" y1="8" x2="56" y2="8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" style={{ opacity: 0.55 }} />
      <line
        x1="60"
        y1="8"
        x2="104"
        y2="8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={secondSegmentDrawn ? 0 : 1}
        style={{ opacity: 0.55, transition: "stroke-dashoffset 700ms var(--ease-out)" }}
      />
      {secondSegmentDrawn ? (
        <circle r="1.8" fill="currentColor" style={{ filter: "drop-shadow(0 0 3px var(--spectral-violet)) drop-shadow(0 0 4px var(--spectral-pink))" }}>
          <animateMotion dur="0.7s" begin="0.05s" path="M56 8 L104 8" fill="freeze" />
          <animate attributeName="opacity" values="0;1;1;0.9" keyTimes="0;0.12;0.7;1" dur="0.7s" begin="0.05s" fill="freeze" />
        </circle>
      ) : null}
    </svg>
  );
}
