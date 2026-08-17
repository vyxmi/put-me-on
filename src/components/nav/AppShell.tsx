import type { ReactNode } from "react";
import { Rail } from "./Rail";
import { TopNav } from "./TopNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <Rail />
      <TopNav />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
