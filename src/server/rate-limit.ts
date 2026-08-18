export type RateLimitResult = { ok: true } | { ok: false; retryAfter: number };

export class MemoryRateLimiter {
  private hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  consume(key: string, now = Date.now()): RateLimitResult {
    const start = now - this.windowMs;
    const recent = (this.hits.get(key) ?? []).filter((stamp) => stamp > start);
    if (recent.length >= this.limit) {
      const retryAfter = Math.ceil((recent[0] + this.windowMs - now) / 1000);
      this.hits.set(key, recent);
      return { ok: false, retryAfter: Math.max(retryAfter, 1) };
    }
    recent.push(now);
    this.hits.set(key, recent);
    return { ok: true };
  }
}

export const authLimiter = new MemoryRateLimiter(8, 60_000);
export const sensitiveLimiter = new MemoryRateLimiter(20, 60_000);
