// Frontend-only conceptual model for V0. Deliberately smaller than the
// eventual Supabase schema (docs/ARCHITECTURE.md) — this captures only what
// the UI needs to render real product semantics against mock data. Field
// names are chosen to map cleanly onto that schema later.

export type ResponseType = "already_knew" | "not_for_me" | "liked_it" | "put_me_on";

export const RESPONSE_TYPES: ResponseType[] = [
  "already_knew",
  "not_for_me",
  "liked_it",
  "put_me_on",
];

export const RESPONSE_LABEL: Record<ResponseType, string> = {
  already_knew: "already knew it",
  not_for_me: "not for me",
  liked_it: "liked it",
  put_me_on: "put me on",
};

export interface Person {
  id: string;
  displayName: string;
  handle: string;
}

export type TrackMetadataStatus = "ok" | "failed";

export interface Track {
  id: string;
  provider: "spotify";
  sourceUrl: string;
  title: string;
  artist: string;
  album?: string;
  durationMs?: number;
  /** deterministic seed for generated placeholder artwork */
  artSeed: string;
  metadataStatus: TrackMetadataStatus;
}

export type Recipient =
  | { type: "registered"; personId: string }
  | { type: "guest"; name: string };

export interface Recommendation {
  id: string;
  senderId: string;
  recipient: Recipient;
  trackId: string;
  note?: string;
  sourceRecommendationId?: string;
  createdAt: string;
  deletedAt?: string;
}

export interface ResponseRecord {
  id: string;
  recommendationId: string;
  type: ResponseType;
  /** true if the responder had no persistent account at the moment of response */
  isGuestResponse: boolean;
  createdAt: string;
  updatedAt: string;
}
