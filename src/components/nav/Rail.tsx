"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/lib/data/store";
import { NAV_ITEMS } from "./nav-items";

export function Rail() {
  const pathname = usePathname();
  const user = useCurrentUser();

  return (
    <aside className="hidden md:flex md:w-56 md:shrink-0 md:flex-col md:justify-between md:border-r md:border-border md:px-6 md:py-8">
      <div className="flex flex-col gap-10">
        <Link
          href="/inbox"
          className="font-detail text-[13px] font-bold tracking-wide text-text-secondary transition-colors hover:text-accent-light"
        >
          put me on
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`-mx-2 rounded-xs px-2 py-1.5 text-[15px] transition-all duration-200 ${
                  active
                    ? "text-text-primary"
                    : "text-text-secondary hover:translate-x-0.5 hover:text-accent-light"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/new" className="btn-secondary rounded-xs px-3 py-2 text-center text-[14px]">
          + put someone on
        </Link>
      </div>

      <div className="flex flex-col gap-1 text-[13px]">
        <span className="text-text-primary">{user.displayName}</span>
        <Link href="/settings" className="text-text-tertiary transition-colors hover:text-text-secondary">
          settings
        </Link>
      </div>
    </aside>
  );
}
