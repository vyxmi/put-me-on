"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Artwork } from "@/components/Artwork";
import { ChainMark } from "@/components/icons/ConnectionMark";
import { GlassPanel } from "@/components/ui/GlassPanel";
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
      onTouchStart={() => onHover(copy)}
      className="text-link rounded-xs text-body-lg text-text-primary"
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
    <GlassPanel className="flex flex-col items-center gap-3 px-4 py-6 sm:px-5">
      <ChainMark size={140} className="text-text-tertiary" secondSegmentDrawn={drawn} />
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
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
      <p className="h-4 text-body-sm text-text-secondary">{hoverCopy ?? " "}</p>
      <Link
        href={`/sent/${chain.forwardedRecommendationId}`}
        className="group flex max-w-full items-center gap-2 rounded-xs px-2 py-1 transition-colors duration-200 hover:bg-white-wash"
      >
        <Artwork seed={chain.track.artSeed} imageUrl={chain.track.artworkUrl} size={28} radius={2} />
        <p className="min-w-0 truncate text-body-sm text-text-tertiary transition-colors duration-200 group-hover:text-text-primary">
          {chain.track.title} · {chain.track.artist}
        </p>
      </Link>
    </GlassPanel>
  );
}
