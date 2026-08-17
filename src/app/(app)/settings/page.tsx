"use client";

import { useCurrentUser } from "@/lib/data/store";

export default function SettingsPage() {
  const user = useCurrentUser();

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-6 py-12">
      <h1 className="text-[20px] font-semibold text-text-primary">settings</h1>
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
  );
}
