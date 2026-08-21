import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import app from "../dist/server/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist/client");
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
};

const assets = {
  async fetch(request) {
    const pathname = new URL(request.url).pathname;
    const relative = decodeURIComponent(pathname).replace(/^\/+/, "");
    const file = path.resolve(root, relative);
    if (!file.startsWith(`${root}${path.sep}`)) return new Response("Not found", { status: 404 });

    try {
      const body = await readFile(file);
      return new Response(body, {
        headers: { "Content-Type": types[path.extname(file)] ?? "application/octet-stream" },
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  },
};

async function readBody(request) {
  if (request.method === "GET" || request.method === "HEAD") return undefined;
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default async function handler(request, response) {
  const url = new URL(request.url, `https://${request.headers.host}`);
  const body = await readBody(request);
  const webRequest = new Request(url, {
    method: request.method,
    headers: request.headers,
    body,
  });
  const webResponse = await app.fetch(webRequest, { ASSETS: assets }, { waitUntil() {} });

  response.statusCode = webResponse.status;
  webResponse.headers.forEach((value, key) => response.setHeader(key, value));
  response.end(Buffer.from(await webResponse.arrayBuffer()));
}
