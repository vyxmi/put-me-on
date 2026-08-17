"use client";

import { useState } from "react";
import { track as trackAnalytics } from "@/lib/analytics";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function GuestSavePrompt({ defaultName }: { defaultName?: string }) {
  const [name, setName] = useState(defaultName ?? "");
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<"form" | "checking" | "saved">("form");
  const [error, setError] = useState(false);

  if (stage === "checking") {
    return (
      <div className="flex animate-rise-in items-center gap-2.5">
        <span className="h-2 w-2 animate-pulse-dot rounded-full bg-accent" style={{ boxShadow: "0 0 8px 2px rgba(166,160,240,.6)" }} />
        <p className="text-[14px] text-text-secondary">check {email}</p>
      </div>
    );
  }

  if (stage === "saved") {
    return (
      <p className="animate-rise-in text-center text-[14px] text-text-secondary">
        you&apos;re all set, {name || "friend"} — that link confirms it&apos;s you.
      </p>
    );
  }

  return (
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
      className="flex flex-col items-center gap-3 animate-rise-in"
    >
      <p className="text-[14px] text-text-primary">saved :-)</p>
      <p className="max-w-xs text-center text-[13px] text-text-secondary">
        save this + the music people send you?
      </p>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="your name"
          className="w-full border-0 border-b border-border bg-transparent px-0.5 py-2.5 text-[14px] text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email address"
          className="w-full border-0 border-b border-border bg-transparent px-0.5 py-2.5 text-[14px] text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
        />
        <button type="submit" className="btn-primary rounded-xs px-4 py-2.5 text-[13.5px] font-semibold">
          save
        </button>
      </div>
      {error ? <p className="text-[12px] text-text-tertiary">a name and a real-looking email, please</p> : null}
    </form>
  );
}
