interface IconProps {
  size?: number;
  className?: string;
}

/** Three overlapping arcs — a signal that's already looped back before. */
export function AlreadyKnewIcon({ size = 20, className }: IconProps) {
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
    </svg>
  );
}

/** A line that starts toward the second node and veers off before it lands. */
export function NotForMeIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M6 15.5L12.4 8.6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M11.2 10.1L18 8.2" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

/** A point with resonance moving outward from it. */
export function LikedItIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12.4" r="1.15" fill="currentColor" />
      <path d="M12 8.2V5.6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M15.4 9.6L17.3 7.8" stroke="currentColor" strokeOpacity="0.75" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M16.4 13.2L18.6 13.9" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M8.9 9.9L7.2 8.4" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

/** Two nodes joined — the connection completes. This is the brand primitive itself. */
export function PutMeOnIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M6.6 16.4C9 13 15 11 17.4 7.6"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <circle cx="6.6" cy="16.4" r="1.5" fill="var(--bg)" stroke="currentColor" strokeWidth="1.15" />
      <circle cx="17.4" cy="7.6" r="1.5" fill="currentColor" />
    </svg>
  );
}
