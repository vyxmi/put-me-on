"use server";

// Real Spotify metadata without any API credentials: open.spotify.com's own
// track pages carry accurate OpenGraph tags (title, "artist · album · Song ·
// year", and a real cover image URL from Spotify's CDN). We only ever fetch
// a URL we've constructed ourselves from a regex-validated track id against
// open.spotify.com — never an arbitrary user-supplied URL — so this stays
// within the "only fetch from allowlisted provider domains" requirement in
// docs/V1_SCOPE.md §15, even though it's page-scraping rather than the
// Client Credentials Web API docs/ARCHITECTURE.md §9 originally proposed.
// If SPOTIFY_CLIENT_ID/SECRET ever get added, swap this for the real API —
// same call site, same return shape.

export interface SpotifyTrackMetadata {
  title: string;
  artist: string;
  album?: string;
  artworkUrl: string;
}

const ENTITY_MAP: Record<string, string> = {
  "&amp;": "&",
  "&#x27;": "'",
  "&#39;": "'",
  "&quot;": '"',
  "&lt;": "<",
  "&gt;": ">",
};

function decodeEntities(input: string): string {
  return input.replace(/&(amp|#x27|#39|quot|lt|gt);/g, (m) => ENTITY_MAP[m] ?? m);
}

function extractMeta(html: string, property: string): string | undefined {
  const match = html.match(new RegExp(`<meta property="og:${property}" content="([^"]*)"`));
  return match ? decodeEntities(match[1]) : undefined;
}

export async function fetchSpotifyTrackMetadata(trackId: string): Promise<SpotifyTrackMetadata | null> {
  if (!/^[A-Za-z0-9]+$/.test(trackId)) return null;

  try {
    const res = await fetch(`https://open.spotify.com/track/${trackId}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PutMeOnLinkPreview/1.0)" },
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (!res.ok) return null;

    const html = await res.text();
    const title = extractMeta(html, "title");
    const artworkUrl = extractMeta(html, "image");
    const description = extractMeta(html, "description");
    if (!title || !artworkUrl) return null;

    // Pattern is consistently "Artist · Album · Song · Year"
    const parts = description ? description.split(" · ") : [];
    const artist = parts[0];
    const album = parts.length >= 3 && parts[parts.length - 2] === "Song" ? parts.slice(1, -2).join(" · ") : undefined;

    return { title, artist: artist || "unknown artist", album: album || undefined, artworkUrl };
  } catch {
    return null;
  }
}
