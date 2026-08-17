"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/95 backdrop-blur-sm md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/inbox" className="font-detail text-[13px] font-bold tracking-wide text-text-secondary">
          put me on
        </Link>
        <Link href="/new" className="text-link text-[13px] text-accent-light">
          + put someone on
        </Link>
      </div>
      <nav className="flex items-center gap-5 px-4 pb-2 text-[14px]">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={active ? "text-text-primary" : "text-text-secondary"}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
