import { describe, expect, it } from "vitest";

import { MemoryRateLimiter } from "./rate-limit";

describe("rate limit", () => {
  it("bloqueia excesso de tentativas", () => {
    const limiter = new MemoryRateLimiter(3, 60_000);
    expect(limiter.consume("login:1").ok).toBe(true);
    expect(limiter.consume("login:1").ok).toBe(true);
    expect(limiter.consume("login:1").ok).toBe(true);
    const blocked = limiter.consume("login:1");
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.retryAfter).toBeGreaterThan(0);
  });
});
