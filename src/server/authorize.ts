import {
  canAccessPlatform,
  canSeeFinance,
  canTransferOwnership,
  resolveAuthorizedStore,
  type AuthContext,
  type StoreRole,
} from "./roles";

export type AccessDecision =
  | { ok: true; store: AuthContext["memberships"][number]; platform: boolean }
  | { ok: false; status: 401 | 403 | 404; error: string };

const FINANCE_ACTIONS = new Set(["view_finance", "view_performance", "manage_billing"]);
const OWNER_ACTIONS = new Set(["transfer_ownership", "delete_organization"]);

export function authorizeStoreAccess(
  context: AuthContext | null,
  requested: { storeId?: string; organizationId?: string; slug?: string },
  action: "view" | "operate" | "manage" | "view_finance" | "view_performance" | "manage_billing" | "transfer_ownership" | "delete_organization" | "manage_team" = "view",
): AccessDecision {
  if (!context) return { ok: false, status: 401, error: "unauthenticated" };
  if (!context.emailVerified) return { ok: false, status: 403, error: "email_unverified" };

  const store = resolveAuthorizedStore(context, requested);
  if (!store) return { ok: false, status: 404, error: "not_found" };
  if (store.storeStatus === "SUSPENDED") return { ok: false, status: 403, error: "suspended" };
  if (store.storeStatus === "REJECTED") return { ok: false, status: 403, error: "rejected" };

  if (FINANCE_ACTIONS.has(action) && !canSeeFinance(store.role)) {
    return { ok: false, status: 403, error: "forbidden" };
  }
  if (OWNER_ACTIONS.has(action) && !canTransferOwnership(store.role)) {
    return { ok: false, status: 403, error: "forbidden" };
  }
  if (action === "manage_team" && store.role === "operator") {
    return { ok: false, status: 403, error: "forbidden" };
  }
  if (action === "manage" && store.role === "operator") {
    return { ok: false, status: 403, error: "forbidden" };
  }

  return { ok: true, store, platform: canAccessPlatform(context) };
}

export function authorizePlatform(context: AuthContext | null): AccessDecision {
  if (!context) return { ok: false, status: 401, error: "unauthenticated" };
  if (!canAccessPlatform(context)) return { ok: false, status: 403, error: "forbidden" };
  return {
    ok: true,
    store: context.memberships[0] ?? {
      organizationId: "",
      storeId: "",
      storeSlug: "",
      storeStatus: "DRAFT",
      role: "owner",
    },
    platform: true,
  };
}

export function rejectRoleEscalation(current: StoreRole, requested?: string | null): boolean {
  if (!requested) return false;
  if (requested === current) return false;
  if (requested === "platform_admin") return true;
  if (current === "operator" && (requested === "admin" || requested === "owner")) return true;
  if (current === "admin" && requested === "owner") return true;
  return false;
}
