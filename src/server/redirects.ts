import type { StoreRole, StoreStatus } from "./roles";

const ALLOWED_PREFIXES = [
  "/admin",
  "/gestor/",
  "/onboarding",
  "/plataforma/estabelecimentos",
  "/auth/continuar",
] as const;

export function isSafeInternalPath(input: string | null | undefined): boolean {
  if (!input) return false;
  if (!input.startsWith("/")) return false;
  if (input.startsWith("//") || input.includes("://") || input.includes("\\")) return false;
  const path = input.split("?")[0] ?? "";
  if (path === "/gestor") return true;
  return ALLOWED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function sanitizeRequestedPath(input: string | null | undefined): string | null {
  if (!isSafeInternalPath(input)) return null;
  return (input ?? "").split("?")[0] ?? null;
}

export function resolvePostAuthDestination(input: {
  platformAdmin: boolean;
  store: {
    slug: string;
    role: StoreRole;
    status: StoreStatus;
    onboardingStatus: string;
  } | null;
  requested?: string | null;
}): string {
  const canonical = canonicalDestination(input);
  const requested = sanitizeRequestedPath(input.requested);
  if (!requested) return canonical;
  if (!canUseRequestedPath(input, requested)) return canonical;
  return requested;
}

export function canonicalDestination(input: {
  platformAdmin: boolean;
  store: {
    slug: string;
    role: StoreRole;
    status: StoreStatus;
    onboardingStatus: string;
  } | null;
}): string {
  if (input.platformAdmin) return "/plataforma/estabelecimentos";
  if (!input.store) return "/onboarding/empresa";
  if (input.store.role === "operator") return `/gestor/${input.store.slug}`;
  if (input.store.status === "DRAFT") {
    if (input.store.onboardingStatus === "company") return "/onboarding/operacao";
    if (input.store.onboardingStatus === "operation") return "/onboarding/identidade";
    if (input.store.onboardingStatus === "identity") return "/onboarding/revisao";
    if (input.store.onboardingStatus !== "submitted") return "/onboarding/empresa";
  }
  return "/admin/desempenho";
}

function canUseRequestedPath(
  input: {
    platformAdmin: boolean;
    store: { slug: string; role: StoreRole } | null;
  },
  path: string,
): boolean {
  if (path.startsWith("/plataforma")) return input.platformAdmin;
  if (path.startsWith("/admin")) return input.store?.role === "owner" || input.store?.role === "admin";
  if (path.startsWith("/gestor")) {
    if (!input.store) return false;
    return path === `/gestor/${input.store.slug}` || path.startsWith(`/gestor/${input.store.slug}/`);
  }
  return path.startsWith("/onboarding") || path === "/auth/continuar";
}
