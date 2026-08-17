import type { Metadata } from "next";
import type { ReactNode } from "react";

// Unlisted, not indexed — per docs/V1_SCOPE.md §6: "recommendation pages
// should not be intentionally indexed by search engines."
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RecommendationLandingLayout({ children }: { children: ReactNode }) {
  return children;
}
