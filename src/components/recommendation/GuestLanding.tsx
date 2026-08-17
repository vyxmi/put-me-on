"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRecommendation, useResponseActions } from "@/lib/data/store";
import { RecommendationHero } from "./RecommendationHero";
import { ResponsePicker } from "./ResponsePicker";
import { GuestSavePrompt } from "./GuestSavePrompt";
import { CursorField } from "@/components/CursorField";
import { track as trackAnalytics } from "@/lib/analytics";

export function GuestLanding({ id }: { id: string }) {
  const item = useRecommendation(id);
  const { submitResponse } = useResponseActions();
  const hasFiredView = useRef(false);
  const hasShownPrompt = useRef(false);

  useEffect(() => {
    if (item && !item.recommendation.deletedAt && !hasFiredView.current) {
      hasFiredView.current = true;
      trackAnalytics("recommendation_viewed", { recommendation_id: id });
    }
  }, [item, id]);

  useEffect(() => {
    if (item?.response && !hasShownPrompt.current) {
      hasShownPrompt.current = true;
      trackAnalytics("guest_save_prompt_shown", { recommendation_id: id });
    }
  }, [item?.response, id]);

  if (!item || item.recommendation.deletedAt) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center px-6">
        <p className="text-[15px] text-text-secondary">this recommendation is no longer available.</p>
      </div>
    );
  }

  const { track, sender, response, recommendation, recipientLabel } = item;

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16">
      <CursorField />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-9">
        <p className="text-center text-[14px] text-text-secondary">
          <span className="text-text-primary">{sender.displayName}</span> wants to put{" "}
          <span className="text-text-primary">{recipientLabel}</span> on to
        </p>

        <RecommendationHero track={track} note={recommendation.note} recommendationId={id} />

        <div className="flex w-full flex-col items-center gap-4">
          <p className="text-[14px] text-text-secondary">what did you think?</p>
          <ResponsePicker
            current={response?.type}
            onSelect={(type) => submitResponse(id, type, { isGuestResponse: true })}
          />
        </div>

        {response ? <GuestSavePrompt /> : null}

        <Link href="/inbox" className="text-link text-[12px] text-text-tertiary">
          put me on
        </Link>
      </div>
    </div>
  );
}
