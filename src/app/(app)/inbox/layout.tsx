"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useInbox } from "@/lib/data/store";
import { RecommendationRow } from "@/components/recommendation/RecommendationRow";
import { WaitingCanvas } from "@/components/recommendation/WaitingCanvas";
import { EmptyState } from "@/components/ui/EmptyState";
import { track as trackAnalytics } from "@/lib/analytics";

export default function InboxLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { waiting, history } = useInbox();
  const selectedId = pathname.startsWith("/inbox/") ? pathname.slice("/inbox/".length) : null;
  const isDetailRoute = Boolean(selectedId);

  useEffect(() => {
    trackAnalytics("inbox_viewed");
  }, []);

  return (
    <div className="flex min-h-0 flex-1">
      <div
        className={`w-full shrink-0 overflow-y-auto md:block md:w-[380px] md:border-r md:border-border ${
          isDetailRoute ? "hidden" : "block"
        }`}
      >
        <div className="px-4 pb-2 pt-6 md:px-6">
          <h1 className="text-[22px] font-semibold uppercase tracking-tight text-text-primary">inbox</h1>
        </div>

        {waiting.length === 0 && history.length === 0 ? (
          <EmptyState
            title="nothing here yet"
            description="when someone puts you on to something, it'll show up here."
          />
        ) : (
          <div className="flex flex-col pb-8">
            {waiting.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 px-4 pb-2 pt-4 md:px-6">
                  <span
                    className="block h-[6px] w-[6px] shrink-0 rounded-full bg-accent"
                    style={{ boxShadow: "0 0 8px 2px rgba(63,96,212,.7)" }}
                  />
                  <span className="font-detail font-bold text-[11px] uppercase tracking-wider text-text-tertiary">
                    {waiting.length} waiting
                  </span>
                </div>
                <div className="px-4 md:px-6">
                  <WaitingCanvas items={waiting} />
                </div>
              </div>
            ) : null}

            {history.length > 0 ? (
              <div className={waiting.length > 0 ? "hairline mt-2" : undefined}>
                <div className="px-4 pb-2 pt-6 font-detail font-bold text-[11px] uppercase tracking-wider text-text-tertiary md:px-6">
                  history
                </div>
                {history.map((item) => (
                  <RecommendationRow
                    key={item.recommendation.id}
                    item={item}
                    role="inbox"
                    href={`/inbox/${item.recommendation.id}`}
                    selected={item.recommendation.id === selectedId}
                  />
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
      <div className={`flex-1 overflow-y-auto ${isDetailRoute ? "block" : "hidden md:block"}`}>{children}</div>
    </div>
  );
}
