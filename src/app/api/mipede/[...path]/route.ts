import { BFF_ALLOWED_METHODS, BFF_MAX_BODY_BYTES, BFF_SECRET_HEADER, BFF_TIMEOUT_MS, bffSharedSecret, isAllowedBffPath } from "@/server/bff";
import { appendSetCookies, cookieHeaderPresent, oauthQueryFlags, readSetCookies } from "@/server/cookie-headers";
import { controlApiUrl } from "@/server/config";

export const dynamic = "force-dynamic";

const STRIP_REQUEST = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
  BFF_SECRET_HEADER,
  "x-forwarded-host",
  "x-forwarded-for",
  "forwarded",
]);

const STRIP_RESPONSE = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "content-encoding",
]);

function methodAllowed(method: string): boolean {
  return (BFF_ALLOWED_METHODS as readonly string[]).includes(method);
}

function genericUnavailable() {
  return Response.json({ error: "control_api_unavailable" }, { status: 503 });
}

async function proxy(request: Request, context: { params: Promise<{ path: string[] }> }) {
  if (!methodAllowed(request.method)) {
    return Response.json({ error: "method_not_allowed" }, { status: 405 });
  }

  const base = controlApiUrl();
  const shared = bffSharedSecret();
  if (!base || !shared) return genericUnavailable();

  if (!URL.canParse(base)) return genericUnavailable();
  if (!base.startsWith("https://") && !(process.env.NODE_ENV !== "production" && base.startsWith("http://localhost"))) {
    return genericUnavailable();
  }

  const { path } = await context.params;
  if (!isAllowedBffPath(path)) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const incoming = new URL(request.url);
  const pathname = `/api/mipede/${path.join("/")}`;
  const target = `${base.replace(/\/$/, "")}${pathname}${incoming.search}`;
  if (!target.startsWith(`${base.replace(/\/$/, "")}/api/mipede/`)) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const flags = oauthQueryFlags(incoming.search);
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!STRIP_REQUEST.has(key.toLowerCase())) headers.set(key, value);
  });
  headers.set(BFF_SECRET_HEADER, shared);
  headers.set("x-forwarded-host", incoming.host);
  headers.set("x-forwarded-proto", incoming.protocol.replace(":", ""));
  headers.set("x-mipede-public-origin", `${incoming.protocol}//${incoming.host}`);

  let body: ArrayBuffer | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.arrayBuffer();
    if (body.byteLength > BFF_MAX_BODY_BYTES) {
      return Response.json({ error: "payload_too_large" }, { status: 413 });
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BFF_TIMEOUT_MS);

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
      signal: controller.signal,
    });
  } catch {
    return genericUnavailable();
  } finally {
    clearTimeout(timer);
  }

  const outgoing = new Headers();
  upstream.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") return;
    if (!STRIP_RESPONSE.has(key.toLowerCase())) outgoing.set(key, value);
  });

  const cookies = readSetCookies(upstream.headers);
  appendSetCookies(outgoing, cookies);

  if (pathname.startsWith("/api/mipede/auth/")) {
    outgoing.set(
      "x-mipede-oauth-trace",
      [
        `env=${process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown"}`,
        `cookie=${cookieHeaderPresent(request.headers) ? "1" : "0"}`,
        `set-cookie=${cookies.length}`,
        `state=${flags.hasState ? "1" : "0"}`,
        `code=${flags.hasCode ? "1" : "0"}`,
      ].join(";"),
    );
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: outgoing,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;
