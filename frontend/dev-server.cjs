const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const root = __dirname;
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    res.writeHead(400).end("Bad request");
    return;
  }

  const filePath = path.resolve(root, `.${pathname}`);
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError) {
      res.writeHead(statError.code === "ENOENT" ? 404 : 500).end("File unavailable");
      return;
    }

    const target = stats.isDirectory() ? path.join(filePath, "index.html") : filePath;
    fs.readFile(target, (readError, contents) => {
      if (readError) {
        res.writeHead(readError.code === "ENOENT" ? 404 : 500).end("File unavailable");
        return;
      }

      res.writeHead(200, {
        "Content-Type": mimeTypes[path.extname(target).toLowerCase()] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
      });
      res.end(req.method === "HEAD" ? undefined : contents);
    });
  });
});

server.listen(5500, "127.0.0.1", () => {
  console.log("TeacherAI frontend listening on http://127.0.0.1:5500");
});
