"use client";

import { useState } from "react";
import Link from "next/link";
import { useRecommendation, useResponseActions } from "@/lib/data/store";
import { RecommendationHero } from "./RecommendationHero";
import { RecommendationScene } from "./RecommendationScene";
import { ResponsePicker } from "./ResponsePicker";
import { ConnectionLine } from "./ConnectionLine";
import { EmptyState } from "@/components/ui/EmptyState";
import { ChainMark } from "@/components/icons/ConnectionMark";
import type { ResponseType } from "@/lib/data/types";

export function InboxDetail({ id }: { id: string }) {
  const item = useRecommendation(id);
  const { submitResponse } = useResponseActions();
  const [justConnected, setJustConnected] = useState(false);
  const [passOnHovered, setPassOnHovered] = useState(false);

  if (!item || item.recommendation.deletedAt) {
    return <EmptyState title="this recommendation isn't available" description="it may have been removed." />;
  }

  const { track, sender, response, recommendation } = item;

  function handleSelect(type: ResponseType) {
    if (type === "put_me_on" && response?.type !== "put_me_on") {
      setJustConnected(true);
      window.setTimeout(() => setJustConnected(false), 900);
    }
    submitResponse(id, type);
  }

  return (
    <RecommendationScene track={track}>
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-9 px-5 py-12 sm:px-6 sm:py-16 animate-fade-slide">
        <p className="text-center text-[15px] text-text-primary/90">
          <span className="text-text-primary">{sender.displayName}</span> wants to put you on to
        </p>

        <RecommendationHero
          track={track}
          note={recommendation.note}
          recommendationId={id}
          celebrate={justConnected}
        />

        <ConnectionLine
          fromLabel={sender.displayName}
          toLabel="you"
          connected={response?.type === "put_me_on"}
          justConnected={justConnected}
          emphasize="from"
        />

        <div className="flex w-full flex-col items-center gap-3">
          <p className="text-[14px] text-text-primary/90">what did you think?</p>
          <div className="w-full max-w-sm">
            <ResponsePicker current={response?.type} onSelect={handleSelect} />
          </div>
        </div>

        <Link
          href={`/new?source=${recommendation.id}`}
          onMouseEnter={() => setPassOnHovered(true)}
          onMouseLeave={() => setPassOnHovered(false)}
          onTouchStart={() => setPassOnHovered(true)}
          className="group flex items-center gap-3 rounded-xs border border-transparent px-5 py-2.5 transition-colors duration-300 hover:border-border-strong active:border-border-strong"
        >
          <ChainMark size={44} className="text-text-tertiary transition-colors duration-300 group-hover:text-text-primary" secondSegmentDrawn={passOnHovered} />
          <span className="flex flex-col items-start">
            <span className="text-[14px] font-medium text-text-secondary transition-colors duration-300 group-hover:text-text-primary">
              pass it on
            </span>
            <span className="text-[11px] text-text-quaternary">continue the chain</span>
          </span>
        </Link>
      </div>
    </RecommendationScene>
  );
}
