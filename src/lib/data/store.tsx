"use client";

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import type { Person, Track, Recommendation, ResponseRecord, ResponseType, Recipient } from "./types";
import {
  people as seedPeople,
  tracks as seedTracks,
  recommendations as seedRecommendations,
  responses as seedResponses,
  RESOLVABLE_TRACK_IDS,
  CURRENT_USER_ID,
} from "./mock-data";
import { generateId, generatePublicId, parseSpotifyTrackUrl } from "../utils/format";
import { track as trackAnalytics } from "../analytics";

export { CURRENT_USER_ID };

interface DataState {
  people: Person[];
  tracks: Track[];
  recommendations: Recommendation[];
  responses: ResponseRecord[];
}

type Action =
  | { type: "CREATE_RECOMMENDATION"; recommendation: Recommendation }
  | { type: "ADD_TRACK"; track: Track }
  | { type: "UPSERT_RESPONSE"; recommendationId: string; responseType: ResponseType; isGuestResponse: boolean }
  | { type: "DELETE_RECOMMENDATION"; id: string };

function reducer(state: DataState, action: Action): DataState {
  switch (action.type) {
    case "CREATE_RECOMMENDATION":
      return { ...state, recommendations: [...state.recommendations, action.recommendation] };
    case "ADD_TRACK":
      return { ...state, tracks: [...state.tracks, action.track] };
    case "UPSERT_RESPONSE": {
      const now = new Date().toISOString();
      const existing = state.responses.find((r) => r.recommendationId === action.recommendationId);
      if (existing) {
        return {
          ...state,
          responses: state.responses.map((r) =>
            r.id === existing.id ? { ...r, type: action.responseType, updatedAt: now } : r
          ),
        };
      }
      const created: ResponseRecord = {
        id: generateId("resp"),
        recommendationId: action.recommendationId,
        type: action.responseType,
        isGuestResponse: action.isGuestResponse,
        createdAt: now,
        updatedAt: now,
      };
      return { ...state, responses: [...state.responses, created] };
    }
    case "DELETE_RECOMMENDATION":
      return {
        ...state,
        recommendations: state.recommendations.map((r) =>
          r.id === action.id ? { ...r, deletedAt: new Date().toISOString() } : r
        ),
      };
    default:
      return state;
  }
}

export interface EnrichedRecommendation {
  recommendation: Recommendation;
  track: Track;
  sender: Person;
  recipientLabel: string;
  recipientPersonId?: string;
  response?: ResponseRecord;
  sourceRecommendation?: Recommendation;
}

function enrich(recommendation: Recommendation, state: DataState): EnrichedRecommendation | null {
  const track = state.tracks.find((t) => t.id === recommendation.trackId);
  const sender = state.people.find((p) => p.id === recommendation.senderId);
  if (!track || !sender) return null;
  const recipient = recommendation.recipient;
  const recipientLabel =
    recipient.type === "registered"
      ? (state.people.find((p) => p.id === recipient.personId)?.displayName ?? "someone")
      : recipient.name;
  const response = state.responses.find((r) => r.recommendationId === recommendation.id);
  const sourceRecommendation = recommendation.sourceRecommendationId
    ? state.recommendations.find((r) => r.id === recommendation.sourceRecommendationId)
    : undefined;
  return {
    recommendation,
    track,
    sender,
    recipientLabel,
    recipientPersonId: recipient.type === "registered" ? recipient.personId : undefined,
    response,
    sourceRecommendation,
  };
}

interface DataContextValue {
  state: DataState;
  submitResponse: (recommendationId: string, type: ResponseType, opts?: { isGuestResponse?: boolean }) => void;
  createRecommendation: (input: {
    recipient: Recipient;
    trackId: string;
    note?: string;
    sourceRecommendationId?: string;
  }) => Recommendation;
  deleteRecommendation: (id: string) => void;
  resolveTrack: (url: string) => { track: Track; ok: boolean } | { error: "invalid_url" };
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, () => ({
    people: seedPeople,
    tracks: seedTracks,
    recommendations: seedRecommendations,
    responses: seedResponses,
  }));

  const value = useMemo<DataContextValue>(() => {
    const submitResponse: DataContextValue["submitResponse"] = (recommendationId, type, opts) => {
      dispatch({ type: "UPSERT_RESPONSE", recommendationId, responseType: type, isGuestResponse: opts?.isGuestResponse ?? false });
      trackAnalytics("response_submitted", { recommendation_id: recommendationId, response_type: type });
      if (type === "put_me_on") trackAnalytics("put_on_confirmed", { recommendation_id: recommendationId });
    };

    const createRecommendation: DataContextValue["createRecommendation"] = (input) => {
      const recommendation: Recommendation = {
        id: generatePublicId(),
        senderId: CURRENT_USER_ID,
        recipient: input.recipient,
        trackId: input.trackId,
        note: input.note,
        sourceRecommendationId: input.sourceRecommendationId,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "CREATE_RECOMMENDATION", recommendation });
      trackAnalytics("recommendation_created", {
        recommendation_id: recommendation.id,
        recipient_type: input.recipient.type,
        source_recommendation_present: Boolean(input.sourceRecommendationId),
      });
      return recommendation;
    };

    const deleteRecommendation: DataContextValue["deleteRecommendation"] = (id) => {
      dispatch({ type: "DELETE_RECOMMENDATION", id });
    };

    const resolveTrack: DataContextValue["resolveTrack"] = (url) => {
      const parsed = parseSpotifyTrackUrl(url);
      if (!parsed) return { error: "invalid_url" };
      const knownTrackId = RESOLVABLE_TRACK_IDS[parsed.trackId];
      if (knownTrackId) {
        const found = state.tracks.find((t) => t.id === knownTrackId);
        if (found) {
          trackAnalytics("track_metadata_loaded", { track_id: found.id });
          return { track: found, ok: true };
        }
      }
      const existing = state.tracks.find((t) => t.sourceUrl === parsed.normalizedUrl);
      if (existing) return { track: existing, ok: existing.metadataStatus === "ok" };
      const newTrack: Track = {
        id: generateId("track"),
        provider: "spotify",
        sourceUrl: parsed.normalizedUrl,
        title: "track unavailable",
        artist: "metadata couldn't be loaded",
        artSeed: parsed.trackId,
        metadataStatus: "failed",
      };
      dispatch({ type: "ADD_TRACK", track: newTrack });
      trackAnalytics("track_metadata_failed", { track_id: newTrack.id });
      return { track: newTrack, ok: false };
    };

    return { state, submitResponse, createRecommendation, deleteRecommendation, resolveTrack };
  }, [state]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

