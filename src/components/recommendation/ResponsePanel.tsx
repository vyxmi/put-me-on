import type { ReactNode } from "react";
import type { RGB } from "@/components/Artwork";

/** The glassy surface "what did you think?" + the four responses live on:
 * a very slight blur, a soft tint pulled from the album art itself (or a
 * quiet violet default when there isn't one yet), sitting on the same
 * --glass material the rest of the product already uses. `weight` controls
 * how present it reads — "primary" for the response panel itself,
 * "secondary" for anything that should sit visually lighter beneath it
 * (the email-save panel). */
export function ResponsePanel({
  color,
  children,
  weight = "primary",
}: {
  color: RGB | null;
  children: ReactNode;
  weight?: "primary" | "secondary";
}) {
  const isPrimary = weight === "primary";
  const [r, g, b] = color ?? [124, 92, 255];
  const tint = `rgba(${r}, ${g}, ${b}, ${isPrimary ? 0.16 : 0.08})`;
  const tintSoft = `rgba(${r}, ${g}, ${b}, ${isPrimary ? 0.05 : 0.02})`;

  return (
    <div
      className={`w-full rounded-sm border ${isPrimary ? "px-5 py-6 sm:px-7 backdrop-blur-sm" : "px-4 py-4 backdrop-blur-[3px]"}`}
      style={{
        background: `linear-gradient(180deg, ${tint}, ${tintSoft} 55%, var(--glass))`,
        borderColor: isPrimary ? "var(--border-strong)" : "var(--border)",
      }}
    >
      {children}
    </div>
  );
}
