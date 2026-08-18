import { controlApiUrl } from "@/server/config";

export const dynamic = "force-dynamic";

const HOP_BY_HOP = new Set([
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
]);

async function proxy(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const base = controlApiUrl();
  if (!base) {
    return Response.json(
      {
        error: "control_api_unconfigured",
        message:
          "A API de controle ainda não está configurada. Defina MIPEDE_CONTROL_API_URL e os secrets do Worker.",
      },
      { status: 503 },
    );
  }

  const { path } = await context.params;
  const incoming = new URL(request.url);
  const target = `${base}/api/mipede/${path.join("/")}${incoming.search}`;
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch {
    return Response.json(
      { error: "control_api_unreachable", message: "Não foi possível contactar o Worker de controle." },
      { status: 503 },
    );
  }

  const outgoing = new Headers();
  upstream.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") return;
    if (!HOP_BY_HOP.has(key.toLowerCase())) outgoing.set(key, value);
  });

  const response = new Response(upstream.body, {
    status: upstream.status,
    headers: outgoing,
  });

  const getSetCookie = upstream.headers.getSetCookie?.bind(upstream.headers);
  const cookies = getSetCookie ? getSetCookie() : [];
  for (const cookie of cookies) {
    response.headers.append("set-cookie", cookie);
  }

  return response;
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
