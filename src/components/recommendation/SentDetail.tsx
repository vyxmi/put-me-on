"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRecommendation, useResponseActions, usePerson } from "@/lib/data/store";
import { RecommendationHero } from "./RecommendationHero";
import { RecommendationScene } from "./RecommendationScene";
import { ConnectionLine } from "./ConnectionLine";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { TrashIcon } from "@/components/icons/UtilityIcons";
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
    <RecommendationScene track={track}>
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-9 px-5 py-12 sm:px-6 sm:py-16 animate-fade-slide">
      <p className="text-center text-body-lg text-text-primary/90">
        you sent <span className="text-text-primary">{recipientLabel}</span>
      </p>

      <RecommendationHero track={track} note={recommendation.note} recommendationId={id} />

      {sourceSender ? (
        <p className="text-center font-mono text-label text-text-tertiary">passed on from {sourceSender.displayName}</p>
      ) : null}

      <ConnectionLine
        fromLabel="you"
        toLabel={recipientLabel}
        connected={response?.type === "put_me_on"}
        emphasize="to"
      />

      <div className="flex flex-col items-center gap-1.5">
        {response ? (
          response.type === "put_me_on" ? (
            <p className="text-body-lg text-text-primary">you put {recipientLabel} on</p>
          ) : (
            <p className="text-body text-text-secondary">
              {recipientLabel} says: <span className="text-text-primary">{RESPONSE_LABEL[response.type]}</span>
            </p>
          )
        ) : (
          <p className="text-body text-text-tertiary">waiting to hear back from {recipientLabel}</p>
        )}
        <p className="text-mono-caption text-text-tertiary">sent {relativeTime(recommendation.createdAt)} ago</p>
      </div>

      <div className="flex justify-center">
        {confirmingDelete ? (
          <GlassPanel className="flex items-center gap-3 px-4 py-2.5">
            <TrashIcon size={15} className="text-text-tertiary" />
            <span className="text-body-sm text-text-secondary">remove this recommendation?</span>
            <button
              type="button"
              onClick={() => {
                deleteRecommendation(id);
                router.push("/sent");
              }}
              className="text-body-sm font-medium text-warn transition-opacity hover:opacity-75"
            >
              remove
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="text-body-sm text-text-tertiary transition-colors hover:text-text-primary"
            >
              cancel
            </button>
          </GlassPanel>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="flex items-center gap-1.5 text-body-sm text-text-tertiary transition-colors hover:text-text-secondary"
          >
            <TrashIcon size={13} />
            remove
          </button>
        )}
      </div>
      </div>
    </RecommendationScene>
  );
}
