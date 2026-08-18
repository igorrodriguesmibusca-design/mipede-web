import { describe, expect, it } from "vitest";

import { isAllowedBffPath, timingSafeEqual } from "./bff";

describe("BFF allowlist", () => {
  it("aceita somente auth e v1", () => {
    expect(isAllowedBffPath(["auth", "sign-in", "email"])).toBe(true);
    expect(isAllowedBffPath(["v1", "register"])).toBe(true);
    expect(isAllowedBffPath(["health"])).toBe(false);
    expect(isAllowedBffPath(["v1", "..", "secrets"])).toBe(false);
    expect(isAllowedBffPath(["https:", "", "evil.test"])).toBe(false);
    expect(isAllowedBffPath([])).toBe(false);
  });
});

describe("comparação segura", () => {
  it("não aceita segredo diferente", () => {
    expect(timingSafeEqual("abc", "abc")).toBe(true);
    expect(timingSafeEqual("abc", "abC")).toBe(false);
    expect(timingSafeEqual("abc", "ab")).toBe(false);
  });
});
