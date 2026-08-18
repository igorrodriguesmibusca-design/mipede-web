export const STORE_ROLES = ["owner", "admin", "operator"] as const;
export type StoreRole = (typeof STORE_ROLES)[number];

export const PLATFORM_ROLES = ["platform_owner", "platform_admin"] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];
export const PLATFORM_ROLE = "platform_admin" as const;

export const STORE_STATUS = [
  "DRAFT",
  "PENDING_REVIEW",
  "APPROVED",
  "ACTIVE",
  "SUSPENDED",
  "REJECTED",
] as const;
export type StoreStatus = (typeof STORE_STATUS)[number];

export const PROVISIONING_STATUS = [
  "NOT_STARTED",
  "PENDING",
  "IN_PROGRESS",
  "READY",
  "FAILED",
] as const;
export type ProvisioningStatus = (typeof PROVISIONING_STATUS)[number];

export const RESERVED_SLUGS = [
  "admin",
  "gestor",
  "api",
  "plataforma",
  "preview",
  "login",
  "entrar",
  "cadastro",
  "onboarding",
  "www",
  "app",
  "static",
  "assets",
] as const;

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug as (typeof RESERVED_SLUGS)[number]);
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 3 && slug.length <= 48 && !isReservedSlug(slug);
}

export type AuthContext = {
  userId: string;
  email: string;
  emailVerified: boolean;
  platformRole: PlatformRole | null;
  memberships: Array<{
    organizationId: string;
    storeId: string;
    storeSlug: string;
    storeStatus: StoreStatus;
    role: StoreRole;
  }>;
};

export function canManageTeam(role: StoreRole): boolean {
  return role === "owner" || role === "admin";
}

export function canSeeFinance(role: StoreRole): boolean {
  return role === "owner" || role === "admin";
}

export function canOperateOrders(role: StoreRole): boolean {
  return role === "owner" || role === "admin" || role === "operator";
}

export function canTransferOwnership(role: StoreRole): boolean {
  return role === "owner";
}

export function canDeleteOrganization(role: StoreRole): boolean {
  return role === "owner";
}

export function canAccessPlatform(context: AuthContext): boolean {
  return context.platformRole === "platform_owner" || context.platformRole === "platform_admin";
}

export function isPlatformOwner(role: PlatformRole | null | undefined): boolean {
  return role === "platform_owner";
}

export function resolveAuthorizedStore(
  context: AuthContext,
  requested: { storeId?: string; organizationId?: string; slug?: string },
): AuthContext["memberships"][number] | null {
  if (requested.storeId || requested.organizationId || requested.slug) {
    return (
      context.memberships.find((item) => {
        const storeOk = requested.storeId ? item.storeId === requested.storeId : true;
        const orgOk = requested.organizationId ? item.organizationId === requested.organizationId : true;
        const slugOk = requested.slug ? item.storeSlug === requested.slug : true;
        return storeOk && orgOk && slugOk;
      }) ?? null
    );
  }
  return context.memberships[0] ?? null;
}

const FORBIDDEN_MASS_ASSIGN = [
  "role",
  "isPlatformAdmin",
  "platformRole",
  "platform_owner",
  "approvedAt",
  "approvedBy",
  "organizationId",
  "ownerUserId",
  "status",
  "provisioningStatus",
] as const;

export function rejectMassAssignment(input: Record<string, unknown>, allowed: string[]): string[] {
  return Object.keys(input).filter((key) => !allowed.includes(key) || FORBIDDEN_MASS_ASSIGN.includes(key as (typeof FORBIDDEN_MASS_ASSIGN)[number]));
}

export function stripForbiddenFields<T extends Record<string, unknown>>(input: T, allowed: string[]): Partial<T> {
  const next: Partial<T> = {};
  for (const key of allowed) {
    if (key in input && !FORBIDDEN_MASS_ASSIGN.includes(key as (typeof FORBIDDEN_MASS_ASSIGN)[number])) {
      next[key as keyof T] = input[key] as T[keyof T];
    }
  }
  return next;
}