export function useCurrentUser(): Person {
  const { state } = useData();
  return state.people.find((p) => p.id === CURRENT_USER_ID)!;
}

export function usePerson(id: string | undefined): Person | undefined {
  const { state } = useData();
  return id ? state.people.find((p) => p.id === id) : undefined;
}

export function usePeople(): Person[] {
  const { state } = useData();
  return state.people;
}

export function useRecommendation(id: string): EnrichedRecommendation | undefined {
  const { state } = useData();
  const rec = state.recommendations.find((r) => r.id === id);
  if (!rec) return undefined;
  return enrich(rec, state) ?? undefined;
}

export function useResponseActions() {
  const { submitResponse, deleteRecommendation, createRecommendation, resolveTrack } = useData();
  return { submitResponse, deleteRecommendation, createRecommendation, resolveTrack };
}

export interface InboxData {
  waiting: EnrichedRecommendation[];
  history: EnrichedRecommendation[];
}

export function useInbox(): InboxData {
  const { state } = useData();
  return useMemo(() => {
    const mine = state.recommendations
      .filter((r) => !r.deletedAt && r.recipient.type === "registered" && r.recipient.personId === CURRENT_USER_ID)
      .map((r) => enrich(r, state))
      .filter((r): r is EnrichedRecommendation => r !== null);
    const waiting = mine
      .filter((r) => !r.response)
      .sort((a, b) => +new Date(b.recommendation.createdAt) - +new Date(a.recommendation.createdAt));
    const history = mine
      .filter((r) => r.response)
      .sort((a, b) => +new Date(b.response!.updatedAt) - +new Date(a.response!.updatedAt));
    return { waiting, history };
  }, [state]);
}

export function useSent(): InboxData {
  const { state } = useData();
  return useMemo(() => {
    const mine = state.recommendations
      .filter((r) => !r.deletedAt && r.senderId === CURRENT_USER_ID)
      .map((r) => enrich(r, state))
      .filter((r): r is EnrichedRecommendation => r !== null);
    const waiting = mine
      .filter((r) => !r.response)
      .sort((a, b) => +new Date(b.recommendation.createdAt) - +new Date(a.recommendation.createdAt));
    const history = mine
      .filter((r) => r.response)
      .sort((a, b) => +new Date(b.response!.updatedAt) - +new Date(a.response!.updatedAt));
    return { waiting, history };
  }, [state]);
}

export interface ChainLink {
  fromPerson: Person;
  toLabel: string;
  track: Track;
  sourceRecommendationId: string;
  forwardedRecommendationId: string;
}

export interface MeData {
  peopleWhoPutYouOn: Person[];
  peopleYouPutOn: Person[];
  recentlyPutOnTo: EnrichedRecommendation[];
  chains: ChainLink[];
}

export function useMeData(): MeData {
  const { state } = useData();
  return useMemo(() => {
    const enrichedAll = state.recommendations
      .filter((r) => !r.deletedAt)
      .map((r) => enrich(r, state))
      .filter((r): r is EnrichedRecommendation => r !== null);

    const receivedByMe = enrichedAll.filter(
      (r) => r.recommendation.recipient.type === "registered" && r.recommendation.recipient.personId === CURRENT_USER_ID
    );
    const sentByMe = enrichedAll.filter((r) => r.recommendation.senderId === CURRENT_USER_ID);

    const putYouOnEntries = receivedByMe.filter((r) => r.response?.type === "put_me_on");
    const peopleWhoPutYouOnIds = new Set(putYouOnEntries.map((r) => r.sender.id));
    const peopleWhoPutYouOn = state.people.filter((p) => peopleWhoPutYouOnIds.has(p.id));

    const putOnEntries = sentByMe.filter(
      (r) => r.response?.type === "put_me_on" && r.recommendation.recipient.type === "registered"
    );
    const peopleYouPutOnIds = new Set(putOnEntries.map((r) => r.recipientPersonId).filter(Boolean) as string[]);
    const peopleYouPutOn = state.people.filter((p) => peopleYouPutOnIds.has(p.id));

    const recentlyPutOnTo = [...putYouOnEntries].sort(
      (a, b) => +new Date(b.response!.updatedAt) - +new Date(a.response!.updatedAt)
    );

    const chains: ChainLink[] = sentByMe
      .filter((r) => r.sourceRecommendation)
      .map((r) => {
        const source = enrich(r.sourceRecommendation!, state);
        if (!source || source.response?.type !== "put_me_on") return null;
        const link: ChainLink = {
          fromPerson: source.sender,
          toLabel: r.recipientLabel,
          track: r.track,
          sourceRecommendationId: source.recommendation.id,
          forwardedRecommendationId: r.recommendation.id,
        };
        return link;
      })
      .filter((c): c is ChainLink => c !== null);

    return { peopleWhoPutYouOn, peopleYouPutOn, recentlyPutOnTo, chains };
  }, [state]);
}
