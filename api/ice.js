/* /api/ice — returns ICE server config for WebRTC
   Uses Cloudflare TURN (free, no auth needed) + Google STUN
   Can be extended with Metered.ca or Twilio if needed
*/
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(200).end();

  const iceServers = [
    // Google STUN — most reliable
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    // Cloudflare STUN
    { urls: "stun:stun.cloudflare.com:3478" },
    // Twilio global STUN
    { urls: "stun:global.stun.twilio.com:3478" },
    // Cloudflare TURN — free, no credentials, works globally
    {
      urls: "turn:turn.cloudflare.com:3478?transport=udp",
      username: "free",
      credential: "free",
    },
    {
      urls: "turn:turn.cloudflare.com:3478?transport=tcp",
      username: "free",
      credential: "free",
    },
    {
      urls: "turns:turn.cloudflare.com:5349?transport=tcp",
      username: "free",
      credential: "free",
    },
    // Metered.ca free fallback
    {
      urls: "turn:a.relay.metered.ca:80",
      username: "e8dd65f0519f5f5d89a714d7",
      credential: "uBOTxVrFuPqO+3DP",
    },
    {
      urls: "turn:a.relay.metered.ca:80?transport=tcp",
      username: "e8dd65f0519f5f5d89a714d7",
      credential: "uBOTxVrFuPqO+3DP",
    },
    {
      urls: "turn:a.relay.metered.ca:443",
      username: "e8dd65f0519f5f5d89a714d7",
      credential: "uBOTxVrFuPqO+3DP",
    },
    {
      urls: "turns:a.relay.metered.ca:443?transport=tcp",
      username: "e8dd65f0519f5f5d89a714d7",
      credential: "uBOTxVrFuPqO+3DP",
    },
  ];

  return res.status(200).json({ iceServers });
};
