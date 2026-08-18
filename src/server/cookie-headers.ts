/** Split and re-attach Set-Cookie without joining multiple cookies into one header. */

export function readSetCookies(headers: Headers): string[] {
  const fromApi = headers.getSetCookie?.() ?? [];
  if (fromApi.length > 0) return fromApi.filter(Boolean);
  const raw = headers.get("set-cookie");
  if (!raw) return [];
  return splitSetCookieHeader(raw);
}

export function splitSetCookieHeader(value: string): string[] {
  const cookies: string[] = [];
  let start = 0;
  let index = 0;
  while (index < value.length) {
    if (value[index] === ",") {
      const slice = value.slice(start, index);
      const next = value.slice(index + 1).trimStart();
      if (/^[A-Za-z0-9_\-.]+=/.test(next)) {
        cookies.push(slice.trim());
        start = index + 1;
      }
    }
    index += 1;
  }
  const last = value.slice(start).trim();
  if (last) cookies.push(last);
  return cookies.filter(Boolean);
}

export function appendSetCookies(target: Headers, cookies: string[]): void {
  for (const cookie of cookies) {
    if (cookie) target.append("set-cookie", cookie);
  }
}

export function cookieHeaderPresent(headers: Headers): boolean {
  return Boolean(headers.get("cookie"));
}

export function oauthQueryFlags(search: string): { hasState: boolean; hasCode: boolean } {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  return {
    hasState: params.has("state") && Boolean(params.get("state")),
    hasCode: params.has("code") && Boolean(params.get("code")),
  };
}

export function cookieNamesFromSetCookie(cookies: string[]): string[] {
  return cookies
    .map((item) => item.split("=", 1)[0]?.trim() ?? "")
    .filter(Boolean);
}
