"use client";

import { ConnectionMark } from "@/components/icons/ConnectionMark";
import { Atmosphere } from "@/components/Atmosphere";

export function EmptyState({
  title,
  description,
  mark = true,
  spacious = true,
}: {
  title: string;
  description?: string;
  /** show the quiet default-state connection mark above the copy */
  mark?: boolean;
  /** most call sites are a whole detail pane or full page — this gets the
   * fuller hero-scale field and bigger type. Set false for a genuinely
   * small/inset spot (a narrow list column with nothing in it). */
  spacious?: boolean;
}) {
  return (
    <div className={`relative flex flex-1 flex-col items-center justify-center gap-5 overflow-hidden px-6 text-center ${spacious ? "py-24" : "py-16"}`}>
      <Atmosphere seed={title} intensity={spacious ? "hero" : "ambient"} interactive={spacious} className={spacious ? "opacity-55" : "opacity-40"} />
      <div className="relative flex flex-col items-center gap-5">
        {mark ? <ConnectionMark size={spacious ? 56 : 40} className="text-text-tertiary opacity-70" /> : null}
        <div className="flex flex-col gap-2">
          <p className={spacious ? "text-[19px] font-medium text-text-primary" : "text-[15px] text-text-secondary"}>{title}</p>
          {description ? <p className="max-w-xs text-[13.5px] text-text-tertiary">{description}</p> : null}
        </div>
      </div>
    </div>
  );
}
