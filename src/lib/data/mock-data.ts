import type { Person, Track, Recommendation, ResponseRecord } from "./types";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

export const CURRENT_USER_ID = "vyomi";

export const people: Person[] = [
  { id: "vyomi", displayName: "Vyomi", handle: "vyomi" },
  { id: "sam", displayName: "Sam", handle: "sam" },
  { id: "josh", displayName: "Josh", handle: "josh" },
  { id: "maya", displayName: "Maya", handle: "maya" },
  { id: "ella", displayName: "Ella", handle: "ella" },
  { id: "charles", displayName: "Charles", handle: "charles" },
];

export const tracks: Track[] = [
  {
    id: "t-carry-the-zero",
    provider: "spotify",
    sourceUrl: "https://open.spotify.com/track/1abcCarryTheZero",
    title: "Carry the Zero",
    artist: "Built to Spill",
    album: "Keep It Like a Secret",
    durationMs: 4 * 60000 + 22000,
    artSeed: "carry-the-zero",
    metadataStatus: "ok",
  },
  {
    id: "t-dagger",
    provider: "spotify",
    sourceUrl: "https://open.spotify.com/track/2abcDagger",
    title: "Dagger",
    artist: "Slowdive",
    album: "Pygmalion",
    durationMs: 6 * 60000 + 6000,
    artSeed: "dagger",
    metadataStatus: "ok",
  },
  {
    id: "t-cleva",
    provider: "spotify",
    sourceUrl: "https://open.spotify.com/track/3abcCleva",
    title: "Cleva",
    artist: "Erykah Badu",
    album: "Mama's Gun",
    durationMs: 3 * 60000 + 51000,
    artSeed: "cleva",
    metadataStatus: "ok",
  },
  {
    id: "t-redbone",
    provider: "spotify",
    sourceUrl: "https://open.spotify.com/track/4abcRedbone",
    title: "Redbone",
    artist: "Childish Gambino",
    album: "Awaken, My Love!",
    durationMs: 5 * 60000 + 27000,
    artSeed: "redbone",
    metadataStatus: "ok",
  },
  {
    id: "t-slow-show",
    provider: "spotify",
    sourceUrl: "https://open.spotify.com/track/5abcSlowShow",
    title: "Slow Show",
    artist: "The National",
    album: "Boxer",
    durationMs: 6 * 60000 + 55000,
    artSeed: "slow-show",
    metadataStatus: "ok",
  },
  {
    id: "t-motion-pictures",
    provider: "spotify",
    sourceUrl: "https://open.spotify.com/track/6abcMotionPictures",
    title: "Moya",
    artist: "Godspeed You! Black Emperor",
    album: "F♯ A♯ ∞",
    durationMs: 14 * 60000 + 39000,
    artSeed: "moya",
    metadataStatus: "ok",
  },
];

