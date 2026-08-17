import type { ReactNode } from "react";
import { RecommendationRow } from "./RecommendationRow";
import { EmptyState } from "@/components/ui/EmptyState";
import type { InboxData } from "@/lib/data/store";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="px-4 pb-2 pt-5 font-detail font-bold text-[11px] uppercase tracking-wider text-text-tertiary md:px-6">
        {title}
      </div>
      {children}
    </div>
  );
}

export function RecommendationList({
  data,
  role,
  basePath,
  selectedId,
  emptyTitle,
  emptyDescription,
}: {
  data: InboxData;
  role: "inbox" | "sent";
  basePath: string;
  selectedId?: string | null;
  emptyTitle: string;
  emptyDescription?: string;
}) {
  const isEmpty = data.waiting.length === 0 && data.history.length === 0;

  if (isEmpty) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="flex flex-col pb-8">
      {data.waiting.length > 0 && (
        <Section title={`${data.waiting.length} waiting`}>
          {data.waiting.map((item) => (
            <RecommendationRow
              key={item.recommendation.id}
              item={item}
              role={role}
              href={`${basePath}/${item.recommendation.id}`}
              selected={item.recommendation.id === selectedId}
            />
          ))}
        </Section>
      )}
      {data.history.length > 0 && (
        <Section title="history">
          {data.history.map((item) => (
            <RecommendationRow
              key={item.recommendation.id}
              item={item}
              role={role}
              href={`${basePath}/${item.recommendation.id}`}
              selected={item.recommendation.id === selectedId}
            />
          ))}
        </Section>
      )}
    </div>
  );
}
