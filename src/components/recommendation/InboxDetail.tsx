"use client";

import { useState } from "react";
import Link from "next/link";
import { useRecommendation, useResponseActions } from "@/lib/data/store";
import { RecommendationHero } from "./RecommendationHero";
import { RecommendationScene } from "./RecommendationScene";
import { ResponsePicker } from "./ResponsePicker";
import { ConnectionLine } from "./ConnectionLine";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConnectionMark } from "@/components/icons/ConnectionMark";
import type { ResponseType } from "@/lib/data/types";

export function InboxDetail({ id }: { id: string }) {
  const item = useRecommendation(id);
  const { submitResponse } = useResponseActions();
  const [justConnected, setJustConnected] = useState(false);

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
        <p className="text-center text-[15px] text-text-secondary">
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
          <p className="text-[14px] text-text-secondary">what did you think?</p>
          <div className="w-full max-w-sm">
            <ResponsePicker current={response?.type} onSelect={handleSelect} />
          </div>
        </div>

        <Link
          href={`/new?source=${recommendation.id}`}
          className="flex items-center gap-2 text-[13px] text-text-secondary transition-colors hover:text-accent-light"
        >
          <ConnectionMark state="hover" size={30} />
          pass it on
        </Link>
      </div>
    </RecommendationScene>
  );
}
