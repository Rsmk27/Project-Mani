const defaultAllowedOrigins = [
  "https://rsmk.tech",
  "https://rsmk.me",
  "https://rsmk.co.in",
  "https://zestacademy.tech",
  "https://zestfolio.zestacademy.tech",
  "https://compilers.zestacademy.tech",
];

function getAllowedOrigins() {
  const envOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
        .map((o) => o.trim())
        .filter(Boolean)
    : [];
  return Array.from(new Set([...defaultAllowedOrigins, ...envOrigins]));
}

function isOriginAllowed(origin) {
  // Allow server-to-server, mobile app, or curl requests without origin header
  if (!origin) return true;

  try {
    const parsed = new URL(origin);
    const hostname = parsed.hostname;
    const allowed = getAllowedOrigins();

    if (allowed.includes(origin)) {
      return true;
    }

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return true;
    }

    if (
      hostname === "rsmk.tech" ||
      hostname.endsWith(".rsmk.tech") ||
      hostname === "rsmk.me" ||
      hostname.endsWith(".rsmk.me") ||
      hostname === "rsmk.co.in" ||
      hostname.endsWith(".rsmk.co.in")
    ) {
      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
}

module.exports = {
  defaultAllowedOrigins,
  getAllowedOrigins,
  isOriginAllowed,
};
