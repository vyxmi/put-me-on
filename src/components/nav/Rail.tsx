"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/lib/data/store";
import { ConnectionMark } from "@/components/icons/ConnectionMark";
import { NAV_ITEMS } from "./nav-items";

export function Rail() {
  const pathname = usePathname();
  const user = useCurrentUser();

  return (
    <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col md:justify-between md:border-r md:border-border/50 md:px-8 md:py-8">
      <div className="flex flex-col gap-12">
        <Link
          href="/inbox"
          className="group flex items-center gap-2 font-detail text-[13px] font-bold tracking-wide text-text-secondary transition-colors hover:text-text-primary"
        >
          <ConnectionMark size={18} className="text-text-quaternary transition-colors group-hover:text-accent-light" />
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
                className={`-mx-2.5 rounded-xs px-2.5 py-1.5 text-[15px] transition-all duration-200 ${
                  active
                    ? "bg-surface-2 font-medium text-text-primary"
                    : "text-text-secondary hover:translate-x-0.5 hover:text-text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/new"
          className="btn-secondary rounded-xs px-3 py-2.5 text-center font-detail text-[12px] font-bold uppercase tracking-wide"
        >
          + put someone on
        </Link>
      </div>

      <Link href="/me" className="text-[13px] text-text-tertiary transition-colors hover:text-text-secondary">
        {user.displayName}
      </Link>
    </aside>
  );
}
