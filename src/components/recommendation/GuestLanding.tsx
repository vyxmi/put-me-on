"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useRecommendation, useResponseActions } from "@/lib/data/store";
import { useSampledGlow } from "@/components/Artwork";
import { RecommendationHero } from "./RecommendationHero";
import { RecommendationScene } from "./RecommendationScene";
import { ResponsePicker } from "./ResponsePicker";
import { ResponsePanel } from "./ResponsePanel";
import { ConnectionLine } from "./ConnectionLine";
import { GuestSavePrompt } from "./GuestSavePrompt";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConnectionMark } from "@/components/icons/ConnectionMark";
import { track as trackAnalytics } from "@/lib/analytics";
import type { ResponseType } from "@/lib/data/types";

export function GuestLanding({ id }: { id: string }) {
  const item = useRecommendation(id);
  const { submitResponse } = useResponseActions();
  const hasFiredView = useRef(false);
  const hasShownPrompt = useRef(false);
  const [justConnected, setJustConnected] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const color = useSampledGlow(item?.track.artworkUrl);

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
      }, 700);
      // Reset the guard on cleanup too, not just clear the timer — React
      // StrictMode double-invokes this effect in dev (mount, cleanup,
      // mount again). Without resetting the ref, that cleanup permanently
      // "used up" the one-shot guard and the timeout never got rescheduled,
      // so the prompt silently never appeared in dev. Production only
      // invokes once, so this is a no-op there.
      return () => {
        window.clearTimeout(t);
        hasShownPrompt.current = false;
      };
    }
  }, [item?.response, id]);

  if (!item || item.recommendation.deletedAt) {
    return (
      <div className="flex min-h-dvh flex-col">
        <EmptyState title="this recommendation is no longer available." />
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
    <RecommendationScene track={track}>
      <div className="relative flex min-h-dvh flex-col px-5 py-5 sm:px-6">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 font-detail text-[12px] font-bold tracking-wide text-text-tertiary">
            <ConnectionMark size={14} className="text-text-quaternary" />
            put me on
          </Link>
          <Link href="/inbox" className="text-link text-[12px] text-text-quaternary">
            sign in
          </Link>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center py-8">
          <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-9">
            <p className="text-center text-[15px] text-text-primary/90">
              <span className="text-text-primary">{sender.displayName}</span> wants to put{" "}
              <span className="text-text-primary">{recipientLabel}</span> on to
            </p>

            <RecommendationHero
              track={track}
              note={recommendation.note}
              recommendationId={id}
              celebrate={justConnected}
            />

            {/* Held back until put me on lands — the line above already
                names sender and recipient, so this is the payoff, not a
                repeat of information already on screen. */}
            <AnimatePresence>
              {response?.type === "put_me_on" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ConnectionLine fromLabel={sender.displayName} toLabel={recipientLabel} connected justConnected={justConnected} emphasize="from" />
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="w-full max-w-sm">
              <ResponsePanel color={color}>
                <div className="flex w-full flex-col items-center gap-4">
                  <p className="text-[14px] text-text-primary/90">what did you think?</p>
                  <ResponsePicker current={response?.type} onSelect={handleSelect} />
                </div>
              </ResponsePanel>
            </div>

            {showSavePrompt ? (
              <div className="w-full max-w-sm">
                <GuestSavePrompt defaultName={recipientLabel} color={color} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </RecommendationScene>
  );
}
