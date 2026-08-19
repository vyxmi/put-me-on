interface IconProps {
  size?: number;
  className?: string;
  /** transient — true only while the pointer is actually over the button */
  hovered?: boolean;
  /** persisted — true once this is the confirmed response */
  active?: boolean;
}

/** Three overlapping arcs — a signal that's already looped back before.
 * Hover sends out one quiet ping, echoing the arcs outward. */
export function AlreadyKnewIcon({ size = 20, className, hovered = false }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M8.5 15.2c1.6 1.7 4.2 1.7 5.8 0" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path
        d="M6.7 12.6c2.5 2.7 6.7 2.7 9.2 0"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M5 9.9c3.4 3.7 9.2 3.7 12.6 0"
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      {hovered ? (
        <circle
          cx="11.3"
          cy="12.4"
          r="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          style={{ transformOrigin: "11.3px 12.4px", transformBox: "fill-box" }}
          className="animate-[echo-ping_1000ms_ease-out]"
        />
      ) : null}
    </svg>
  );
}

/** A line that starts toward the second node and veers off before it lands.
 * Hover pushes the diverging branch further away — it reads as more of a miss. */
export function NotForMeIcon({ size = 20, className, hovered = false }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M6 15.5L12.4 8.6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path
        d="M11.2 10.1L18 8.2"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1.25"
        strokeLinecap="round"
        style={{
          transform: hovered ? "translate(2.5px, -2.5px) rotate(-8deg)" : "translate(0, 0) rotate(0deg)",
          transformOrigin: "11.2px 10.1px",
          transition: "transform 320ms var(--ease-out)",
        }}
      />
    </svg>
  );
}

/** A point with resonance moving outward from it. Hover blooms a small soft
 * glow behind it, like the resonance briefly catching. */
export function LikedItIcon({ size = 20, className, hovered = false }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <defs>
        <radialGradient id="liked-bloom">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle
        cx="12"
        cy="12.4"
        r="7"
        fill="url(#liked-bloom)"
        style={{
          opacity: hovered ? 0.85 : 0,
          transform: hovered ? "scale(1)" : "scale(0.25)",
          transformOrigin: "12px 12.4px",
          transition: "opacity 380ms var(--ease-out), transform 380ms var(--ease-out)",
        }}
      />
      <circle cx="12" cy="12.4" r="1.15" fill="currentColor" />
      <path d="M12 8.2V5.6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M15.4 9.6L17.3 7.8" stroke="currentColor" strokeOpacity="0.75" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M16.4 13.2L18.6 13.9" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M8.9 9.9L7.2 8.4" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

/** Two nodes joined — the connection completes. This is the brand primitive
 * itself, and the only response where the connection actually lands: hover
 * previews it (line brightens, hollow node starts to fill), selecting it
 * sends a point of light traveling from node to node the instant it locks in. */
export function PutMeOnIcon({
  size = 20,
  className,
  hovered = false,
  active = false,
  justConnected = false,
}: IconProps & { justConnected?: boolean }) {
  const connecting = hovered || active;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M6.6 16.4C9 13 15 11 17.4 7.6"
        stroke="currentColor"
        strokeLinecap="round"
        style={{
          strokeOpacity: connecting ? 0.95 : 0.55,
          strokeWidth: connecting ? 1.6 : 1.1,
          transition: "stroke-opacity 280ms var(--ease-out), stroke-width 280ms var(--ease-out)",
        }}
      />
      <circle
        cx="6.6"
        cy="16.4"
        r="1.5"
        stroke="currentColor"
        strokeWidth="1.15"
        style={{ fill: active ? "currentColor" : "var(--bg)", transition: "fill 280ms var(--ease-out)" }}
      />
      <circle cx="17.4" cy="7.6" r="1.5" fill="currentColor" />
      {justConnected ? (
        <circle r="1.4" fill="var(--white-glass-strong)" style={{ filter: "drop-shadow(0 0 3px var(--spectral-violet)) drop-shadow(0 0 4px var(--spectral-pink))" }}>
          <animateMotion dur="0.55s" path="M6.6 16.4C9 13 15 11 17.4 7.6" fill="freeze" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur="0.55s" fill="freeze" />
        </circle>
      ) : null}
    </svg>
  );
}
