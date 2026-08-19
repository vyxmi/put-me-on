import Link from "next/link";
import { Artwork } from "@/components/Artwork";
import { relativeTime } from "@/lib/utils/format";
import { RESPONSE_LABEL } from "@/lib/data/types";
import type { EnrichedRecommendation } from "@/lib/data/store";

type Role = "inbox" | "sent";

function getRowCopy(role: Role, item: EnrichedRecommendation): { headline: string; tag?: string } {
  const { response, sender, recipientLabel } = item;
  if (role === "inbox") {
    if (!response) return { headline: sender.displayName };
    if (response.type === "put_me_on") return { headline: `${sender.displayName} put you on` };
    return { headline: `${sender.displayName} sent you`, tag: RESPONSE_LABEL[response.type] };
  }
  if (!response) return { headline: recipientLabel, tag: "no response yet" };
  if (response.type === "put_me_on") return { headline: `you put ${recipientLabel} on` };
  return { headline: recipientLabel, tag: RESPONSE_LABEL[response.type] };
}

export function RecommendationRow({
  item,
  role,
  href,
  selected,
}: {
  item: EnrichedRecommendation;
  role: Role;
  href: string;
  selected?: boolean;
}) {
  const { headline, tag } = getRowCopy(role, item);
  const timeIso = item.response ? item.response.updatedAt : item.recommendation.createdAt;

  return (
    <Link
      href={href}
      aria-current={selected ? "true" : undefined}
      className={`group flex items-center gap-3 px-4 py-3 hairline-b transition-colors md:px-6 ${
        selected ? "bg-surface" : "hover:bg-surface"
      }`}
    >
      <span className="shrink-0 transition-transform duration-300 ease-out group-hover:-rotate-2 group-hover:scale-[1.05]">
        <Artwork seed={item.track.artSeed} imageUrl={item.track.artworkUrl} size={64} radius={3} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="truncate text-[16px] font-medium text-text-primary">{headline}</span>
          <span className="hidden shrink-0 items-center gap-1 font-mono text-[11px] text-text-tertiary md:group-hover:flex">
            open <span aria-hidden="true">→</span>
          </span>
        </span>
        <span className="flex items-baseline justify-between gap-3">
          <span className="truncate text-[13px] text-text-secondary">
            {item.track.title} · {item.track.artist}
          </span>
          <span className="shrink-0 font-mono text-[11px] text-text-tertiary md:group-hover:hidden">
            {relativeTime(timeIso)}
          </span>
        </span>
        {tag ? <span className="mt-0.5 block font-mono text-[11px] text-text-tertiary">{tag}</span> : null}
      </span>
    </Link>
  );
}
