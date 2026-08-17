export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h`;
  if (diffMs < 30 * day) return `${Math.floor(diffMs / day)}d`;
  if (diffMs < 365 * day) return `${Math.floor(diffMs / (30 * day))}mo`;
  return `${Math.floor(diffMs / (365 * day))}y`;
}

export function formatDuration(ms?: number): string | null {
  if (!ms) return null;
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

let counter = 0;
export function generateId(prefix: string): string {
  counter += 1;
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}${random}${counter}`;
}

/** URL-safe unguessable-looking slug for /r/[id] links — mirrors the intent
 * of recommendations.public_id in docs/ARCHITECTURE.md §5/§10 (decoupled,
 * random, never sequential) without needing a real backend yet. */
export function generatePublicId(): string {
  const bytes = new Uint8Array(10);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 14);
}

const SPOTIFY_TRACK_RE = /open\.spotify\.com\/track\/([a-zA-Z0-9]+)/;

/** Validates + extracts the track id from a pasted Spotify URL, stripping
 * tracking query params, per docs/USER_FLOWS.md §12 and
 * docs/ARCHITECTURE.md §9. Returns null for anything that isn't a
 * recognizable track URL. */
export function parseSpotifyTrackUrl(input: string): { trackId: string; normalizedUrl: string } | null {
  const trimmed = input.trim();
  const match = trimmed.match(SPOTIFY_TRACK_RE);
  if (!match) return null;
  const trackId = match[1];
  return { trackId, normalizedUrl: `https://open.spotify.com/track/${trackId}` };
}
