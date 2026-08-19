"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { PutMeOnIcon } from "@/components/icons/ResponseIcons";
import { MagneticButton } from "@/components/MagneticButton";
import { RESPONSE_LABEL, type ResponseType } from "@/lib/data/types";

const SECONDARY_TYPES: ResponseType[] = ["already_knew", "not_for_me", "liked_it"];

/** A one-shot micro-motion per reaction, played on selection — not an icon,
 * just a small physical response so each choice still feels distinct
 * without needing a pictogram to carry that. */
const MICRO_MOTION: Record<string, { scale?: number[]; x?: number[]; filter?: string[] }> = {
  already_knew: { scale: [1, 1.07, 1] },
  not_for_me: { x: [0, -5, 0] },
  liked_it: { scale: [1, 1.09, 1], filter: ["brightness(1)", "brightness(1.35)", "brightness(1)"] },
};

/** Text-first: the three quiet reactions are just words with a generous
 * invisible tap area and a small type-specific flourish on selection — no
 * icons, no button chrome. `put me on` stands apart, but its specialness
 * now lives entirely in the sender→recipient connection it reveals above,
 * not in a box or a decorative divider on the control itself. */
export function ResponsePicker({
  current,
  onSelect,
}: {
  current?: ResponseType;
  onSelect: (type: ResponseType) => void;
}) {
  const [justSelected, setJustSelected] = useState<ResponseType | null>(null);
  const [hoveredType, setHoveredType] = useState<ResponseType | null>(null);

  function handleClick(type: ResponseType) {
    onSelect(type);
    setJustSelected(type);
    const settle = type === "put_me_on" ? 650 : 420;
    window.setTimeout(() => setJustSelected((prev) => (prev === type ? null : prev)), settle);
  }

  const putMeOnActive = current === "put_me_on";
  const putMeOnHovered = hoveredType === "put_me_on";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        {SECONDARY_TYPES.map((type) => {
          const active = current === type;
          const hovered = hoveredType === type;
          return (
            <motion.button
              key={type}
              type="button"
              onClick={() => handleClick(type)}
              onMouseEnter={() => setHoveredType(type)}
              onMouseLeave={() => setHoveredType((h) => (h === type ? null : h))}
              onFocus={() => setHoveredType(type)}
              onBlur={() => setHoveredType((h) => (h === type ? null : h))}
              aria-pressed={active}
              animate={justSelected === type ? MICRO_MOTION[type] : { scale: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-xs px-4 py-3.5 text-[17px]"
            >
              <span
                className={
                  active
                    ? "font-medium text-text-primary"
                    : hovered
                      ? "text-text-secondary"
                      : "text-text-tertiary"
                }
              >
                {RESPONSE_LABEL[type]}
              </span>
            </motion.button>
          );
        })}
      </div>

      <MagneticButton strength={0.12} range={60}>
        <motion.button
          type="button"
          onClick={() => handleClick("put_me_on")}
          onMouseEnter={() => setHoveredType("put_me_on")}
          onMouseLeave={() => setHoveredType((h) => (h === "put_me_on" ? null : h))}
          onFocus={() => setHoveredType("put_me_on")}
          onBlur={() => setHoveredType((h) => (h === "put_me_on" ? null : h))}
          aria-pressed={putMeOnActive}
          whileTap={{ scale: 0.96 }}
          animate={justSelected === "put_me_on" ? { scale: [0.96, 1.03, 1] } : { scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-full items-center justify-center gap-3 rounded-xs py-3.5"
        >
          <PutMeOnIcon
            size={putMeOnActive ? 32 : 28}
            hovered={putMeOnHovered}
            active={putMeOnActive}
            justConnected={justSelected === "put_me_on"}
            className={putMeOnActive || putMeOnHovered ? "text-text-primary" : "text-text-tertiary"}
          />
          <span
            className={`text-[17px] ${
              putMeOnActive ? "font-semibold text-text-primary" : putMeOnHovered ? "font-medium text-text-primary" : "text-text-secondary"
            }`}
          >
            put me on
          </span>
        </motion.button>
      </MagneticButton>
    </div>
  );
}
