import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist", "judge-site");
const host = "127.0.0.1";
const port = Number.parseInt(process.env.PORT ?? "4173", 10);
if (!Number.isInteger(port) || port < 1 || port > 65_535) throw new Error("PORT must be an integer from 1 to 65535");

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
]);

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${host}:${port}`);
    const decodedPath = decodeURIComponent(url.pathname);
    let filePath = path.resolve(root, `.${decodedPath}`);
    if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
      response.writeHead(400).end("Invalid path");
      return;
    }
    let info = await stat(filePath).catch(() => null);
    if (info?.isDirectory()) {
      filePath = path.join(filePath, "index.html");
      info = await stat(filePath).catch(() => null);
    }
    if (!info?.isFile()) {
      response.writeHead(404).end("Not found");
      return;
    }
    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": contentTypes.get(extension) ?? "application/octet-stream",
      "Cache-Control": extension === ".html" || path.basename(filePath) === "site-metadata.json" ? "no-store" : "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(400).end("Bad request");
  }
});

server.listen(port, host, () => {
  console.log(`CoDesign judge site: http://${host}:${port}/`);
});
