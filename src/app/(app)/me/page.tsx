"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { Artwork } from "@/components/Artwork";
import { ChainPreview } from "@/components/recommendation/ChainPreview";
import { TopographicWeb } from "@/components/TopographicWeb";
import { useCurrentUser, useMeData } from "@/lib/data/store";
import { track as trackAnalytics } from "@/lib/analytics";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-detail font-bold text-[11px] uppercase tracking-wider text-text-tertiary">{title}</h2>
      {children}
    </div>
  );
}

function NameTag({ label }: { label: string }) {
  return (
    <span className="rounded-xs border border-border px-2.5 py-1 text-[13px] text-text-secondary transition-colors duration-200 hover:border-accent-dim hover:text-accent-light">
      {label}
    </span>
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

        <div className="relative mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <span className="text-[44px] font-semibold leading-none text-text-primary sm:text-[56px]">
              {peopleWhoPutYouOn.length}
            </span>
            <span className="text-[13px] text-text-tertiary">
              {peopleWhoPutYouOn.length === 1 ? "person has" : "people have"} put you on
            </span>
            {peopleWhoPutYouOn.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {peopleWhoPutYouOn.map((p) => (
                  <NameTag key={p.id} label={p.displayName} />
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[44px] font-semibold leading-none text-accent-light sm:text-[56px]">
              {peopleYouPutOn.length}
            </span>
            <span className="text-[13px] text-text-tertiary">
              you&apos;ve put {peopleYouPutOn.length === 1 ? "person" : "people"} on
            </span>
            {peopleYouPutOn.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {peopleYouPutOn.map((p) => (
                  <NameTag key={p.id} label={p.displayName} />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

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
    </div>
  );
}
