export type ConnectionState = "default" | "hover" | "connected";

interface ConnectionMarkProps {
  state?: ConnectionState;
  size?: number;
  className?: string;
}

/** The recurring "two nodes" brand primitive: a recommendation traveling
 * from one person to another. Default shows a gap, hover suggests a
 * connection forming, connected completes it — used for the `put me on`
 * response and anywhere a confirmed connection needs to be shown. */
export function ConnectionMark({ state = "default", size = 48, className }: ConnectionMarkProps) {
  const height = Math.round(size * 0.28);
  const isDotted = state === "hover";
  const isSolid = state === "connected";

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 64 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="8" cy="8" r="3" strokeWidth="1.5" stroke="currentColor" style={{ fill: "var(--bg)" }} />
      <circle cx="56" cy="8" r="3" strokeWidth="1.5" stroke="currentColor" style={{ fill: "var(--bg)" }} />
      <line
        x1="12"
        y1="8"
        x2="52"
        y2="8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={isDotted ? "0.02 0.13" : "1"}
        strokeDashoffset={isSolid || isDotted ? 0 : 1}
        style={{
          opacity: state === "default" ? 0 : 1,
          transition: "stroke-dashoffset var(--duration-slow) var(--ease-out), opacity var(--duration-base) var(--ease-out)",
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

/** Three-node variant used for pass-on chains: A -> You -> B. */
export function ChainMark({ size = 96, className, secondSegmentDrawn = true }: ChainMarkProps) {
  const height = Math.round(size * 0.16);
  return (
    <svg width={size} height={height} viewBox="0 0 112 16" fill="none" aria-hidden="true" className={className}>
      <circle cx="8" cy="8" r="3" strokeWidth="1.5" stroke="currentColor" style={{ fill: "var(--bg)" }} />
      <circle cx="56" cy="8" r="3" strokeWidth="1.5" stroke="currentColor" style={{ fill: "var(--bg)" }} />
      <circle cx="104" cy="8" r="3" strokeWidth="1.5" stroke="currentColor" style={{ fill: "var(--bg)" }} />
      <line x1="12" y1="8" x2="52" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line
        x1="60"
        y1="8"
        x2="100"
        y2="8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={secondSegmentDrawn ? 0 : 1}
        style={{ transition: "stroke-dashoffset 700ms var(--ease-out)" }}
      />
    </svg>
  );
}
