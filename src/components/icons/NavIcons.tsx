interface IconProps {
  size?: number;
  className?: string;
  active?: boolean;
}

/** Inbox — a tray catching a signal dropping in. */
export function InboxIcon({ size = 20, className, active = false }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M5 13.5V7.8C5 6.8 5.8 6 6.8 6h10.4c1 0 1.8.8 1.8 1.8v5.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 13.5h4.3c.35 0 .65.2.8.5l.5 1c.15.3.45.5.8.5h1.2c.35 0 .65-.2.8-.5l.5-1c.15-.3.45-.5.8-.5H19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 13.5v3.7c0 1-.8 1.8-1.8 1.8H6.8C5.8 19 5 18.2 5 17.2v-3.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="4" r="1.1" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/** Sent — the same tray, signal already departed upward. */
export function SentIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M5 13.5V7.8C5 6.8 5.8 6 6.8 6h10.4c1 0 1.8.8 1.8 1.8v5.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 13.5h4.3c.35 0 .65.2.8.5l.5 1c.15.3.45.5.8.5h1.2c.35 0 .65-.2.8-.5l.5-1c.15-.3.45-.5.8-.5H19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 13.5v3.7c0 1-.8 1.8-1.8 1.8H6.8C5.8 19 5 18.2 5 17.2v-3.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 1.8v4.6M12 1.8L9.7 4.1M12 1.8l2.3 2.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Me — you, as the node everything else points at. */
export function MeIcon({ size = 20, className, active = false }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="7.2" stroke="currentColor" strokeWidth="1.4" style={{ fill: active ? "currentColor" : "none", fillOpacity: 0.12 }} />
      <circle cx="12" cy="12" r="2.1" fill="currentColor" />
    </svg>
  );
}
