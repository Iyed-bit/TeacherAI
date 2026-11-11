const allowedOrigins = (process.env.FRONTEND_ORIGINS || "http://127.0.0.1:5500,http://localhost:5500")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

module.exports = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    try {
      const { hostname, protocol } = new URL(origin);
      const isLocalDevelopmentOrigin = protocol === "http:"
        && ["localhost", "127.0.0.1", "[::1]"].includes(hostname);
      return callback(null, isLocalDevelopmentOrigin);
    } catch {
      return callback(null, false);
    }
  },
};
