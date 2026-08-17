"use client";

import Link from "next/link";
import { Artwork } from "@/components/Artwork";
import { CursorField } from "@/components/CursorField";
import { ChainMark } from "@/components/icons/ConnectionMark";
import { useMeData } from "@/lib/data/store";

const PRINCIPLES = [
  { n: "01", text: "one person picks one song, for you specifically. that's the whole send." },
  { n: "02", text: "if it actually gets you, you say “put me on” — that's what makes it count." },
  { n: "03", text: "pass it on, and the chain keeps moving without you." },
];

export default function LandingPage() {
  const { chains } = useMeData();
  const chain = chains[0];

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <CursorField className="opacity-50" />

      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <span className="text-[13px] font-medium tracking-wide text-text-secondary">put me on</span>
        <Link href="/inbox" className="text-link text-[13px] text-text-tertiary">
          already in? →
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-14 px-6 py-16 sm:px-10">
        <div className="flex flex-col gap-5">
          <h1 className="text-[34px] font-semibold leading-[1.08] tracking-tight text-text-primary sm:text-[48px]">
            spotify knows what you listen to.
            <br />
            <span className="text-accent-light">put me on remembers who put you on.</span>
          </h1>
          <p className="max-w-md text-[16px] leading-relaxed text-text-secondary">
            no feed, no playlist, no algorithm choosing for you. someone sends you one song, on purpose. you tell them
            if it landed. that&apos;s the whole product.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {PRINCIPLES.map((p) => (
            <div key={p.n} className="flex gap-4">
              <span className="w-5 shrink-0 font-mono text-[12px] font-semibold text-text-quaternary">{p.n}</span>
              <span className="text-[14.5px] leading-relaxed text-text-secondary">{p.text}</span>
            </div>
          ))}
        </div>

        {chain ? (
          <div className="flex flex-col items-start gap-4 border-l-2 border-border-strong pl-5">
            <div className="flex items-center gap-3">
              <Artwork seed={chain.track.artSeed} imageUrl={chain.track.artworkUrl} size={40} radius={2} />
              <div>
                <p className="text-[14px] text-text-primary">
                  {chain.fromPerson.displayName} → you → {chain.toLabel}
                </p>
                <p className="text-[12.5px] text-text-tertiary">
                  {chain.track.title} · {chain.track.artist}
                </p>
              </div>
            </div>
            <ChainMark size={112} className="text-text-quaternary" />
            <p className="text-[12px] text-text-quaternary">a real chain, from this account &mdash; not a mockup.</p>
          </div>
        ) : null}

        <div className="flex flex-col items-start gap-4">
          <Link
            href="/inbox"
            className="rounded-xs bg-accent px-6 py-3.5 text-[15px] font-semibold text-bg transition-opacity hover:opacity-90"
          >
            open put me on →
          </Link>
          <Link href="/r/r7" className="text-link text-[13px] text-text-tertiary">
            or see what a shared link looks like, as a guest →
          </Link>
        </div>
      </main>
    </div>
  );
}
