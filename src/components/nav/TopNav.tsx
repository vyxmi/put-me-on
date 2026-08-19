"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectionMark } from "@/components/icons/ConnectionMark";
import { NAV_ITEMS } from "./nav-items";

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-border/50 bg-bg/95 backdrop-blur-sm md:hidden">
      <div className="flex items-center justify-between px-5 py-3.5">
        <Link href="/inbox" className="flex items-center gap-1.5 font-detail text-[13px] font-bold tracking-wide text-text-secondary">
          <ConnectionMark size={16} className="text-text-quaternary" />
          put me on
        </Link>
        <Link
          href="/new"
          className="btn-primary rounded-full px-3.5 py-1.5 font-detail text-[11px] font-bold uppercase tracking-wide"
        >
          + put someone on
        </Link>
      </div>
      <nav className="flex items-center gap-6 px-5 text-[14px]">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`border-b-2 py-2 transition-colors ${
                active ? "border-text-primary font-medium text-text-primary" : "border-transparent text-text-secondary"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
