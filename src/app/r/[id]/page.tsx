"use client";

import { use } from "react";
import { GuestLanding } from "@/components/recommendation/GuestLanding";

export default function RecommendationLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <GuestLanding id={id} />;
}