export const recommendations: Recommendation[] = [
  {
    id: "r1",
    senderId: "sam",
    recipient: { type: "registered", personId: "vyomi" },
    trackId: "t-dagger",
    note: "trust me on this one",
    createdAt: ago(10 * DAY),
  },
  {
    id: "r2",
    senderId: "vyomi",
    recipient: { type: "registered", personId: "josh" },
    trackId: "t-dagger",
    note: "thought of you",
    sourceRecommendationId: "r1",
    createdAt: ago(8 * DAY),
  },
  {
    id: "r3",
    senderId: "charles",
    recipient: { type: "registered", personId: "vyomi" },
    trackId: "t-cleva",
    note: "after 2:34",
    createdAt: ago(5 * DAY),
  },
  {
    id: "r4",
    senderId: "josh",
    recipient: { type: "registered", personId: "vyomi" },
    trackId: "t-redbone",
    createdAt: ago(3 * DAY),
  },
  {
    id: "r5",
    senderId: "ella",
    recipient: { type: "registered", personId: "vyomi" },
    trackId: "t-slow-show",
    note: "the bridge",
    createdAt: ago(1 * DAY),
  },
  {
    id: "r6",
    senderId: "vyomi",
    recipient: { type: "registered", personId: "maya" },
    trackId: "t-carry-the-zero",
    note: "trust me after 2:34",
    createdAt: ago(2 * DAY),
  },
  {
    id: "r7",
    senderId: "vyomi",
    recipient: { type: "guest", name: "Priya" },
    trackId: "t-motion-pictures",
    createdAt: ago(6 * DAY),
  },
  {
    id: "r8",
    senderId: "vyomi",
    recipient: { type: "registered", personId: "ella" },
    trackId: "t-redbone",
    note: "you'll love this",
    createdAt: ago(12 * DAY),
  },
  {
    id: "r9",
    senderId: "maya",
    recipient: { type: "registered", personId: "vyomi" },
    trackId: "t-dagger",
    note: "for real this time",
    createdAt: ago(15 * DAY),
  },
  {
    id: "r10",
    senderId: "sam",
    recipient: { type: "registered", personId: "vyomi" },
    trackId: "t-redbone",
    createdAt: ago(20 * DAY),
  },
  {
    id: "r11",
    senderId: "vyomi",
    recipient: { type: "registered", personId: "charles" },
    trackId: "t-slow-show",
    note: "for the drive",
    createdAt: ago(25 * DAY),
  },
  {
    id: "r12",
    senderId: "sam",
    recipient: { type: "registered", personId: "vyomi" },
    trackId: "t-motion-pictures",
    createdAt: ago(12 * HOUR),
  },
];

export const responses: ResponseRecord[] = [
  {
    id: "resp-r1",
    recommendationId: "r1",
    type: "put_me_on",
    isGuestResponse: false,
    createdAt: ago(9 * DAY),
    updatedAt: ago(9 * DAY),
  },
  {
    id: "resp-r2",
    recommendationId: "r2",
    type: "put_me_on",
    isGuestResponse: false,
    createdAt: ago(6 * DAY),
    updatedAt: ago(6 * DAY),
  },
  {
    id: "resp-r3",
    recommendationId: "r3",
    type: "put_me_on",
    isGuestResponse: false,
    createdAt: ago(4 * DAY),
    updatedAt: ago(4 * DAY),
  },
  {
    id: "resp-r4",
    recommendationId: "r4",
    type: "liked_it",
    isGuestResponse: false,
    createdAt: ago(2 * DAY),
    updatedAt: ago(2 * DAY),
  },
  {
    id: "resp-r8",
    recommendationId: "r8",
    type: "not_for_me",
    isGuestResponse: false,
    createdAt: ago(11 * DAY),
    updatedAt: ago(11 * DAY),
  },
  {
    id: "resp-r9",
    recommendationId: "r9",
    type: "already_knew",
    isGuestResponse: false,
    createdAt: ago(14 * DAY),
    updatedAt: ago(14 * DAY),
  },
  {
    id: "resp-r10",
    recommendationId: "r10",
    type: "not_for_me",
    isGuestResponse: false,
    createdAt: ago(19 * DAY),
    updatedAt: ago(19 * DAY),
  },
  {
    id: "resp-r11",
    recommendationId: "r11",
    type: "put_me_on",
    isGuestResponse: false,
    createdAt: ago(24 * DAY),
    updatedAt: ago(24 * DAY),
  },
];

/** A handful of "known" Spotify track ids the composer can resolve, keyed by
 * the id segment of the pasted URL — everything else degrades gracefully
 * (metadataStatus: "failed"), matching the fetch-failure behavior in
 * docs/V1_SCOPE.md §5 and docs/ARCHITECTURE.md §9. */
export const RESOLVABLE_TRACK_IDS: Record<string, string> = {
  "1abcCarryTheZero": "t-carry-the-zero",
  "2abcDagger": "t-dagger",
  "3abcCleva": "t-cleva",
  "4abcRedbone": "t-redbone",
  "5abcSlowShow": "t-slow-show",
  "6abcMotionPictures": "t-motion-pictures",
};
