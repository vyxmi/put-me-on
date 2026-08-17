"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRecommendation, useResponseActions } from "@/lib/data/store";
import { RecommendationHero } from "./RecommendationHero";
import { ResponsePicker } from "./ResponsePicker";
import { ConnectionLine } from "./ConnectionLine";
import { GuestSavePrompt } from "./GuestSavePrompt";
import { CursorField } from "@/components/CursorField";
import { TopographicWeb } from "@/components/TopographicWeb";
import { track as trackAnalytics } from "@/lib/analytics";
import type { ResponseType } from "@/lib/data/types";

export function GuestLanding({ id }: { id: string }) {
  const item = useRecommendation(id);
  const { submitResponse } = useResponseActions();
  const hasFiredView = useRef(false);
  const hasShownPrompt = useRef(false);
  const [justConnected, setJustConnected] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  useEffect(() => {
    if (item && !item.recommendation.deletedAt && !hasFiredView.current) {
      hasFiredView.current = true;
      trackAnalytics("recommendation_viewed", { recommendation_id: id });
    }
  }, [item, id]);

  useEffect(() => {
    if (item?.response && !hasShownPrompt.current) {
      hasShownPrompt.current = true;
      const t = window.setTimeout(() => {
        setShowSavePrompt(true);
        trackAnalytics("guest_save_prompt_shown", { recommendation_id: id });
      }, 550);
      return () => window.clearTimeout(t);
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

  function handleSelect(type: ResponseType) {
    if (type === "put_me_on" && response?.type !== "put_me_on") {
      setJustConnected(true);
      window.setTimeout(() => setJustConnected(false), 900);
    }
    submitResponse(id, type, { isGuestResponse: true });
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-16 sm:px-6">
      <CursorField />
      <TopographicWeb
        seed={id}
        className="pointer-events-none absolute -top-20 left-1/2 h-[500px] w-[500px] -translate-x-1/2 text-accent opacity-[0.18]"
      />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-9">
        <p className="text-center text-[14px] text-text-secondary">
          <span className="text-text-primary">{sender.displayName}</span> wants to put{" "}
          <span className="text-text-primary">{recipientLabel}</span> on to
        </p>

        <RecommendationHero
          track={track}
          note={recommendation.note}
          recommendationId={id}
          celebrate={justConnected}
        />

        <div className="hairline w-full" />

        <ConnectionLine
          fromLabel={sender.displayName}
          toLabel={recipientLabel}
          connected={response?.type === "put_me_on"}
          justConnected={justConnected}
          emphasize="from"
        />

        <div className="flex w-full flex-col items-center gap-4">
          <p className="text-[14px] text-text-secondary">what did you think?</p>
          <ResponsePicker current={response?.type} onSelect={handleSelect} />
        </div>

        {showSavePrompt ? <GuestSavePrompt defaultName={recipientLabel} /> : null}

        <Link href="/inbox" className="text-link text-[12px] text-text-tertiary">
          put me on
        </Link>
      </div>
    </div>
  );
}
