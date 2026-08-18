import type { PlatformRole } from "./roles";

export type PlatformAdminRecord = {
  userId: string;
  role: PlatformRole;
  status: "active" | "suspended";
};

export type PlatformAction =
  | "access_panel"
  | "manage_stores"
  | "view_audit"
  | "invite_admin"
  | "suspend_admin"
  | "remove_admin"
  | "bootstrap";

export function canPerformPlatformAction(
  actor: PlatformAdminRecord | null,
  action: PlatformAction,
  target?: { role?: PlatformRole; userId?: string; isLastOwner?: boolean },
): { ok: true } | { ok: false; status: 401 | 403; error: string } {
  if (!actor) return { ok: false, status: 401, error: "unauthenticated" };
  if (actor.status !== "active") return { ok: false, status: 403, error: "suspended" };

  if (action === "access_panel" || action === "manage_stores" || action === "view_audit") {
    return { ok: true };
  }

  if (action === "invite_admin" || action === "suspend_admin" || action === "remove_admin") {
    if (actor.role !== "platform_owner") return { ok: false, status: 403, error: "forbidden" };
    if (action === "remove_admin" && target?.isLastOwner && target.role === "platform_owner") {
      return { ok: false, status: 403, error: "last_owner" };
    }
    if (target?.role === "platform_owner") return { ok: false, status: 403, error: "forbidden" };
    return { ok: true };
  }

  return { ok: false, status: 403, error: "forbidden" };
}

export function canBootstrapOwner(input: {
  hasOwner: boolean;
  emailVerified: boolean;
  sessionEmail: string;
  allowlist: string[];
}): { ok: true } | { ok: false; error: string } {
  if (input.hasOwner) return { ok: false, error: "already_bootstrapped" };
  if (!input.emailVerified) return { ok: false, error: "email_unverified" };
  const allowed = input.allowlist.map((item) => item.trim().toLowerCase()).filter(Boolean);
  if (!allowed.includes(input.sessionEmail.trim().toLowerCase())) return { ok: false, error: "forbidden" };
  return { ok: true };
}

export function canAcceptInvite(input: {
  inviteStatus: "pending" | "accepted" | "expired" | "revoked";
  expiresAt: number;
  inviteEmailHash: string;
  sessionEmailHash: string;
  googleVerified: boolean;
  now?: number;
}): { ok: true } | { ok: false; error: string } {
  if (!input.googleVerified) return { ok: false, error: "email_unverified" };
  if (input.inviteStatus === "revoked") return { ok: false, error: "revoked" };
  if (input.inviteStatus === "accepted") return { ok: false, error: "reused" };
  if (input.inviteStatus !== "pending") return { ok: false, error: "invalid_invite" };
  if ((input.now ?? Date.now()) > input.expiresAt) return { ok: false, error: "expired" };
  if (input.inviteEmailHash !== input.sessionEmailHash) return { ok: false, error: "email_mismatch" };
  return { ok: true };
}

export function storeStatusAfterDecision(action: "approve" | "reject" | "suspend" | "reactivate"): string {
  if (action === "approve") return "ACTIVE";
  if (action === "reject") return "REJECTED";
  if (action === "suspend") return "SUSPENDED";
  return "ACTIVE";
}

export function auditActionForStore(action: "approve" | "reject" | "suspend" | "reactivate"): string {
  return `store_${action === "approve" ? "approved" : action === "reject" ? "rejected" : action === "suspend" ? "suspended" : "reactivated"}`;
}
