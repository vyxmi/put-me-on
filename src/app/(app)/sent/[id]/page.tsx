"use client";

import { use } from "react";
import { SentDetail } from "@/components/recommendation/SentDetail";

export default function SentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <SentDetail id={id} />;
}
