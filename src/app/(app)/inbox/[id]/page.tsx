"use client";

import { use } from "react";
import { InboxDetail } from "@/components/recommendation/InboxDetail";

export default function InboxDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <InboxDetail id={id} />;
}
