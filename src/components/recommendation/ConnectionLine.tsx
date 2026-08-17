"use client";

interface ConnectionLineProps {
  fromLabel: string;
  toLabel: string;
  connected: boolean;
  justConnected?: boolean;
  emphasize: "from" | "to";
}

/** The two-people-connecting primitive, expressed literally: a line between
 * two names that thickens and lights up once "put me on" lands, with a
 * point of light traveling across it the moment that happens. */
export function ConnectionLine({ fromLabel, toLabel, connected, justConnected, emphasize }: ConnectionLineProps) {
  return (
    <div className="flex items-center text-[15px]">
      <span className={`font-semibold ${emphasize === "from" ? "text-text-primary" : "text-text-tertiary"}`}>
        {fromLabel}
      </span>
      <span
        className="relative mx-3 block h-px"
        style={{
          width: connected ? 54 : 18,
          background: connected ? "var(--accent)" : "var(--border)",
          transition: "width var(--duration-slow) var(--ease-out), background var(--duration-base) linear",
        }}
      >
        {justConnected ? (
          <span
            className="absolute -top-[4px] left-0 h-[9px] w-[9px] rounded-full"
            style={{
              background: "var(--accent-light)",
              boxShadow: "0 0 10px 3px rgba(166,160,240,.8)",
              animation: "travel 0.8s ease-in-out",
            }}
          />
        ) : null}
      </span>
      <span className={`font-semibold ${emphasize === "to" ? "text-text-primary" : "text-text-tertiary"}`}>
        {toLabel}
      </span>
    </div>
  );
}
