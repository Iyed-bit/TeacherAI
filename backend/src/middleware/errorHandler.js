function errorHandler(error, _req, res, _next) {
  console.error(
    "API request failed:",
    error?.status || "unknown status",
    error?.code || error?.type || error?.name || "Error",
  );
  if (error?.status === 413 || error?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "Uploaded files must be 10 MB or smaller." });
  }
  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "The request body must contain valid JSON." });
  }
  return res.status(500).json({ error: "The server could not complete the request." });
}

module.exports = errorHandler;
