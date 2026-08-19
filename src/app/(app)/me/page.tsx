"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { Artwork } from "@/components/Artwork";
import { Atmosphere } from "@/components/Atmosphere";
import { AccountSettings } from "@/components/AccountSettings";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ChainPreview } from "@/components/recommendation/ChainPreview";
import { MeConstellation } from "@/components/recommendation/MeConstellation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useCurrentUser, useMeData, type EnrichedRecommendation } from "@/lib/data/store";
import { track as trackAnalytics } from "@/lib/analytics";

function Section({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="flex items-baseline gap-2">
        <span className="text-eyebrow text-text-tertiary">{title}</span>
        {count !== undefined ? <span className="text-body-sm font-semibold text-text-primary">{count}</span> : null}
      </h2>
      {children}
    </div>
  );
}

/** One row shape for both directions — who, which track, which way it
 * travelled — so "you've put on" and "recently put on to" read as the same
 * kind of thing pointed in opposite directions, not two different widgets. */
function TrackRow({ href, entry, direction }: { href: string; entry: EnrichedRecommendation; direction: "to" | "from" }) {
  const personName = direction === "to" ? entry.recipientLabel : entry.sender.displayName;
  return (
    <Link href={href} className="group flex items-center gap-3.5 rounded-xs px-3 py-2.5 transition-colors duration-200 hover:bg-white-wash">
      <span className="block shrink-0 rounded-[3px] transition-all duration-300 ease-out group-hover:scale-[1.05] group-hover:shadow-[0_0_16px_-2px_var(--spectral-violet)]">
        <Artwork seed={entry.track.artSeed} imageUrl={entry.track.artworkUrl} size={44} radius={3} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-body-lg text-text-primary">{entry.track.title}</p>
        <p className="truncate text-body-sm text-text-secondary">
          {direction === "to" ? "to " : "from "}
          {personName}
        </p>
      </div>
    </Link>
  );
}

export default function MePage() {
  const user = useCurrentUser();
  const { putOnByEntries, putOnToEntries, recentlyPutOnTo, chains } = useMeData();

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
            <h1 className="text-display text-text-primary">{user.displayName.toUpperCase()}</h1>
            <p className="mt-2 font-mono text-body-sm text-text-tertiary">@{user.handle}</p>
            <p className="mt-6 text-body text-text-tertiary">no one&apos;s put you on yet — that constellation shows up here once they do.</p>
          </div>
        </div>
      )}

      <div className="relative -mt-6 rounded-t-sm" style={{ background: "linear-gradient(180deg, transparent, var(--void) 20%)" }}>
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-14 px-5 pb-16 pt-8 sm:px-6">
          {putOnToEntries.length > 0 ? (
            <ScrollReveal>
              <Section title="you've put on" count={putOnToEntries.length}>
                <GlassPanel className="flex flex-col gap-1 px-2 py-2">
                  {putOnToEntries.map((entry) => (
                    <TrackRow key={entry.recommendation.id} href={`/sent/${entry.recommendation.id}`} entry={entry} direction="to" />
                  ))}
                </GlassPanel>
              </Section>
            </ScrollReveal>
          ) : null}

          {recentlyPutOnTo.length > 0 ? (
            <ScrollReveal className={putOnToEntries.length > 0 ? "hairline pt-10" : undefined}>
              <Section title="recently put on to">
                <GlassPanel className="flex flex-col gap-1 px-2 py-2">
                  {recentlyPutOnTo.slice(0, 5).map((entry) => (
                    <TrackRow key={entry.recommendation.id} href={`/inbox/${entry.recommendation.id}`} entry={entry} direction="from" />
                  ))}
                </GlassPanel>
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
              <AccountSettings />
            </Section>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
