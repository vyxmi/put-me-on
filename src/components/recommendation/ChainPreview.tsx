"use client";

import { useEffect, useState } from "react";
import { Artwork } from "@/components/Artwork";
import { ChainMark } from "@/components/icons/ConnectionMark";
import type { ChainLink } from "@/lib/data/store";

function NameNode({
  label,
  copy,
  onHover,
}: {
  label: string;
  copy: string;
  onHover: (copy: string | null) => void;
}) {
  return (
    <button
      type="button"
      onMouseEnter={() => onHover(copy)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(copy)}
      onBlur={() => onHover(null)}
      className="rounded-xs text-[15px] text-text-primary transition-colors hover:text-accent"
    >
      {label}
    </button>
  );
}

export function ChainPreview({ chain }: { chain: ChainLink }) {
  const [drawn, setDrawn] = useState(false);
  const [hoverCopy, setHoverCopy] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDrawn(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 rounded-xs border border-border px-5 py-6">
      <ChainMark size={140} className="text-text-tertiary" secondSegmentDrawn={drawn} />
      <div className="flex items-center gap-2">
        <NameNode label={chain.fromPerson.displayName} copy={`sent ${chain.track.title} to you`} onHover={setHoverCopy} />
        <span className="text-text-tertiary" aria-hidden="true">
          →
        </span>
        <NameNode label="you" copy="said “put me on”" onHover={setHoverCopy} />
        <span className="text-text-tertiary" aria-hidden="true">
          →
        </span>
        <NameNode label={chain.toLabel} copy={`you passed it to ${chain.toLabel}`} onHover={setHoverCopy} />
      </div>
      <p className="h-4 text-[13px] text-text-secondary">{hoverCopy ?? " "}</p>
      <div className="flex items-center gap-2">
        <Artwork seed={chain.track.artSeed} imageUrl={chain.track.artworkUrl} size={28} radius={2} />
        <p className="text-[13px] text-text-tertiary">
          {chain.track.title} · {chain.track.artist}
        </p>
      </div>
    </div>
  );
}
