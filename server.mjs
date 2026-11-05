// Production server for the PitchLive website (Render runs `npm start`).
//   /          the landing page (landing/)
//   /scores/   the live-scores app (dist/, built with BASE_PATH=/scores/)
//   /api/...   relayed to the API, live-updates WebSocket included, so the session
//              cookie stays first-party exactly as with the Vite dev proxy.
import { createServer, request as httpRequest } from "node:http"
import { request as httpsRequest } from "node:https"
import { connect as netConnect } from "node:net"
import { connect as tlsConnect } from "node:tls"
import { createReadStream, statSync } from "node:fs"
import { extname, join, normalize, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { createGzip } from "node:zlib"

const here = fileURLToPath(new URL(".", import.meta.url))
const PORT = Number(process.env.PORT ?? 3000)
const API = new URL(process.env.API_URL ?? "http://localhost:8787")
const APP_ROOT = join(here, "dist")
const LANDING_ROOT = join(here, "landing")

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
}
const COMPRESSIBLE = new Set([".html", ".js", ".css", ".json", ".svg", ".txt"])

/** Resolves a URL path inside a folder, refusing anything that escapes it. */
function fileIn(root, urlPath) {
  try {
    const file = normalize(join(root, decodeURIComponent(urlPath))).replace(/[\\/]+$/, "")
    if (file !== root && !file.startsWith(root + sep)) return null
    const st = statSync(file)
    return st.isFile() ? { file, size: st.size } : st.isDirectory() ? fileIn(file, "index.html") : null
  } catch {
    return null
  }
}

function sendFile(req, res, { file, size }, { immutable = false } = {}) {
  const ext = extname(file)
  const headers = {
    "content-type": TYPES[ext] ?? "application/octet-stream",
    "cache-control": immutable ? "public, max-age=31536000, immutable" : ext === ".html" ? "no-cache" : "public, max-age=3600",
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
  }
  if (COMPRESSIBLE.has(ext) && /\bgzip\b/.test(req.headers["accept-encoding"] ?? "")) {
    res.writeHead(200, { ...headers, "content-encoding": "gzip", vary: "accept-encoding" })
    if (req.method === "HEAD") return res.end()
    return createReadStream(file).pipe(createGzip()).pipe(res)
  }
  res.writeHead(200, { ...headers, "content-length": size })
  if (req.method === "HEAD") return res.end()
  createReadStream(file).pipe(res)
}

function forwardedHeaders(req) {
  const headers = { ...req.headers, host: API.host }
  const client = req.socket.remoteAddress ?? ""
  headers["x-forwarded-for"] = req.headers["x-forwarded-for"] ? `${req.headers["x-forwarded-for"]}, ${client}` : client
  headers["x-forwarded-proto"] = req.headers["x-forwarded-proto"] ?? "https"
  headers["x-forwarded-host"] = req.headers.host ?? ""
  return headers
}

/** Relays an /api request to the API and streams the answer back unchanged (cookies included). */
function relay(req, res) {
  const send = API.protocol === "https:" ? httpsRequest : httpRequest
  const upstream = send(
    { protocol: API.protocol, hostname: API.hostname, port: API.port || undefined, method: req.method, path: req.url, headers: forwardedHeaders(req), timeout: 90_000 },
    (answer) => {
      res.writeHead(answer.statusCode ?? 502, answer.headers)
      answer.pipe(res)
    },
  )
  upstream.on("timeout", () => upstream.destroy(new Error("timeout")))
  upstream.on("error", () => {
    if (!res.headersSent) res.writeHead(502, { "content-type": "application/json" })
    res.end(JSON.stringify({ error: "The PitchLive service is waking up. Try again in a moment." }))
  })
  req.pipe(upstream)
}

const server = createServer((req, res) => {
  const path = new URL(req.url ?? "/", "http://x").pathname
  if (path === "/healthz") return res.writeHead(200, { "content-type": "text/plain" }).end("ok")
  if (path.startsWith("/api/")) return relay(req, res)
  if (req.method !== "GET" && req.method !== "HEAD") return res.writeHead(405).end()

  if (path === "/scores") return res.writeHead(301, { location: "/scores/" + (req.url?.split("?")[1] ? "?" + req.url.split("?")[1] : "") }).end()
  if (path.startsWith("/scores/")) {
    const rest = path.slice("/scores".length)
    const found = fileIn(APP_ROOT, rest)
    if (found) return sendFile(req, res, found, { immutable: rest.startsWith("/assets/") })
    // A missing hashed asset is a real 404; anything else is the app itself.
    if (rest.startsWith("/assets/")) return res.writeHead(404).end("Not found")
    return sendFile(req, res, fileIn(APP_ROOT, "/index.html"))
  }

  const found = fileIn(LANDING_ROOT, path)
  if (found) return sendFile(req, res, found)
  res.writeHead(302, { location: "/" }).end()
})

// Live updates: hand the WebSocket upgrade straight through to the API.
server.on("upgrade", (req, socket, head) => {
  if (!req.url?.startsWith("/api/")) return socket.destroy()
  const secure = API.protocol === "https:"
  const port = Number(API.port || (secure ? 443 : 80))
  const upstream = secure ? tlsConnect({ host: API.hostname, port, servername: API.hostname }) : netConnect({ host: API.hostname, port })
  upstream.once(secure ? "secureConnect" : "connect", () => {
    const headers = forwardedHeaders(req)
    const lines = [`${req.method} ${req.url} HTTP/1.1`, ...Object.entries(headers).flatMap(([k, v]) => (Array.isArray(v) ? v.map((x) => `${k}: ${x}`) : v == null ? [] : [`${k}: ${v}`]))]
    upstream.write(lines.join("\r\n") + "\r\n\r\n")
    if (head?.length) upstream.write(head)
    upstream.pipe(socket)
    socket.pipe(upstream)
  })
  const close = () => {
    upstream.destroy()
    socket.destroy()
  }
  upstream.on("error", close)
  socket.on("error", close)
  upstream.on("close", close)
  socket.on("close", close)
})

server.listen(PORT, () => console.log(`PitchLive website on :${PORT}, API ${API.origin}`))
