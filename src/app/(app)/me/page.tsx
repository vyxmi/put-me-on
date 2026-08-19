"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { Artwork } from "@/components/Artwork";
import { ChainPreview } from "@/components/recommendation/ChainPreview";
import { TopographicWeb } from "@/components/TopographicWeb";
import { useCurrentUser, useMeData } from "@/lib/data/store";
import { track as trackAnalytics } from "@/lib/analytics";
import type { Person } from "@/lib/data/types";

function Section({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="flex items-baseline gap-2">
        <span className="font-detail font-bold text-[11px] uppercase tracking-wider text-text-tertiary">{title}</span>
        {count !== undefined ? <span className="text-[13px] font-semibold text-text-primary">{count}</span> : null}
      </h2>
      {children}
    </div>
  );
}

/** People converging on you: names in a row, each with a quiet line running
 * down toward a shared "you" point. Deliberately not a force-directed graph —
 * just enough geometry to read as "these people point at you." */
function ConvergeField({ people }: { people: Person[] }) {
  const shown = people.slice(0, 6);
  const overflow = people.length - shown.length;
  const n = shown.length;

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="grid w-full" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
        {shown.map((p) => (
          <span key={p.id} className="truncate px-1 text-center text-[14px] text-text-secondary">
            {p.displayName}
          </span>
        ))}
      </div>
      <svg viewBox="0 0 100 22" preserveAspectRatio="none" className="h-[22px] w-full max-w-[280px]" aria-hidden="true">
        {shown.map((p, i) => {
          const x = ((i + 0.5) / n) * 100;
          return (
            <line
              key={p.id}
              x1={x}
              y1="0"
              x2="50"
              y2="22"
              stroke="var(--border-strong)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      <span className="font-detail text-[11px] font-bold uppercase tracking-wider text-text-primary">you</span>
      {overflow > 0 ? <span className="mt-1 text-[12px] text-text-tertiary">+{overflow} more</span> : null}
    </div>
  );
}

/** The reverse shape: you, branching out to everyone you've put on — a quiet
 * tree rather than a converge point, since the direction of intent is flipped. */
function BranchList({ people }: { people: Person[] }) {
  return (
    <div className="flex flex-col">
      <span className="text-[14px] font-medium text-text-primary">you</span>
      <div className="ml-[7px] flex flex-col border-l border-border-strong">
        {people.map((p) => (
          <div key={p.id} className="relative flex items-center gap-2.5 py-1.5 pl-5">
            <span className="absolute left-0 top-1/2 h-px w-4 bg-border-strong" aria-hidden="true" />
            <span className="text-[14px] text-text-secondary">{p.displayName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MePage() {
  const user = useCurrentUser();
  const { peopleWhoPutYouOn, peopleYouPutOn, recentlyPutOnTo, chains } = useMeData();

  useEffect(() => {
    trackAnalytics("me_viewed");
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-16 px-5 py-12 animate-fade-slide sm:px-6 md:py-16">
      <div className="relative">
        <TopographicWeb
          seed={user.id}
          className="pointer-events-none absolute -right-10 -top-16 h-[280px] w-[280px] text-accent opacity-[0.35] sm:h-[340px] sm:w-[340px]"
        />
        <div className="relative">
          <h1 className="text-[40px] font-semibold tracking-tight text-text-primary sm:text-[52px]">
            {user.displayName.toUpperCase()}
          </h1>
          <p className="mt-1 text-[14px] text-text-tertiary">@{user.handle}</p>
        </div>
      </div>

      {peopleWhoPutYouOn.length > 0 ? (
        <Section title="put on by" count={peopleWhoPutYouOn.length}>
          <ConvergeField people={peopleWhoPutYouOn} />
        </Section>
      ) : null}

      {peopleYouPutOn.length > 0 ? (
        <div className={peopleWhoPutYouOn.length > 0 ? "hairline pt-10" : undefined}>
          <Section title="you've put on" count={peopleYouPutOn.length}>
            <BranchList people={peopleYouPutOn} />
          </Section>
        </div>
      ) : null}

      {recentlyPutOnTo.length > 0 ? (
        <div className="hairline pt-10">
          <Section title="recently put on to">
            <div className="flex flex-col gap-4">
              {recentlyPutOnTo.slice(0, 5).map((item) => (
                <Link
                  key={item.recommendation.id}
                  href={`/inbox/${item.recommendation.id}`}
                  className="group flex items-center gap-4"
                >
                  <Artwork
                    seed={item.track.artSeed}
                    imageUrl={item.track.artworkUrl}
                    size={44}
                    radius={2}
                    className="transition-transform duration-200 ease-out group-hover:scale-[1.04]"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[15px] text-text-primary">{item.track.title}</p>
                    <p className="truncate text-[13px] text-text-secondary">from {item.sender.displayName}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        </div>
      ) : null}

      {chains.length > 0 ? (
        <div className="hairline relative pt-10">
          <TopographicWeb
            seed={`${user.id}-chains`}
            web={false}
            className="pointer-events-none absolute -left-16 top-0 h-[260px] w-[260px] text-accent opacity-[0.28]"
          />
          <div className="relative">
            <Section title="chains">
              <div className="flex flex-col gap-4">
                {chains.map((chain) => (
                  <ChainPreview key={chain.forwardedRecommendationId} chain={chain} />
                ))}
              </div>
            </Section>
          </div>
        </div>
      ) : null}

      <div className="hairline pt-10">
        <Section title="account">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-detail font-bold text-[11px] uppercase tracking-wider text-text-tertiary">display name</span>
              <span className="text-[15px] text-text-primary">{user.displayName}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-detail font-bold text-[11px] uppercase tracking-wider text-text-tertiary">handle</span>
              <span className="text-[15px] text-text-primary">@{user.handle}</span>
            </div>
            <p className="text-[13px] text-text-tertiary">account and session settings will live here.</p>
          </div>
        </Section>
      </div>
    </div>
  );
}
