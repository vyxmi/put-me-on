"use client";

import gsap from "gsap";

interface FlipRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Carries one artwork's captured box across a route change so the same
 * cover art can visually fly from a floating Inbox tile into the
 * recommendation-detail hero, instead of the two fading between unrelated
 * elements. Module-level rather than store state on purpose — it's a
 * one-shot handoff between "the element that was just clicked" and
 * "whatever mounts next," not app state anything else should read.
 *
 * Implemented as a manual FLIP (plain rect math + a single gsap tween)
 * rather than gsap/Flip's element-matching, since the plugin's `targets`
 * remapping only reuses a captured state for elements it already knows
 * about — it doesn't retarget a state captured on one element onto an
 * unrelated one, which is exactly the cross-route case here. */
let pending: { id: string; rect: FlipRect } | null = null;

/** Call on click, before navigation, with the element that was actually clicked. */
export function captureFlipSource(id: string, el: Element | null) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  pending = { id, rect: { top: r.top, left: r.left, width: r.width, height: r.height } };
}

/** Call once the destination element for the same id has mounted. Plays the
 * FLIP if (and only if) a matching capture is still pending; consumes it
 * either way so a stale capture never replays on back/forward or refresh. */
export function playFlipInto(id: string, target: HTMLElement | null) {
  if (!target || !pending || pending.id !== id) {
    pending = null;
    return false;
  }
  const from = pending.rect;
  pending = null;

  const to = target.getBoundingClientRect();
  if (to.width === 0 || to.height === 0) return false;

  const scale = from.width / to.width;
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);

  gsap.fromTo(target, { x: dx, y: dy, scale }, { x: 0, y: 0, scale: 1, duration: 0.6, ease: "power3.out" });
  return true;
}
