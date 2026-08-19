"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectionMark } from "@/components/icons/ConnectionMark";
import { InboxIcon, SentIcon, MeIcon } from "@/components/icons/NavIcons";
import { NAV_ITEMS } from "./nav-items";

const ICONS = { "/inbox": InboxIcon, "/sent": SentIcon, "/me": MeIcon };

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-border/50 bg-glass backdrop-blur-md md:hidden">
      <div className="flex items-center justify-between px-5 py-3.5">
        <Link href="/inbox" className="flex items-center gap-1.5 font-detail text-[14px] font-bold tracking-wide text-text-secondary">
          <ConnectionMark size={17} className="text-text-quaternary" />
          put me on
        </Link>
        <Link
          href="/new"
          className="btn-primary rounded-full px-3.5 py-1.5 font-detail text-[11px] font-bold uppercase tracking-wide"
        >
          + put someone on
        </Link>
      </div>
      <nav className="flex items-center justify-around px-2 text-[12px]">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = ICONS[item.href as keyof typeof ICONS];
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-1 flex-col items-center gap-1 py-2.5"
            >
              <Icon size={19} active={active} className={active ? "text-text-primary" : "text-text-tertiary"} />
              <span
                className={`font-detail text-[10px] font-bold uppercase tracking-wider ${
                  active ? "text-text-primary" : "text-text-quaternary"
                }`}
              >
                {item.label}
              </span>
              <span
                aria-hidden="true"
                className="absolute bottom-0 h-[2px] rounded-full transition-all duration-300"
                style={{
                  left: "30%",
                  right: "30%",
                  background: active ? "var(--white-glass-strong)" : "transparent",
                  boxShadow: active ? "0 0 6px 1px var(--spectral-violet)" : "none",
                }}
              />
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
