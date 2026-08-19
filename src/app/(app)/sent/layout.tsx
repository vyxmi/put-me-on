"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSent } from "@/lib/data/store";
import { RecommendationList } from "@/components/recommendation/RecommendationList";
import { Atmosphere } from "@/components/Atmosphere";
import { track as trackAnalytics } from "@/lib/analytics";

export default function SentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const data = useSent();
  const selectedId = pathname.startsWith("/sent/") ? pathname.slice("/sent/".length) : null;
  const isDetailRoute = Boolean(selectedId);

  useEffect(() => {
    trackAnalytics("sent_viewed");
  }, []);

  return (
    <div className="flex min-h-0 flex-1">
      <div
        className={`relative w-full shrink-0 overflow-y-auto md:block md:w-[380px] md:border-r md:border-border ${
          isDetailRoute ? "hidden" : "block"
        }`}
      >
        <Atmosphere seed="sent-list" intensity="ambient" interactive={false} className="opacity-60" />
        <div className="relative">
          <div className="px-4 pb-2 pt-6 md:px-6">
            <h1 className="text-[22px] font-semibold uppercase tracking-tight text-text-primary">sent</h1>
          </div>
          <RecommendationList
            data={data}
            role="sent"
            basePath="/sent"
            selectedId={selectedId}
            emptyTitle="you haven't put anyone on yet"
            emptyDescription="paste a link to start."
          />
        </div>
      </div>
      <div className={`flex-1 overflow-y-auto ${isDetailRoute ? "block" : "hidden md:block"}`}>{children}</div>
    </div>
  );
}
