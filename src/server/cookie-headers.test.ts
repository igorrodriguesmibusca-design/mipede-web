import { describe, expect, it } from "vitest";

import {
  appendSetCookies,
  cookieNamesFromSetCookie,
  oauthQueryFlags,
  readSetCookies,
  splitSetCookieHeader,
} from "./cookie-headers";

describe("Set-Cookie", () => {
  it("não combina múltiplos cookies em uma string", () => {
    const headers = new Headers();
    appendSetCookies(headers, [
      "__Secure-better-auth.state=abc; Path=/; HttpOnly; Secure; SameSite=Lax",
      "mipede_terms_intent=x; Path=/; HttpOnly; Secure; SameSite=Lax",
    ]);
    const cookies = readSetCookies(headers);
    expect(cookies).toHaveLength(2);
    expect(cookies[0]?.startsWith("__Secure-better-auth.state=")).toBe(true);
    expect(cookies[1]?.startsWith("mipede_terms_intent=")).toBe(true);
    expect(headers.get("set-cookie")?.includes("state=abc, mipede_terms")).toBe(false);
  });

  it("separa um header combinado sem quebrar expires", () => {
    const combined =
      "__Secure-better-auth.state=one; Path=/; Expires=Wed, 21 Oct 2026 07:28:00 GMT, mipede_terms_intent=two; Path=/";
    const cookies = splitSetCookieHeader(combined);
    expect(cookies).toHaveLength(2);
    expect(cookieNamesFromSetCookie(cookies)).toEqual([
      "__Secure-better-auth.state",
      "mipede_terms_intent",
    ]);
  });

  it("preserva code e state na query", () => {
    expect(oauthQueryFlags("?code=abc&state=xyz")).toEqual({ hasState: true, hasCode: true });
    expect(oauthQueryFlags("?error=access_denied")).toEqual({ hasState: false, hasCode: false });
  });

  it("callback reutilizado sem cookie de state é detectável como ausência", () => {
    const headers = new Headers();
    expect(headers.get("cookie")).toBeNull();
    expect(oauthQueryFlags("?code=old&state=old")).toEqual({ hasState: true, hasCode: true });
  });
});
