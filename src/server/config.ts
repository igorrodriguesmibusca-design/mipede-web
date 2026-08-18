export function allowVisualDemo(): boolean {
  if (process.env.MIPEDE_ALLOW_DEMO === "1") return true;
  if (process.env.MIPEDE_ALLOW_DEMO === "0") return false;
  return process.env.NODE_ENV !== "production";
}

export function controlApiUrl(): string | null {
  const value = process.env.MIPEDE_CONTROL_API_URL?.trim();
  return value ? value.replace(/\/$/, "") : null;
}

export const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
] as const;
