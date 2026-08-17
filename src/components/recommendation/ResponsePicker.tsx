"use client";

import { useState, type ComponentType } from "react";
import { AlreadyKnewIcon, NotForMeIcon, LikedItIcon, PutMeOnIcon } from "@/components/icons/ResponseIcons";
import { RESPONSE_LABEL, RESPONSE_TYPES, type ResponseType } from "@/lib/data/types";

const ICONS: Record<ResponseType, ComponentType<{ size?: number; className?: string }>> = {
  already_knew: AlreadyKnewIcon,
  not_for_me: NotForMeIcon,
  liked_it: LikedItIcon,
  put_me_on: PutMeOnIcon,
};

export function ResponsePicker({
  current,
  onSelect,
}: {
  current?: ResponseType;
  onSelect: (type: ResponseType) => void;
}) {
  const [justSelected, setJustSelected] = useState<ResponseType | null>(null);

  function handleClick(type: ResponseType) {
    onSelect(type);
    setJustSelected(type);
    window.setTimeout(() => setJustSelected((prev) => (prev === type ? null : prev)), 260);
  }

  return (
    <div className="flex gap-2.5">
      {RESPONSE_TYPES.map((type) => {
        const Icon = ICONS[type];
        const active = current === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => handleClick(type)}
            aria-pressed={active}
            className={`flex aspect-square min-w-0 flex-1 flex-col items-center justify-center gap-2 rounded-xs border text-center transition-all duration-200 ${
              active
                ? "border-accent bg-accent/12 text-text-primary"
                : "border-border text-text-tertiary hover:border-border-strong hover:text-text-secondary"
            } ${justSelected === type ? "animate-stamp" : ""}`}
          >
            <Icon size={20} className={active ? "text-accent-light" : "text-text-tertiary"} />
            <span className="px-1 text-[10.5px] leading-tight tracking-wide">{RESPONSE_LABEL[type]}</span>
          </button>
        );
      })}
    </div>
  );
}
