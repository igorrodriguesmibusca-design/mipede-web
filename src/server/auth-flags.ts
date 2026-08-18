export function isEmailPasswordAuthEnabled(value = process.env.MIPEDE_EMAIL_PASSWORD_AUTH_ENABLED): boolean {
  return value === "1";
}

export function isGoogleAuthEnabled(value = process.env.MIPEDE_GOOGLE_AUTH_ENABLED): boolean {
  return value !== "0";
}

export const PASSWORD_AUTH_UNAVAILABLE = "auth_method_unavailable";

export const BETTER_AUTH_PASSWORD_PATHS = [
  "/api/mipede/auth/sign-up/email",
  "/api/mipede/auth/sign-in/email",
  "/api/mipede/auth/forget-password",
  "/api/mipede/auth/request-password-reset",
  "/api/mipede/auth/reset-password",
  "/api/mipede/auth/send-verification-email",
] as const;

export function isPasswordAuthPath(pathname: string): boolean {
  return (BETTER_AUTH_PASSWORD_PATHS as readonly string[]).includes(pathname);
}
