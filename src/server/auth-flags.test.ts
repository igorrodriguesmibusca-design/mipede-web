import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { isEmailPasswordAuthEnabled, isGoogleAuthEnabled, isPasswordAuthPath, PASSWORD_AUTH_UNAVAILABLE } from "./auth-flags";

describe("métodos de autenticação", () => {
  it("desliga e-mail e senha por padrão", () => {
    expect(isEmailPasswordAuthEnabled(undefined)).toBe(false);
    expect(isEmailPasswordAuthEnabled("0")).toBe(false);
    expect(isEmailPasswordAuthEnabled("1")).toBe(true);
  });

  it("mantém Google ligado salvo desligamento explícito", () => {
    expect(isGoogleAuthEnabled(undefined)).toBe(true);
    expect(isGoogleAuthEnabled("1")).toBe(true);
    expect(isGoogleAuthEnabled("0")).toBe(false);
  });

  it("reconhece rotas de senha do Better Auth", () => {
    expect(isPasswordAuthPath("/api/mipede/auth/sign-in/email")).toBe(true);
    expect(isPasswordAuthPath("/api/mipede/auth/sign-in/social")).toBe(false);
    expect(PASSWORD_AUTH_UNAVAILABLE).toBe("auth_method_unavailable");
  });

  it("não desliga a checagem de state cookie", () => {
    const worker = readFileSync(resolve(import.meta.dirname, "../../workers/control-api/src/index.ts"), "utf8");
    expect(worker.includes("skipStateCookieCheck")).toBe(false);
  });
});
