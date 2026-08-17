"use client";

import { useEffect } from "react";
import { ensurePostHogInitialized } from "@/lib/posthog/client";

export function PostHogInit() {
  useEffect(() => {
    ensurePostHogInitialized();
  }, []);
  return null;
}
