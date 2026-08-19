"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { track as trackAnalytics } from "@/lib/analytics";
import { ResponsePanel } from "./ResponsePanel";
import type { RGB } from "@/components/Artwork";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Same glass material as the response panel above it, but the lighter
 * `secondary` weight — this is a follow-up, not a second decision to make.
 * Slides/fades up once the response has settled. */
function Reveal({ color, children }: { color: RGB | null; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <ResponsePanel color={color} weight="secondary">
        <div className="flex w-full flex-col items-center gap-3">{children}</div>
      </ResponsePanel>
    </motion.div>
  );
}

export function GuestSavePrompt({ defaultName, color = null }: { defaultName?: string; color?: RGB | null }) {
  const [name, setName] = useState(defaultName ?? "");
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<"form" | "checking" | "saved">("form");
  const [error, setError] = useState(false);

  if (stage === "checking") {
    return (
      <Reveal color={color}>
        <div className="flex items-center gap-2.5">
          <span
            className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-white-glass-strong"
            style={{ boxShadow: "0 0 8px 2px var(--spectral-violet)" }}
          />
          <p className="text-[13px] text-text-tertiary">checking {email}</p>
        </div>
      </Reveal>
    );
  }

  if (stage === "saved") {
    return (
      <Reveal color={color}>
        <p className="text-center text-[13px] text-text-tertiary">
          you&apos;re all set, {name || "friend"} — that link confirms it&apos;s you.
        </p>
      </Reveal>
    );
  }

  return (
    <Reveal color={color}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim() || !EMAIL_RE.test(email)) {
            setError(true);
            return;
          }
          setError(false);
          trackAnalytics("guest_email_submitted");
          setStage("checking");
          window.setTimeout(() => setStage("saved"), 2200);
        }}
        className="flex w-full flex-col items-center gap-3"
      >
        <p className="text-center text-[12.5px] text-text-tertiary">save this + the music people send you?</p>
        <div className="flex w-full items-end gap-2">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="name"
            className="w-[40%] min-w-0 border-0 border-b border-border bg-transparent px-0.5 py-1.5 text-[13px] text-text-primary placeholder:text-text-quaternary focus:border-white-edge focus:outline-none"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            className="min-w-0 flex-1 border-0 border-b border-border bg-transparent px-0.5 py-1.5 text-[13px] text-text-primary placeholder:text-text-quaternary focus:border-white-edge focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xs px-2.5 py-1.5 text-[12px] font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            save
          </button>
        </div>
        {error ? <p className="text-[11px] text-text-quaternary">a name and a real-looking email, please</p> : null}
      </form>
    </Reveal>
  );
}
