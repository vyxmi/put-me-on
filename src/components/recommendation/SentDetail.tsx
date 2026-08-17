"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRecommendation, useResponseActions, usePerson } from "@/lib/data/store";
import { RecommendationHero } from "./RecommendationHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConnectionMark } from "@/components/icons/ConnectionMark";
import { RESPONSE_LABEL } from "@/lib/data/types";
import { relativeTime } from "@/lib/utils/format";

export function SentDetail({ id }: { id: string }) {
  const item = useRecommendation(id);
  const { deleteRecommendation } = useResponseActions();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const router = useRouter();
  const sourceSender = usePerson(item?.sourceRecommendation?.senderId);

  if (!item || item.recommendation.deletedAt) {
    return <EmptyState title="this recommendation isn't available" description="it may have been removed." />;
  }

  const { track, recommendation, recipientLabel, response } = item;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8 px-6 py-10 animate-fade-slide">
      <p className="text-center text-[13px] text-text-secondary">
        you sent <span className="text-text-primary">{recipientLabel}</span>
      </p>

      <RecommendationHero track={track} note={recommendation.note} recommendationId={id} />

      {sourceSender ? (
        <p className="text-center font-mono text-[12px] text-text-tertiary">passed on from {sourceSender.displayName}</p>
      ) : null}

      <div className="flex flex-col items-center gap-2 pt-6 hairline">
        {response ? (
          response.type === "put_me_on" ? (
            <div className="flex flex-col items-center gap-2">
              <ConnectionMark state="connected" size={64} className="text-accent" />
              <p className="text-[15px] text-text-primary">you put {recipientLabel} on</p>
            </div>
          ) : (
            <p className="text-[14px] text-text-secondary">
              {recipientLabel} said: <span className="text-text-primary">{RESPONSE_LABEL[response.type]}</span>
            </p>
          )
        ) : (
          <p className="text-[14px] text-text-tertiary">no response yet</p>
        )}
        <p className="font-mono text-[11px] text-text-tertiary">sent {relativeTime(recommendation.createdAt)} ago</p>
      </div>

      <div className="flex justify-center">
        {confirmingDelete ? (
          <div className="flex items-center gap-3 text-[13px]">
            <span className="text-text-secondary">remove this recommendation?</span>
            <button
              type="button"
              onClick={() => {
                deleteRecommendation(id);
                router.push("/sent");
              }}
              className="text-accent"
            >
              remove
            </button>
            <button type="button" onClick={() => setConfirmingDelete(false)} className="text-text-tertiary">
              cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="text-[13px] text-text-tertiary transition-colors hover:text-text-secondary"
          >
            remove
          </button>
        )}
      </div>
    </div>
  );
}
