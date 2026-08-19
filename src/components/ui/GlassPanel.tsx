import type { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";

type GlassPanelProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
  /** "light" is the softer-bordered variant for a lower-weight follow-up
   * panel sitting beneath a default-tone one. */
  tone?: "default" | "light";
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

/** The shared glass surface — history rows, chain previews, account
 * settings, Me page cards. One definition (see .glass-panel in
 * globals.css) so a change to the material shows up everywhere at once
 * instead of five near-identical inline style objects drifting apart. */
export function GlassPanel<T extends ElementType = "div">({
  as,
  children,
  className = "",
  tone = "default",
  ...rest
}: GlassPanelProps<T>) {
  const Component = as ?? "div";
  const toneClass = tone === "light" ? "glass-panel--light" : "glass-panel";
  return (
    <Component className={`${toneClass} rounded-sm border ${className}`} {...rest}>
      {children}
    </Component>
  );
}
