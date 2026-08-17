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

// Real tracks, real Spotify IDs, real cover art — fetched once via
// src/lib/spotify/resolve-track.ts and hardcoded here so the seeded demo
// data works offline. Pasting any of these exact links in the composer
// will cache-hit this record instead of re-fetching (see
// store.tsx#resolveTrack); any other Spotify track link goes to the real
// network fetch.
export const tracks: Track[] = [
  {
    id: "t-carry-the-zero",
    provider: "spotify",
    sourceUrl: "https://open.spotify.com/track/3HMOMdRPywfouYx5B4PvaH",
    title: "Carry the Zero",
    artist: "Built To Spill",
    album: "Keep It like a Secret",
    artworkUrl: "https://i.scdn.co/image/ab67616d0000b2730c8cece24badfb7bfce2f38d",
    artSeed: "carry-the-zero",
    metadataStatus: "ok",
  },
  {
    id: "t-dagger",
    provider: "spotify",
    sourceUrl: "https://open.spotify.com/track/5p0ZJLF1ZmL2WNJ2ky8VVb",
    title: "Dagger",
    artist: "Slowdive",
    album: "Souvlaki",
    artworkUrl: "https://i.scdn.co/image/ab67616d0000b27353da07db25e2543cce38abfe",
    artSeed: "dagger",
    metadataStatus: "ok",
  },
  {
    id: "t-cleva",
    provider: "spotify",
    sourceUrl: "https://open.spotify.com/track/1GoTvQP3JEeA8oh5I9b2xc",
    title: "Cleva",
    artist: "Erykah Badu, Roy Ayers",
    album: "Mama's Gun",
    artworkUrl: "https://i.scdn.co/image/ab67616d0000b2730d934cb462fae5a26f829efb",
    artSeed: "cleva",
    metadataStatus: "ok",
  },
  {
    id: "t-redbone",
    provider: "spotify",
    sourceUrl: "https://open.spotify.com/track/3vQ4T78TTMOjQXGfXVKQJo",
    title: "Redbone",
    artist: "Childish Gambino",
    album: "Awaken, My Love!",
    artworkUrl: "https://i.scdn.co/image/ab67616d0000b2731c29562d6e8c1f55bb1311d5",
    artSeed: "redbone",
    metadataStatus: "ok",
  },
  {
    id: "t-slow-show",
    provider: "spotify",
    sourceUrl: "https://open.spotify.com/track/7s97wgRDIbCJwuD46ySBYs",
    title: "Slow Show",
    artist: "The National",
    album: "Boxer",
    artworkUrl: "https://i.scdn.co/image/ab67616d0000b273815d0d5cf4f0167ee18367d9",
    artSeed: "slow-show",
    metadataStatus: "ok",
  },
  {
    id: "t-motion-pictures",
    provider: "spotify",
    sourceUrl: "https://open.spotify.com/track/2g2dBiugZROCtl8ipW9NQo",
    title: "Moya",
    artist: "Godspeed You! Black Emperor",
    album: "Slow Riot for New Zero Kanada",
    artworkUrl: "https://i.scdn.co/image/ab67616d0000b2737f29e53fb8365b595fe94042",
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
