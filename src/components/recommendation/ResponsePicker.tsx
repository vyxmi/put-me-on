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
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {RESPONSE_TYPES.map((type) => {
        const Icon = ICONS[type];
        const active = current === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => handleClick(type)}
            aria-pressed={active}
            className={`flex flex-col items-center gap-2 rounded-sm border px-3 py-4 text-center transition-colors ${
              active
                ? "border-accent-dim text-accent"
                : "border-border text-text-secondary hover:border-border-strong hover:text-text-primary"
            } ${justSelected === type ? "animate-stamp" : ""}`}
          >
            <Icon size={22} />
            <span className="text-[12.5px] leading-tight">{RESPONSE_LABEL[type]}</span>
          </button>
        );
      })}
    </div>
  );
}
