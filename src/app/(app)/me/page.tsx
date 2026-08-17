"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { Artwork } from "@/components/Artwork";
import { ChainPreview } from "@/components/recommendation/ChainPreview";
import { useCurrentUser, useMeData } from "@/lib/data/store";
import { track as trackAnalytics } from "@/lib/analytics";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">{title}</h2>
      {children}
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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-14 px-5 py-12 animate-fade-slide sm:px-6 md:py-16">
      <div>
        <h1 className="text-[40px] font-semibold tracking-tight text-text-primary sm:text-[52px]">
          {user.displayName.toUpperCase()}
        </h1>
        <p className="mt-1 text-[14px] text-text-tertiary">@{user.handle}</p>
        <p className="mt-6 text-[17px] leading-relaxed text-text-secondary sm:text-[19px]">
          {peopleWhoPutYouOn.length} {peopleWhoPutYouOn.length === 1 ? "person has" : "people have"} put you on.
          <br />
          you&apos;ve put {peopleYouPutOn.length} {peopleYouPutOn.length === 1 ? "person" : "people"} on.
        </p>
      </div>

      {recentlyPutOnTo.length > 0 ? (
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
      ) : null}

      {peopleWhoPutYouOn.length > 0 ? (
        <Section title="people who put you on">
          <p className="text-[15px] text-text-secondary">{peopleWhoPutYouOn.map((p) => p.displayName).join(", ")}</p>
        </Section>
      ) : null}

      {peopleYouPutOn.length > 0 ? (
        <Section title="people you've put on">
          <p className="text-[15px] text-text-secondary">{peopleYouPutOn.map((p) => p.displayName).join(", ")}</p>
        </Section>
      ) : null}

      {chains.length > 0 ? (
        <Section title="chains">
          <div className="flex flex-col gap-4">
            {chains.map((chain) => (
              <ChainPreview key={chain.forwardedRecommendationId} chain={chain} />
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  );
}
