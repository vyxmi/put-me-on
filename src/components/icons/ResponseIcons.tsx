import { ConnectionMark } from "./ConnectionMark";

interface IconProps {
  size?: number;
  className?: string;
}

/** Two overlapping discs — a loop, something already circling back to you. */
export function AlreadyKnewIcon({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="9.5" cy="12" r="6" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="14.5" cy="12" r="6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/** A connection that never lands — line peels away before reaching the second node. */
export function NotForMeIcon({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="5" cy="15" r="2.6" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="19" cy="15" r="2.6" strokeWidth="1.4" stroke="currentColor" strokeOpacity="0.35" strokeDasharray="1.6 2.2" />
      <path d="M7.6 14 15 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M15 7 L15 10.4 M15 7 L11.6 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** A small resonance — signal moving outward from a point. */
export function LikedItIcon({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="6.5" cy="12" r="2.3" fill="currentColor" />
      <path d="M11.5 8.2a5.4 5.4 0 0 1 0 7.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M15.3 5.4a10 10 0 0 1 0 13.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

/** The connection completes — this is the brand primitive itself. */
export function PutMeOnIcon({ size = 22, className }: IconProps) {
  return <ConnectionMark state="connected" size={size * 1.7} className={className} />;
}
