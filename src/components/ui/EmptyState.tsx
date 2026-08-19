"use client";

import { ConnectionMark } from "@/components/icons/ConnectionMark";
import { Atmosphere } from "@/components/Atmosphere";

export function EmptyState({
  title,
  description,
  mark = true,
}: {
  title: string;
  description?: string;
  /** show the quiet default-state connection mark above the copy */
  mark?: boolean;
}) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-4 overflow-hidden px-6 py-20 text-center">
      <Atmosphere seed={title} intensity="ambient" interactive={false} className="opacity-40" />
      <div className="relative flex flex-col items-center gap-4">
        {mark ? <ConnectionMark size={44} className="text-text-quaternary opacity-60" /> : null}
        <div className="flex flex-col gap-2">
          <p className="text-[15px] text-text-secondary">{title}</p>
          {description ? <p className="max-w-xs text-[13px] text-text-tertiary">{description}</p> : null}
        </div>
      </div>
    </div>
  );
}
