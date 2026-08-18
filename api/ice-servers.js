/* ── /api/ice-servers
   Returns a list of ICE servers (STUN + TURN) for WebRTC.
   TURN credentials are fetched fresh from Metered.ca on each request
   so they are never stale or expired.

   GET /api/ice-servers → { iceServers: [...] }
*/

const METERED_API_KEY = process.env.METERED_API_KEY;
const METERED_DOMAIN  = process.env.METERED_DOMAIN || "dharya.metered.live";

/* Fallback static servers used when METERED_API_KEY is not set */
const STATIC_ICE = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun.cloudflare.com:3478" },
  { urls: "stun:stun.relay.metered.ca:80" },
  {
    urls: "turn:global.relay.metered.ca:80",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  {
    urls: "turn:global.relay.metered.ca:80?transport=tcp",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  {
    urls: "turn:global.relay.metered.ca:443",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  {
    urls: "turns:global.relay.metered.ca:443?transport=tcp",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
];

async function fetchMeteredServers() {
  const url = `https://${METERED_DOMAIN}/api/v1/turn/credentials?apiKey=${METERED_API_KEY}`;
  const res  = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Metered API ${res.status}`);
  const servers = await res.json(); // array of { urls, username, credential }
  // Prepend Google STUN so local/LAN connections still use the fast path
  return [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun.cloudflare.com:3478" },
    ...servers,
  ];
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  // Short cache — TURN credentials are valid for hours, but we refresh each call
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")     return res.status(405).json({ error: "Method not allowed" });

  try {
    if (METERED_API_KEY) {
      const iceServers = await fetchMeteredServers();
      return res.status(200).json({ iceServers });
    }
    // No API key configured — return static fallback
    console.warn("METERED_API_KEY not set, using static fallback ICE servers");
    return res.status(200).json({ iceServers: STATIC_ICE });
  } catch (e) {
    console.error("ice-servers:", e.message);
    // Always return something usable even if Metered is down
    return res.status(200).json({ iceServers: STATIC_ICE });
  }
};
