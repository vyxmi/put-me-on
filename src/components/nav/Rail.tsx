"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/lib/data/store";
import { ConnectionMark } from "@/components/icons/ConnectionMark";
import { InboxIcon, SentIcon, MeIcon } from "@/components/icons/NavIcons";
import { MagneticButton } from "@/components/MagneticButton";
import { NAV_ITEMS } from "./nav-items";

const ICONS = { "/inbox": InboxIcon, "/sent": SentIcon, "/me": MeIcon };

export function Rail() {
  const pathname = usePathname();
  const user = useCurrentUser();

  return (
    <aside className="hidden md:flex md:w-[76px] md:shrink-0 md:flex-col md:items-center md:justify-between md:border-r md:border-border/50 md:py-7">
      <div className="flex flex-col items-center gap-9">
        <Link href="/inbox" title="put me on" className="group">
          <ConnectionMark size={20} className="text-text-quaternary transition-colors group-hover:text-spectral-ice" />
        </Link>

        <nav className="flex flex-col items-center gap-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = ICONS[item.href as keyof typeof ICONS];
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={item.label}
                className="group relative flex flex-col items-center gap-1 rounded-xs px-2 py-2.5"
              >
                {active ? (
                  <span
                    className="absolute inset-0 rounded-xs"
                    style={{
                      background: "radial-gradient(circle at 50% 40%, var(--white-glow), transparent 70%)",
                    }}
                  />
                ) : null}
                <Icon
                  size={21}
                  active={active}
                  className={`relative transition-colors duration-200 ${
                    active ? "text-text-primary" : "text-text-tertiary group-hover:text-text-primary"
                  }`}
                />
                <span
                  className={`relative font-detail text-[9.5px] font-bold uppercase tracking-wider transition-colors duration-200 ${
                    active ? "text-text-primary" : "text-text-quaternary group-hover:text-text-secondary"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <MagneticButton className="inline-flex">
          <Link
            href="/new"
            title="put someone on"
            className="btn-primary flex h-11 w-11 items-center justify-center rounded-full text-[20px] font-semibold leading-none"
          >
            +
          </Link>
        </MagneticButton>
      </div>

      <Link
        href="/me"
        title={user.displayName}
        className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold text-text-secondary transition-colors hover:text-text-primary"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)" }}
      >
        {user.displayName.charAt(0).toUpperCase()}
      </Link>
    </aside>
  );
}
