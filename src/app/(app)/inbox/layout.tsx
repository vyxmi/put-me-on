"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useInbox } from "@/lib/data/store";
import { RecommendationList } from "@/components/recommendation/RecommendationList";
import { track as trackAnalytics } from "@/lib/analytics";

export default function InboxLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const data = useInbox();
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
          <h1 className="text-[22px] font-semibold text-text-primary">inbox</h1>
        </div>
        <RecommendationList
          data={data}
          role="inbox"
          basePath="/inbox"
          selectedId={selectedId}
          emptyTitle="nothing here yet"
          emptyDescription="when someone puts you on to something, it'll show up here."
        />
      </div>
      <div className={`flex-1 overflow-y-auto ${isDetailRoute ? "block" : "hidden md:block"}`}>{children}</div>
    </div>
  );
}
