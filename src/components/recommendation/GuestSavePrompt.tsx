"use client";

import { useState } from "react";
import { track as trackAnalytics } from "@/lib/analytics";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function GuestSavePrompt() {
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  if (saved) {
    return (
      <p className="animate-rise-in text-center text-[14px] text-text-secondary">
        check {email} to finish saving your history :-)
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!EMAIL_RE.test(email)) {
          setError(true);
          return;
        }
        setError(false);
        trackAnalytics("guest_email_submitted");
        setSaved(true);
      }}
      className="flex flex-col items-center gap-3 animate-rise-in"
    >
      <p className="text-[14px] text-text-primary">saved :-)</p>
      <p className="max-w-xs text-center text-[13px] text-text-secondary">
        save this + the music people send you?
      </p>
      <div className="flex w-full max-w-xs gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email address"
          className="min-w-0 flex-1 rounded-sm border border-border bg-transparent px-3 py-2 text-[14px] text-text-primary placeholder:text-text-tertiary focus:border-accent-dim"
        />
        <button
          type="submit"
          className="shrink-0 rounded-sm border border-border-strong px-3 py-2 text-[13px] text-text-primary transition-colors hover:border-accent-dim hover:text-accent"
        >
          save
        </button>
      </div>
      {error ? <p className="text-[12px] text-text-tertiary">that doesn&apos;t look like an email yet</p> : null}
    </form>
  );
}
