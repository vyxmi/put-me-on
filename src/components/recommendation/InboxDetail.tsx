"use client";

import Link from "next/link";
import { useRecommendation, useResponseActions } from "@/lib/data/store";
import { RecommendationHero } from "./RecommendationHero";
import { ResponsePicker } from "./ResponsePicker";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConnectionMark } from "@/components/icons/ConnectionMark";

export function InboxDetail({ id }: { id: string }) {
  const item = useRecommendation(id);
  const { submitResponse } = useResponseActions();

  if (!item || item.recommendation.deletedAt) {
    return <EmptyState title="this recommendation isn't available" description="it may have been removed." />;
  }

  const { track, sender, response, recommendation } = item;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8 px-6 py-10 animate-fade-slide">
      <p className="text-center text-[13px] text-text-secondary">
        <span className="text-text-primary">{sender.displayName}</span> wants to put you on to
      </p>

      <RecommendationHero track={track} note={recommendation.note} recommendationId={id} />

      <div className="flex flex-col gap-3">
        <p className="text-center text-[14px] text-text-secondary">what did you think?</p>
        <ResponsePicker current={response?.type} onSelect={(type) => submitResponse(id, type)} />
      </div>

      <div className="flex justify-center pt-6 hairline">
        <Link
          href={`/new?source=${recommendation.id}`}
          className="mt-6 flex items-center gap-2 text-[13px] text-text-secondary transition-colors hover:text-accent"
        >
          <ConnectionMark state="hover" size={30} />
          pass it on
        </Link>
      </div>
    </div>
  );
}
