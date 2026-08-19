"use client";

import { useState, type ComponentType } from "react";
import { motion } from "motion/react";
import { AlreadyKnewIcon, NotForMeIcon, LikedItIcon, PutMeOnIcon } from "@/components/icons/ResponseIcons";
import { RESPONSE_LABEL, type ResponseType } from "@/lib/data/types";

interface IconRenderProps {
  size?: number;
  className?: string;
  hovered?: boolean;
  active?: boolean;
  justConnected?: boolean;
}

const SECONDARY_TYPES: ResponseType[] = ["already_knew", "not_for_me", "liked_it"];

const SECONDARY_ICONS: Record<string, ComponentType<IconRenderProps>> = {
  already_knew: AlreadyKnewIcon,
  not_for_me: NotForMeIcon,
  liked_it: LikedItIcon,
};

/** The three quiet reactions and the one that matters read as visually
 * distinct tiers rather than four equal slots: "already knew it" / "not for
 * me" / "liked it" sit together as a plain, tightly-grouped row — reactions
 * you note in passing — while `put me on` stands alone as a wide bar below,
 * since it's the response that actually forges the sender→recipient
 * connection (see ConnectionLine above this in InboxDetail). */
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
    const settle = type === "put_me_on" ? 650 : 260;
    window.setTimeout(() => setJustSelected((prev) => (prev === type ? null : prev)), settle);
  }

  const putMeOnActive = current === "put_me_on";
  const putMeOnHovered = hoveredType === "put_me_on";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-8">
        {SECONDARY_TYPES.map((type) => {
          const Icon = SECONDARY_ICONS[type];
          const active = current === type;
          const hovered = hoveredType === type;
          const iconColor = active ? "text-text-primary" : hovered ? "text-accent-light" : "text-text-tertiary";
          const labelColor = active ? "text-text-primary" : hovered ? "text-text-secondary" : "text-text-tertiary";

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
              whileTap={{ scale: 0.92 }}
              animate={justSelected === type ? { scale: [0.92, 1.04, 1] } : { scale: 1 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-2"
            >
              <Icon size={30} hovered={hovered} active={active} className={iconColor} />
              <span className={`text-[14px] font-medium leading-tight ${labelColor}`}>{RESPONSE_LABEL[type]}</span>
            </motion.button>
          );
        })}
      </div>

      <motion.button
        type="button"
        onClick={() => handleClick("put_me_on")}
        onMouseEnter={() => setHoveredType("put_me_on")}
        onMouseLeave={() => setHoveredType((h) => (h === "put_me_on" ? null : h))}
        onFocus={() => setHoveredType("put_me_on")}
        onBlur={() => setHoveredType((h) => (h === "put_me_on" ? null : h))}
        aria-pressed={putMeOnActive}
        whileTap={{ scale: 0.97 }}
        animate={
          justSelected === "put_me_on"
            ? { scale: [0.97, 1.02, 1] }
            : { scale: 1, borderColor: putMeOnActive || putMeOnHovered ? "var(--accent)" : "var(--border-strong)" }
        }
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className={`flex items-center justify-center gap-3 rounded-xs border py-4 transition-colors duration-200 ${
          putMeOnActive || putMeOnHovered ? "bg-accent/12 shadow-[0_8px_20px_-12px_rgba(63,96,212,0.5)]" : ""
        }`}
      >
        <PutMeOnIcon
          size={36}
          hovered={putMeOnHovered}
          active={putMeOnActive}
          justConnected={justSelected === "put_me_on"}
          className="text-accent-light"
        />
        <span className="text-[15px] font-semibold text-text-primary">put me on</span>
      </motion.button>
    </div>
  );
}
