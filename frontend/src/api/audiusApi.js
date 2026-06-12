// Audius public API — free, no key, explicitly built for third-party
// streaming apps (https://docs.audius.org). Plain fetch on purpose: the
// axios instance carries our cookies/CSRF headers, which don't belong on
// cross-origin requests.
const APP_NAME = "crm-mini";
const FALLBACK_HOST = "https://api.audius.co";

let hostPromise = null;

// Audius is a network of community nodes; api.audius.co lists the healthy
// ones. Fall back to it directly if discovery fails — it proxies /v1 too.
async function resolveHost() {
  hostPromise ??= (async () => {
    try {
      const res = await fetch(FALLBACK_HOST, { signal: AbortSignal.timeout(8000) });
      const { data } = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data[Math.floor(Math.random() * data.length)];
      }
    } catch {
      // fall through to the gateway
    }
    return FALLBACK_HOST;
  })();
  return hostPromise;
}

export async function getTrendingLofi(limit = 30) {
  const host = await resolveHost();
  const res = await fetch(
    `${host}/v1/tracks/trending?genre=Lo-Fi&limit=${limit}&app_name=${APP_NAME}`,
    { signal: AbortSignal.timeout(15000) }
  );
  if (!res.ok) throw new Error(`Audius responded ${res.status}`);
  const { data } = await res.json();

  return data.map((t) => ({
    id: t.id,
    title: t.title,
    artist: t.user?.name ?? "Unknown artist",
    artwork: t.artwork?.["480x480"] ?? t.artwork?.["150x150"] ?? null,
    permalink: t.permalink ? `https://audius.co${t.permalink}` : "https://audius.co",
    duration: t.duration,
  }));
}

export async function getStreamUrl(trackId) {
  const host = await resolveHost();
  return `${host}/v1/tracks/${trackId}/stream?app_name=${APP_NAME}`;
}

export function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
