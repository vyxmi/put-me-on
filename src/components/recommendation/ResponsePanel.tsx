import type { ReactNode } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";

/** The glassy, colorless surface "what did you think?" + the four responses
 * live on: a very slight blur on the same --glass material the rest of the
 * product already uses — no album tint. Color here belongs to the light
 * that travels on "put me on," not to the panel it sits in. `weight`
 * controls how present it reads — "primary" for the response panel itself,
 * "secondary" for anything that should sit visually lighter beneath it
 * (the email-save panel). */
export function ResponsePanel({
  children,
  weight = "primary",
}: {
  children: ReactNode;
  weight?: "primary" | "secondary";
}) {
  const isPrimary = weight === "primary";

  return (
    <GlassPanel
      tone={isPrimary ? "default" : "light"}
      className={isPrimary ? "w-full px-5 py-6 backdrop-blur-sm sm:px-7" : "w-full px-4 py-4 backdrop-blur-[3px]"}
    >
      {children}
    </GlassPanel>
  );
}
