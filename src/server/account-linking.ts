export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export type GoogleLinkDecision =
  | { action: "create" }
  | { action: "link"; userId: string }
  | { action: "reuse"; userId: string }
  | { action: "reject"; reason: "unverified_google" | "email_mismatch" };

export function decideGoogleAccountLink(input: {
  googleEmail: string;
  googleEmailVerified: boolean;
  existingUser: { id: string; email: string; emailVerified: boolean } | null;
  existingGoogleAccount: boolean;
}): GoogleLinkDecision {
  if (!input.googleEmailVerified) return { action: "reject", reason: "unverified_google" };
  const googleEmail = normalizeEmail(input.googleEmail);
  if (!input.existingUser) return { action: "create" };
  if (normalizeEmail(input.existingUser.email) !== googleEmail) {
    return { action: "reject", reason: "email_mismatch" };
  }
  if (input.existingGoogleAccount) return { action: "reuse", userId: input.existingUser.id };
  return { action: "link", userId: input.existingUser.id };
}
