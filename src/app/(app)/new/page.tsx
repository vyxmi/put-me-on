"use client";

import { use } from "react";
import { Composer } from "@/components/composer/Composer";

export default function NewPage({ searchParams }: { searchParams: Promise<{ source?: string }> }) {
  const { source } = use(searchParams);
  return <Composer sourceId={source} />;
}
