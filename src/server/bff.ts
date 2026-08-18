export const BFF_ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] as const;

export const BFF_MAX_BODY_BYTES = 64 * 1024;
export const BFF_TIMEOUT_MS = 15_000;
export const BFF_SECRET_HEADER = "x-mipede-bff-secret";

const PATH_SEGMENT = /^[a-zA-Z0-9._-]+$/;

export function isAllowedBffPath(segments: string[]): boolean {
  if (segments.length === 0 || segments.length > 8) return false;
  if (segments.some((item) => item === "" || item === "." || item === ".." || !PATH_SEGMENT.test(item))) {
    return false;
  }
  return segments[0] === "auth" || segments[0] === "v1";
}

export function timingSafeEqual(left: string, right: string): boolean {
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  const length = Math.max(a.length, b.length);
  let diff = a.length === b.length ? 0 : 1;
  for (let index = 0; index < length; index += 1) {
    diff |= (a[index] ?? 0) ^ (b[index] ?? 0);
  }
  return diff === 0;
}

export function bffSharedSecret(): string | null {
  const value = process.env.MIPEDE_BFF_SHARED_SECRET?.trim();
  return value || null;
}

export function turnstileSiteKey(): string | null {
  const value = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  return value || null;
}
