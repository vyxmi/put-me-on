"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { Artwork } from "@/components/Artwork";
import { Atmosphere } from "@/components/Atmosphere";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ChainPreview } from "@/components/recommendation/ChainPreview";
import { MeConstellation } from "@/components/recommendation/MeConstellation";
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

/** The reverse shape: you, branching out to everyone you've put on — a quiet
 * tree rather than a converge point, since the direction of intent is flipped. */
function BranchList({ people }: { people: Person[] }) {
  return (
    <div className="flex flex-col">
      <span className="text-[15px] font-medium text-text-primary">you</span>
      <div className="ml-[7px] flex flex-col border-l border-border-strong">
        {people.map((p) => (
          <div key={p.id} className="relative flex items-center gap-2.5 py-1.5 pl-5">
            <span className="absolute left-0 top-1/2 h-px w-4 bg-border-strong" aria-hidden="true" />
            <span className="text-[15px] text-text-secondary">{p.displayName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MePage() {
  const user = useCurrentUser();
  const { putOnByEntries, peopleYouPutOn, recentlyPutOnTo, chains } = useMeData();

  useEffect(() => {
    trackAnalytics("me_viewed");
  }, []);

  return (
    <div className="flex w-full flex-col animate-fade-slide">
      {putOnByEntries.length > 0 ? (
        <div className="px-3 pt-3 sm:px-4 sm:pt-4">
          <MeConstellation displayName={user.displayName} handle={user.handle} entries={putOnByEntries} seed={user.id} />
        </div>
      ) : (
        <div className="relative overflow-hidden px-5 pb-8 pt-12 text-center sm:px-6">
          <Atmosphere seed={user.id} intensity="ambient" interactive />
          <div className="relative">
            <h1 className="text-[48px] font-bold leading-none tracking-tight text-text-primary sm:text-[64px]">
              {user.displayName.toUpperCase()}
            </h1>
            <p className="mt-2 font-mono text-[13px] text-text-tertiary">@{user.handle}</p>
            <p className="mt-6 text-[14px] text-text-tertiary">no one&apos;s put you on yet — that constellation shows up here once they do.</p>
          </div>
        </div>
      )}

      <div className="relative -mt-6 rounded-t-sm" style={{ background: "linear-gradient(180deg, transparent, var(--void) 20%)" }}>
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-14 px-5 pb-16 pt-8 sm:px-6">
          {peopleYouPutOn.length > 0 ? (
            <ScrollReveal>
              <Section title="you've put on" count={peopleYouPutOn.length}>
                <BranchList people={peopleYouPutOn} />
              </Section>
            </ScrollReveal>
          ) : null}

          {recentlyPutOnTo.length > 0 ? (
            <ScrollReveal className={peopleYouPutOn.length > 0 ? "hairline pt-10" : undefined}>
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
                        size={48}
                        radius={3}
                        className="transition-transform duration-200 ease-out group-hover:scale-[1.04]"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-[16px] text-text-primary">{item.track.title}</p>
                        <p className="truncate text-[14px] text-text-secondary">from {item.sender.displayName}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </Section>
            </ScrollReveal>
          ) : null}

          {chains.length > 0 ? (
            <ScrollReveal className="hairline pt-10">
              <Section title="chains">
                <div className="flex flex-col gap-4">
                  {chains.map((chain) => (
                    <ChainPreview key={chain.forwardedRecommendationId} chain={chain} />
                  ))}
                </div>
              </Section>
            </ScrollReveal>
          ) : null}

          <ScrollReveal className="hairline pt-10">
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
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
